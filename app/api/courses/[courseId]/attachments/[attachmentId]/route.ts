import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { utapi } from "@/lib/utapi";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: { courseId: string; attachmentId: string } },
) {
  try {
    const { userId } = await auth();

    if (!userId || !isTeacher(userId))
      return new NextResponse("Unauthorized!", { status: 401 });

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!courseOwner) return new NextResponse("Unauthorized!", { status: 401 });

    const attachment = await db.attachment.delete({
      where: { id: params.attachmentId, courseId: params.courseId },
    });

    const attachmentKey = attachment.url.split("/").pop();
    if (attachmentKey) await utapi.deleteFiles(attachmentKey);

    return new NextResponse("Attachment deleted!", { status: 200 });
  } catch (error) {
    console.log("[ATTACHMENT_ID]", error);
    return new NextResponse("Internal server error!", { status: 500 });
  }
}
