import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import { trainedModelsTable, trainedModelAssignmentsTable, trainedModelGroupsTable } from '@/db/schema/trained-models';
import { eq, or } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Get all models that are assigned to this user
    // This includes: 1) Models with assignToAll = true, 2) Models specifically assigned to this user
    const assignedModels = await db
      .select({
        id: trainedModelsTable.id,
        externalId: trainedModelsTable.externalId,
        name: trainedModelsTable.name,
        type: trainedModelsTable.type,
        groupName: trainedModelGroupsTable.name,
        isPublished: trainedModelsTable.isPublished,
        assignToAll: trainedModelsTable.assignToAll,
      })
      .from(trainedModelsTable)
      .leftJoin(
        trainedModelGroupsTable,
        eq(trainedModelsTable.groupId, trainedModelGroupsTable.id)
      )
      .where(
        or(
          eq(trainedModelsTable.assignToAll, true),
          eq(trainedModelAssignmentsTable.userId, userId)
        )
      )
      .leftJoin(
        trainedModelAssignmentsTable,
        eq(trainedModelsTable.id, trainedModelAssignmentsTable.trainedModelId)
      );

    // Remove duplicates (models that appear twice due to join)
    const uniqueModels = Array.from(
      new Map(assignedModels.map(model => [model.id, model])).values()
    );

    return NextResponse.json(uniqueModels);
  } catch (error) {
    console.error('Error fetching assigned models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned models' },
      { status: 500 }
    );
  }
}