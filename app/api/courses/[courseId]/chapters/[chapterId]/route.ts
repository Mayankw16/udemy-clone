import Mux from "@mux/mux-node";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { utapi } from "@/lib/utapi";
import * as z from "zod";

const { video } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function DELETE(
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
      where: { id: params.chapterId, courseId: params.courseId },
    });

    if (!chapter) return new NextResponse("Not Found!", { status: 404 });

    if (!chapter.videoUrl) {
      const existingMuxData = await db.muxData.findUnique({
        where: {
          chapterId: params.chapterId,
        },
      });

      if (existingMuxData) {
        await video.assets.delete(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: { id: params.chapterId },
    });

    if (deletedChapter.isPublished && courseOwner.isPublished) {
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

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}

// Schema for validation
const chapterSchema = z.object({
  title: z.string().min(1, "Title is required!").optional(),
  description: z.string().nullable().optional(),
  videoUrl: z.string().url("Invaid URL!").nullable().optional(),
  isFree: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = await auth();
    const values = await req.json();

    if (!userId) return new NextResponse("Unauthorized!", { status: 401 });

    const validation = chapterSchema.safeParse(values);

    if (!validation.success)
      return new NextResponse("Invalid JSON data in request body!", {
        status: 400,
      });

    const courseOwner = await db.course.findUnique({
      where: { id: params.courseId, userId },
    });

    if (!courseOwner) return new NextResponse("Unauthorized!", { status: 401 });

    let videoUrl;

    if (values.videoUrl) {
      const chapterBeforeUpdation = await db.chapter.findUnique({
        where: { id: params.chapterId, courseId: params.courseId },
        select: { videoUrl: true },
      });

      videoUrl = chapterBeforeUpdation?.videoUrl;
    }

    const chapter = await db.chapter.update({
      where: { id: params.chapterId, courseId: params.courseId },
      data: values,
    });

    if (videoUrl) utapi.deleteFiles(videoUrl.split("/").pop()!);

    if (values.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: { chapterId: params.chapterId },
      });

      if (existingMuxData) {
        try {
          await video.assets.delete(existingMuxData.assetId);
        } catch (error) {
          console.log("[ERROR_DELETING_ASSET]", error);
        }
        await db.muxData.delete({ where: { id: existingMuxData.id } });
      }

      const asset = await video.assets.create({
        input: [{ url: values.videoUrl }],
        playback_policy: ["public"],
      });

      await db.muxData.create({
        data: {
          chapterId: params.chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}
