import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import { trainedModelsTable, trainedModelAssignmentsTable } from '@/db/schema/trained-models';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { modelIds } = body;

    if (!Array.isArray(modelIds)) {
      return NextResponse.json(
        { error: 'modelIds must be an array' },
        { status: 400 }
      );
    }

    // Remove existing assignments for this user
    await db
      .delete(trainedModelAssignmentsTable)
      .where(eq(trainedModelAssignmentsTable.userId, userId));

    // Add new assignments (skip models that are assignToAll: true)
    if (modelIds.length > 0) {
      // Get models to check assignToAll status
      const models = await db
        .select({
          id: trainedModelsTable.id,
          assignToAll: trainedModelsTable.assignToAll,
        })
        .from(trainedModelsTable)
        .where(eq(trainedModelsTable.isPublished, true));

      const modelsMap = new Map(models.map(m => [m.id, m]));
      
      // Only assign models that are not auto-assigned to all
      const assignments = modelIds
        .filter(modelId => {
          const model = modelsMap.get(modelId);
          return model && !model.assignToAll;
        })
        .map(modelId => ({
          trainedModelId: modelId,
          userId,
          assignedBy: session.user.id,
        }));

      if (assignments.length > 0) {
        await db
          .insert(trainedModelAssignmentsTable)
          .values(assignments);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Models assigned to user successfully`
    });
  } catch (error) {
    console.error('Error assigning models:', error);
    return NextResponse.json(
      { error: 'Failed to assign models' },
      { status: 500 }
    );
  }
}