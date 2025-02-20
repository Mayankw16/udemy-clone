import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";
import * as z from "zod";
import { utapi } from "@/lib/utapi";

const { video } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized!", { status: 401 });

    const course = await db.course.findUnique({
      where: { id: params.courseId, userId },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
      },
    });

    if (!course) return new NextResponse("Not Found!", { status: 404 });

    for (const chapter of course.chapters) {
      if (chapter.muxData?.assetId)
        await video.assets.delete(chapter.muxData.assetId);
    }

    await db.course.delete({
      where: { id: params.courseId },
    });

    return new NextResponse("Course deleted!", { status: 200 });
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}

// Schema for validation
const courseSchema = z.object({
  title: z.string().min(1, "Title is required!").optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url("Invaid URL!").nullable().optional(),
  price: z
    .number()
    .min(0, "Price must be a positive number!")
    .nullable()
    .optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    const { courseId } = params;
    const values = await req.json();

    if (!userId) return new NextResponse("Unauthorized!", { status: 401 });

    const validation = courseSchema.safeParse(values);

    if (!validation.success)
      return new NextResponse("Invalid JSON data in request body!", {
        status: 400,
      });

    if (values.title) {
      const existingCourse = await db.course.findFirst({
        where: {
          userId,
          title: { equals: values.title, mode: "insensitive" },
          id: { not: courseId },
        },
      });

      if (existingCourse)
        return new NextResponse("Course with this title already exists!", {
          status: 400,
        });
    }

    let imageUrl;

    if (values.imageUrl) {
      const courseBeforeUpdation = await db.course.findUnique({
        where: { id: courseId, userId },
        select: { imageUrl: true },
      });

      imageUrl = courseBeforeUpdation?.imageUrl;
    }

    const course = await db.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: values,
    });

    if (imageUrl) utapi.deleteFiles(imageUrl.split("/").pop()!);

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
