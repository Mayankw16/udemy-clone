"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import MuxPlayer from "@mux/mux-player-react";
import { Pencil, PlusCircle, Video } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { MuxData } from "@prisma/client";

interface ChapterVideoFormProps {
  videoUrl: string | null;
  muxData: MuxData | null;
  chapterId: string;
  courseId: string;
}

export const ChapterVideoForm = ({
  videoUrl,
  muxData,
  chapterId,
  courseId,
}: ChapterVideoFormProps) => {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async ({ videoUrl }: { videoUrl: string }) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        videoUrl,
      });
      toast.success("Video updated!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="flex items-center justify-between font-medium">
        Chapter video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && "Cancel"}
          {!isEditing && !videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-1" />
              Add a video
            </>
          )}
          {!isEditing && !!videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-1" />
              Edit video
            </>
          )}
        </Button>
      </div>
      {!isEditing && !videoUrl && (
        <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
          <Video className="h-10 w-10 text-slate-500" />
        </div>
      )}
      {!isEditing && !!videoUrl && (
        <>
          <div className="relative aspect-video mt-2">
            <MuxPlayer playbackId={muxData?.playbackId || undefined} />
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Videos can take a few minutes to process. Referesh the page if video
            does not appear.
          </div>
        </>
      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="chapterVideo"
            onChange={(url) => {
              if (url) onSubmit({ videoUrl: url });
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Upload this chapter&apos;s video
          </div>
        </div>
      )}
    </div>
  );
};
