import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import * as z from "zod";

const AttachmentSchema = z.object({
  url: z.string().url("Invalid URL format!"),
  name: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    if (!userId) return new NextResponse("Unauthorized!", { status: 401 });

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!courseOwner) return new NextResponse("Unauthorized!", { status: 401 });

    const parsedBody = AttachmentSchema.safeParse(body);

    if (!parsedBody.success)
      return new NextResponse("Invalid JSON data in request body!", {
        status: 400,
      });

    const { url, name } = body;

    const attchment = await db.attachment.create({
      data: {
        url,
        name: name || url.split("/").pop(),
        courseId: params.courseId,
      },
    });

    return NextResponse.json(attchment);
  } catch (error) {
    console.log("[COURSE_ID_ATTACHMENTS]", error);
    return new NextResponse("Internal server error!", { status: 500 });
  }
}
