import { auth } from "@clerk/nextjs/server";
import { isTeacher } from "@/lib/teacher";
import { NextResponse } from "next/server";
import { utapi } from "@/lib/utapi";

export async function DELETE(
  req: Request,
  { params }: { params: { fileKey: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId || !isTeacher(userId))
      return new NextResponse("Unauthorized!", { status: 401 });

    const { fileKey } = params;
    await utapi.deleteFiles(fileKey);

    return new NextResponse("File deleted!", { status: 200 });
  } catch (error) {
    console.log("[DELETE_FILE]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}
