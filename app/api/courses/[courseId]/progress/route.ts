import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized!", { status: 401 });

    const { courseId } = params;

    const publishedChapters = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      select: { id: true },
    });

    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

    const completedChapters = await db.userProgress.count({
      where: {
        userId,
        chapterId: { in: publishedChapterIds },
        isCompleted: true,
      },
    });

    const progressPercentage =
      (completedChapters / publishedChapterIds.length) * 100;

    return NextResponse.json({ progress: progressPercentage });
  } catch (error) {
    console.log("[GET_PROGRESS]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}
