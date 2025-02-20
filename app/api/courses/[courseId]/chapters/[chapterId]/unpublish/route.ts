import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized!", { status: 401 });

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!course) return new NextResponse("Unauthorized!", { status: 401 });

    await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: { isPublished: false },
    });

    if (course.isPublished) {
      const remainingPublishedChapters = await db.chapter.findMany({
        where: {
          courseId: params.courseId,
          isPublished: true,
        },
      });

      if (!remainingPublishedChapters.length) {
        await db.course.update({
          where: { id: params.courseId },
          data: { isPublished: false },
        });
      }
    }

    return new NextResponse("Chapter unpublished!", { status: 200 });
  } catch (error) {
    console.log("[CHAPTER_UNPUBLISH]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}
