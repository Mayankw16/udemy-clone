import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized!", { status: 401 });

    const course = await db.course.findUnique({
      where: { id: params.courseId, userId },
    });

    if (!course) return new NextResponse("Not Found!", { status: 404 });

    await db.course.update({
      where: { id: params.courseId },
      data: { isPublished: false },
    });

    return new NextResponse("Course unpublished!", { status: 200 });
  } catch (error) {
    console.log("[COURSE_ID_UNPUBLISH]", error);
    return new NextResponse("Internal Server Error!");
  }
}
