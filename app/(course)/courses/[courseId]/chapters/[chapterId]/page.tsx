import { getChapterDetails } from "@/actions/get-chapter-details";
import { Banner } from "@/components/banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { VideoPlayer } from "./_components/video-player";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { CourseProgressButton } from "./_components/course-progress-button";
import { File } from "lucide-react";

const ChapterIdPage = async ({
  params: { chapterId, courseId },
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  const {
    course,
    chapter,
    muxData,
    purchase,
    attachments,
    userProgress,
    nextChapter,
  } = await getChapterDetails({ userId, chapterId, courseId });

  if (!chapter || !course) return redirect("/");

  const isLocked = !chapter.isFree && !purchase;
  const completeOnEnd = !!purchase && !userProgress?.isCompleted;

  return (
    <div>
      {userProgress?.isCompleted && (
        <Banner variant="success" label="You already completed this chapter." />
      )}
      {isLocked && (
        <Banner
          variant="warning"
          label="You need to purchase this course to watch this chapter."
        />
      )}
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4">
          <VideoPlayer
            chapterId={chapterId}
            title={chapter.title}
            isLocked={isLocked}
            playbackId={muxData?.playbackId || ""}
            completeOnEnd={completeOnEnd}
            nextChapterId={nextChapter?.id}
            courseId={courseId}
          />
        </div>
        <div>
          <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-y-5 mb-2">
            <h2 className="text-2xl font-semibold">{chapter.title}</h2>
            {purchase ? (
              <CourseProgressButton
                chapterId={chapterId}
                courseId={courseId}
                nextChapterId={nextChapter?.id}
                isCompleted={userProgress?.isCompleted}
              />
            ) : (
              <CourseEnrollButton courseId={courseId} price={course.price!} />
            )}
          </div>
          <Separator />
          <div>
            <Preview value={chapter.description!} />
          </div>
          {!!attachments.length && (
            <>
              <Separator className="mb-4" />
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">
                  Course Attachments
                </h2>
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    className="mb-2 flex items-center gap-x-2 p-3 w-full border text-purple-700 rounded-md hover:underline"
                  >
                    <File />
                    <p className="line-clamp-1">{attachment.name}</p>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterIdPage;
