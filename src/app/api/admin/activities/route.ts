import { db } from '@/db';
import { activityLogTable } from '@/db/schema/activity-log';
import { usersTable } from '@/db/schema/auth';
import { desc, eq, and, sql, gte } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userName = searchParams.get('userName');
    const email = searchParams.get('email');
    const date = searchParams.get('date');

    // Build the query
    let query = db
      .select({
        id: activityLogTable.id,
        userId: activityLogTable.userId,
        activityType: activityLogTable.activityType,
        description: activityLogTable.description,
        metadata: activityLogTable.metadata,
        createdAt: activityLogTable.createdAt,
        userName: usersTable.name,
        userEmail: usersTable.email,
      })
      .from(activityLogTable)
      .leftJoin(usersTable, eq(activityLogTable.userId, usersTable.id))
      .orderBy(desc(activityLogTable.createdAt));

    // Apply filters
    const conditions = [];
    
    if (userName) {
      conditions.push(sql`LOWER(${usersTable.name}) LIKE LOWER(${`%${userName}%`})`);
    }
    
    if (email) {
      conditions.push(sql`LOWER(${usersTable.email}) LIKE LOWER(${`%${email}%`})`);
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      conditions.push(
        and(
          gte(activityLogTable.createdAt, startOfDay),
          sql`${activityLogTable.createdAt} <= ${endOfDay}`
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const activities = await query;

    // Format the data
    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      userId: activity.userId,
      userName: activity.userName || 'N/A',
      email: activity.userEmail || 'N/A',
      activityType: activity.activityType,
      description: activity.description,
      createdAt: activity.createdAt?.toISOString() || null,
      tokensUsed: (activity.metadata as any)?.tokens_used || 0,
      generationTime: (activity.metadata as any)?.generation_time || null,
      modelName: (activity.metadata as any)?.model_name || null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedActivities,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}