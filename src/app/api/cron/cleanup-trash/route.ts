import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and, isNotNull, lt } from "drizzle-orm";
import { generateTable } from "@/db/schema/generate";
import { generatedImagesTable } from "@/db/schema/generated-images";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Strict auth check for production
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("❌ CRON_SECRET environment variable not configured");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 },
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("⚠️ Unauthorized cron attempt");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    console.log("🚀 Starting trash cleanup...");

    // Calculate date 10 days ago
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    console.log("🗑️ Deleting items older than:", tenDaysAgo.toISOString());

    // Delete items in trash for more than 10 days
    const [generationsResult, imagesResult] = await Promise.all([
      db
        .delete(generateTable)
        .where(
          and(
            eq(generateTable.softDelete, true),
            isNotNull(generateTable.softDeletedAt),
            lt(generateTable.softDeletedAt, tenDaysAgo),
          ),
        ),
      db
        .delete(generatedImagesTable)
        .where(
          and(
            eq(generatedImagesTable.isDiscarded, true),
            isNotNull(generatedImagesTable.discardedAt),
            lt(generatedImagesTable.discardedAt, tenDaysAgo),
          ),
        ),
    ]);

    const deletedGenerationsCount = generationsResult.rowCount ?? 0;
    const deletedImagesCount = imagesResult.rowCount ?? 0;

    console.log(
      "✅ Cleanup completed. Deleted",
      deletedGenerationsCount,
      "generations and",
      deletedImagesCount,
      "images",
    );

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedGenerationsCount} old generations and ${deletedImagesCount} old images from trash`,
      deletedCount: {
        generations: deletedGenerationsCount,
        images: deletedImagesCount,
      },
      cutoffDate: tenDaysAgo.toISOString(),
    });
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Cleanup failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
