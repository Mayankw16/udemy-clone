import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const { title } = await req.json();

    if (!userId || !isTeacher(userId))
      return new NextResponse("Unauthorized!", { status: 401 });

    if (!title) return new NextResponse("Title is required!", { status: 400 });

    const existingCourse = await db.course.findFirst({
      where: { userId, title: { equals: title, mode: "insensitive" } },
    });

    if (existingCourse)
      return new NextResponse("Course with this title already exists!", {
        status: 400,
      });

    const course = await db.course.create({
      data: { userId, title },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}
