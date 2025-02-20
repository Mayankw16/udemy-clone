import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; attachmentId: string } }
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

    await db.attachment.delete({
      where: { id: params.attachmentId, courseId: params.courseId },
    });

    return new NextResponse("Attachment deleted!", { status: 200 });
  } catch (error) {
    console.log("[ATTACHMENT_ID]", error);
    return new NextResponse("Internal server error!", { status: 500 });
  }
}
