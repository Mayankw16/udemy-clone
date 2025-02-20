import { db } from "@/lib/db";
import { Attachment, Chapter } from "@prisma/client";
import { updateMuxAsset } from "./update-mux-asset";

interface GetChapterDetailsParams {
  userId: string;
  chapterId: string;
  courseId: string;
}

export const getChapterDetails = async ({
  userId,
  chapterId,
  courseId,
}: GetChapterDetailsParams) => {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId, isPublished: true },
      select: { price: true },
    });

    const chapter = await db.chapter.findUnique({
      where: { id: chapterId, isPublished: true },
    });

    if (!chapter || !course) throw new Error("Chapter or course not found!");

    const purchase = await db.purchase.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    let muxData = null;
    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;

    if (purchase)
      attachments = await db.attachment.findMany({
        where: { courseId },
      });

    if (chapter.isFree || purchase)
      muxData = await db.muxData.findUnique({ where: { chapterId } });

    if (muxData?.updatedAt) {
      const lastUpdated = new Date(muxData.updatedAt);
      const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000);

      if (twentyThreeHoursAgo > lastUpdated)
        muxData = await updateMuxAsset(chapter.id);
    }

    nextChapter = await db.chapter.findFirst({
      where: {
        courseId,
        isPublished: true,
        userProgress: { none: { userId, isCompleted: true } },
        position: { gt: chapter.position },
      },
      orderBy: { position: "asc" },
    });

    const userProgress = await db.userProgress.findUnique({
      where: { userId_chapterId: { userId, chapterId } },
    });

    return {
      chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };
  } catch (error) {
    console.log("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: null,
      nextChapter: null,
      userProgress: null,
      purchase: null,
    };
  }
};
