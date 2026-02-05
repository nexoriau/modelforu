import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import { 
    trainedModelsTable, 
    trainedModelAssignmentsTable,
    trainedModelGroupsTable 
} from '@/db/schema/trained-models';
import { eq, and, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as 'photo' | 'video' | 'audio' | null;
        
        const userId = session.user.id;

        // Get models that are:
        // 1. Published (isPublished = true)
        // 2. Either assignToAll = true OR specifically assigned to this user
        // 3. Optional type filter
        const conditions = [
            eq(trainedModelsTable.isPublished, true),
            or(
                eq(trainedModelsTable.assignToAll, true),
                eq(trainedModelAssignmentsTable.userId, userId)
            )
        ];

        if (type) {
            conditions.push(eq(trainedModelsTable.type, type));
        }

        const models = await db
            .select({
                id: trainedModelsTable.id,
                externalId: trainedModelsTable.externalId,
                name: trainedModelsTable.name,
                type: trainedModelsTable.type,
                groupName: trainedModelGroupsTable.name,
                isPublished: trainedModelsTable.isPublished,
                assignToAll: trainedModelsTable.assignToAll,
                style: trainedModelsTable.style,
            })
            .from(trainedModelsTable)
            .leftJoin(
                trainedModelGroupsTable,
                eq(trainedModelsTable.groupId, trainedModelGroupsTable.id)
            )
            .leftJoin(
                trainedModelAssignmentsTable,
                and(
                    eq(trainedModelsTable.id, trainedModelAssignmentsTable.trainedModelId),
                    eq(trainedModelAssignmentsTable.userId, userId)
                )
            )
            .where(and(...conditions))
            .groupBy(
                trainedModelsTable.id,
                trainedModelGroupsTable.name,
                trainedModelsTable.externalId,
                trainedModelsTable.name,
                trainedModelsTable.type,
                trainedModelsTable.isPublished,
                trainedModelsTable.assignToAll,
                trainedModelsTable.style
            )
            .orderBy(trainedModelsTable.name);

        // Remove duplicates
        const uniqueModels = Array.from(
            new Map(models.map(model => [model.id, model])).values()
        );

        return NextResponse.json(uniqueModels);
    } catch (error) {
        console.error('Error fetching user trained models:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trained models' },
            { status: 500 }
        );
    }
}