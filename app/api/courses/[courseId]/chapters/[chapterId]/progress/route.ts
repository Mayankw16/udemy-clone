import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params: { chapterId } }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = await auth();
    const { isCompleted } = await req.json();

    if (!userId) return new NextResponse("Unauthorized!", { status: 401 });

    if (typeof isCompleted !== "boolean")
      return new NextResponse("Invalid JSON data in request body!", {
        status: 400,
      });

    await db.userProgress.upsert({
      where: { userId_chapterId: { userId, chapterId } },
      update: { isCompleted },
      create: { userId, chapterId, isCompleted },
    });

    return new NextResponse("Progress updated!", { status: 200 });
  } catch (error) {
    console.log("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}
