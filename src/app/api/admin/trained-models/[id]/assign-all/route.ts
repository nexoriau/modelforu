import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import { 
  trainedModelsTable, 
  trainedModelAssignmentsTable,
} from '@/db/schema/trained-models';
import { eq, and } from 'drizzle-orm';
import { usersTable } from '@/db/schema';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get current assignments
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get assigned users
    const assignments = await db
      .select({
        userId: trainedModelAssignmentsTable.userId,
        userName: usersTable.name,
        userEmail: usersTable.email,
        assignedAt: trainedModelAssignmentsTable.assignedAt,
        expiresAt: trainedModelAssignmentsTable.expiresAt,
      })
      .from(trainedModelAssignmentsTable)
      .innerJoin(
        usersTable,
        eq(trainedModelAssignmentsTable.userId, usersTable.id)
      )
      .where(eq(trainedModelAssignmentsTable.trainedModelId, id))
      .orderBy(trainedModelAssignmentsTable.assignedAt);

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// PATCH - Update assignments
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { assignToAll } = body;

    if (typeof assignToAll !== 'boolean') {
      return NextResponse.json(
        { error: 'assignToAll must be a boolean' },
        { status: 400 }
      );
    }

    // Check if model exists
    const [model] = await db
      .select({ id: trainedModelsTable.id })
      .from(trainedModelsTable)
      .where(eq(trainedModelsTable.id, id))
      .limit(1);

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Update assignToAll status
    const [updatedModel] = await db
      .update(trainedModelsTable)
      .set({ 
        assignToAll,
        updatedAt: new Date()
      })
      .where(eq(trainedModelsTable.id, id))
      .returning();

    // If setting assignToAll to true, clear all specific assignments
    if (assignToAll) {
      await db
        .delete(trainedModelAssignmentsTable)
        .where(eq(trainedModelAssignmentsTable.trainedModelId, id));
    }

    return NextResponse.json({ 
      success: true,
      model: updatedModel,
      message: assignToAll 
        ? 'Model assigned to all users (cleared specific assignments)' 
        : 'Model removed from all users'
    });
  } catch (error) {
    console.error('Error updating assignToAll:', error);
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}