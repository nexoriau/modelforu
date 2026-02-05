import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import { 
  trainedModelsTable, 
  trainedModelAssignmentsTable,
} from '@/db/schema/trained-models';
import { eq } from 'drizzle-orm';
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

// POST/PATCH - Update specific user assignments
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'userIds must be an array' },
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

    // IMPORTANT: When assigning specific users, set assignToAll to false
    await db
      .update(trainedModelsTable)
      .set({ 
        assignToAll: false,
        updatedAt: new Date()
      })
      .where(eq(trainedModelsTable.id, id));

    // Remove all existing assignments
    await db
      .delete(trainedModelAssignmentsTable)
      .where(eq(trainedModelAssignmentsTable.trainedModelId, id));

    // Add new assignments
    if (userIds.length > 0) {
      const assignments = userIds.map(userId => ({
        trainedModelId: id,
        userId,
        assignedBy: session.user.id,
      }));

      await db
        .insert(trainedModelAssignmentsTable)
        .values(assignments);
    }

    return NextResponse.json({ 
      success: true,
      message: `Assigned model to ${userIds.length} user${userIds.length !== 1 ? 's' : ''}`
    });
  } catch (error) {
    console.error('Error updating assignments:', error);
    return NextResponse.json(
      { error: 'Failed to update assignments' },
      { status: 500 }
    );
  }
}