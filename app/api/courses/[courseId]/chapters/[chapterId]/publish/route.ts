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

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!courseOwner) return new NextResponse("Unauthorized!", { status: 401 });

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      include: { muxData: true },
    });

    if (
      !chapter ||
      !chapter.muxData ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl
    )
      return new NextResponse("Missing required fields", { status: 400 });

    await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: { isPublished: true },
    });

    return new NextResponse("Chapter published!", { status: 200 });
  } catch (error) {
    console.log("[CHAPTER_PUBLISH]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}
