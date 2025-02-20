import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import * as z from "zod";

const ListItemSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().nonnegative(),
});

const ListSchema = z.array(ListItemSchema);

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
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

    const { list } = await req.json();

    const parsedList = ListSchema.safeParse(list);

    if (!parsedList.success)
      return new NextResponse("Invalid data format!", { status: 400 });

    const chapterIds = parsedList.data.map((item) => item.id);

    const existingChapters = await db.chapter.findMany({
      where: { id: { in: chapterIds } },
      select: { id: true },
    });

    const existingChapterIds = new Set(
      existingChapters.map((chapter) => chapter.id)
    );

    const missingChapters = chapterIds.filter(
      (id) => !existingChapterIds.has(id)
    );

    if (missingChapters.length > 0)
      return new NextResponse(
        `Some chapters do not exist: ${missingChapters.join(", ")}`,
        { status: 400 }
      );

    await Promise.all(
      parsedList.data.map((item) =>
        db.chapter.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[REORDER]", error);
    return new NextResponse("Internal server error!", { status: 500 });
  }
}
