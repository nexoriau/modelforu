import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import { trainedModelGroupsTable, trainedModelsTable } from '@/db/schema/trained-models';
import { eq, desc } from 'drizzle-orm';

// GET - List all groups
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groups = await db
      .select()
      .from(trainedModelGroupsTable)
      .orderBy(desc(trainedModelGroupsTable.createdAt));

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST - Create new group
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [group] = await db
      .insert(trainedModelGroupsTable)
      .values({
        name: body.name,
        type: body.type,
        description: body.description || null,
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      group,
      message: 'Group created successfully' 
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}

// PUT - Update group
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [group] = await db
      .update(trainedModelGroupsTable)
      .set({
        name: body.name,
        description: body.description || null,
        updatedAt: new Date(),
      })
      .where(eq(trainedModelGroupsTable.id, body.id))
      .returning();

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      group,
      message: 'Group updated successfully' 
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

// DELETE - Delete group
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    // Check if group has trained models (NOT regular models)
    const modelsInGroup = await db
      .select({ id: trainedModelsTable.id })
      .from(trainedModelsTable)
      .where(eq(trainedModelsTable.groupId, id))
      .limit(1);

    if (modelsInGroup.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete group with assigned trained models' },
        { status: 400 }
      );
    }

    await db
      .delete(trainedModelGroupsTable)
      .where(eq(trainedModelGroupsTable.id, id));

    return NextResponse.json({ 
      success: true,
      message: 'Group deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
