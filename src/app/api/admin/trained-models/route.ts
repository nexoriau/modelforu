import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import { trainedModelsTable, trainedModelGroupsTable } from '@/db/schema/trained-models';
import { eq, and, desc } from 'drizzle-orm';

// GET - List all trained models
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const groupId = searchParams.get('groupId');

    const conditions = [];
    if (type) {
      conditions.push(eq(trainedModelsTable.type, type as any));
    }
    if (groupId) {
      conditions.push(eq(trainedModelsTable.groupId, groupId));
    }

    const models = await db
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
        createdAt: trainedModelsTable.createdAt,
        updatedAt: trainedModelsTable.updatedAt,
      })
      .from(trainedModelsTable)
      .leftJoin(
        trainedModelGroupsTable,
        eq(trainedModelsTable.groupId, trainedModelGroupsTable.id)
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(trainedModelsTable.createdAt));

    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching trained models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trained models' },
      { status: 500 }
    );
  }
}

// POST - Create new trained model
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.externalId || !body.name || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if externalId already exists
    const existing = await db
      .select({ id: trainedModelsTable.id })
      .from(trainedModelsTable)
      .where(eq(trainedModelsTable.externalId, body.externalId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'External ID already exists' },
        { status: 409 }
      );
    }

    // Create the model
    const [model] = await db
      .insert(trainedModelsTable)
      .values({
        externalId: body.externalId,
        name: body.name,
        type: body.type,
        groupId: body.groupId || null,
        style: body.style || null,
        sampleText: body.sampleText || null,
        voiceFileUrl: body.voiceFileUrl || null,
        previewImageUrl: body.previewImageUrl || null,
        description: body.description || null,
        apiConfig: body.apiConfig || '{}',
        isPublished: body.isPublished || false,
        assignToAll: body.assignToAll || false,
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      model,
      message: 'Trained model created successfully' 
    });
  } catch (error) {
    console.error('Error creating trained model:', error);
    return NextResponse.json(
      { error: 'Failed to create trained model' },
      { status: 500 }
    );
  }
}