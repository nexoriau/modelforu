import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import { trainedModelsTable, trainedModelGroupsTable } from '@/db/schema/trained-models';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single trained model
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [model] = await db
      .select({
        id: trainedModelsTable.id,
        externalId: trainedModelsTable.externalId,
        name: trainedModelsTable.name,
        type: trainedModelsTable.type,
        groupId: trainedModelsTable.groupId,
        groupName: trainedModelGroupsTable.name,
        style: trainedModelsTable.style,
        sampleText: trainedModelsTable.sampleText,
        voiceFileUrl: trainedModelsTable.voiceFileUrl,
        previewImageUrl: trainedModelsTable.previewImageUrl,
        description: trainedModelsTable.description,
        apiConfig: trainedModelsTable.apiConfig,
        isPublished: trainedModelsTable.isPublished,
        assignToAll: trainedModelsTable.assignToAll,
        createdBy: trainedModelsTable.createdBy,
        createdAt: trainedModelsTable.createdAt,
        updatedAt: trainedModelsTable.updatedAt,
      })
      .from(trainedModelsTable)
      .leftJoin(
        trainedModelGroupsTable,
        eq(trainedModelsTable.groupId, trainedModelGroupsTable.id)
      )
      .where(eq(trainedModelsTable.id, id))
      .limit(1);

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json(model);
  } catch (error) {
    console.error('Error fetching trained model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trained model' },
      { status: 500 }
    );
  }
}

// PUT - Update trained model
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if model exists
    const [existing] = await db
      .select({ id: trainedModelsTable.id })
      .from(trainedModelsTable)
      .where(eq(trainedModelsTable.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Check if externalId is being changed and if it already exists
    if (body.externalId) {
      const duplicate = await db
        .select({ id: trainedModelsTable.id })
        .from(trainedModelsTable)
        .where(
          and(
            eq(trainedModelsTable.externalId, body.externalId),
            eq(trainedModelsTable.id, id)
          )
        )
        .limit(1);

      if (duplicate.length === 0) {
        // Check if any other model has this externalId
        const otherWithSameId = await db
          .select({ id: trainedModelsTable.id })
          .from(trainedModelsTable)
          .where(eq(trainedModelsTable.externalId, body.externalId))
          .limit(1);

        if (otherWithSameId.length > 0) {
          return NextResponse.json(
            { error: 'External ID already exists' },
            { status: 409 }
          );
        }
      }
    }

    // Update the model
    const [updated] = await db
      .update(trainedModelsTable)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(trainedModelsTable.id, id))
      .returning();

    return NextResponse.json({ 
      success: true, 
      model: updated,
      message: 'Trained model updated successfully' 
    });
  } catch (error) {
    console.error('Error updating trained model:', error);
    return NextResponse.json(
      { error: 'Failed to update trained model' },
      { status: 500 }
    );
  }
}

// DELETE - Delete trained model
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if model exists
    const [existing] = await db
      .select({ id: trainedModelsTable.id })
      .from(trainedModelsTable)
      .where(eq(trainedModelsTable.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Delete the model (cascade will handle assignments)
    await db
      .delete(trainedModelsTable)
      .where(eq(trainedModelsTable.id, id));

    return NextResponse.json({ 
      success: true,
      message: 'Trained model deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting trained model:', error);
    return NextResponse.json(
      { error: 'Failed to delete trained model' },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (for publish/assign-to-all)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if model exists
    const [existing] = await db
      .select({ id: trainedModelsTable.id })
      .from(trainedModelsTable)
      .where(eq(trainedModelsTable.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Update only provided fields
    const updateData: any = { updatedAt: new Date() };
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    if (body.assignToAll !== undefined) updateData.assignToAll = body.assignToAll;

    const [updated] = await db
      .update(trainedModelsTable)
      .set(updateData)
      .where(eq(trainedModelsTable.id, id))
      .returning();

    return NextResponse.json({ 
      success: true, 
      model: updated,
      message: 'Trained model updated successfully' 
    });
  } catch (error) {
    console.error('Error updating trained model:', error);
    return NextResponse.json(
      { error: 'Failed to update trained model' },
      { status: 500 }
    );
  }
}