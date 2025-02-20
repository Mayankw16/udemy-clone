"use client";

import { useConfettiStore } from "@/hooks/use-confetti-store";
import { cn } from "@/lib/utils";
import MuxPlayer from "@mux/mux-player-react";
import axios from "axios";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface VideoPlayerProps {
  chapterId: string;
  title: string;
  isLocked: boolean;
  playbackId: string;
  completeOnEnd: boolean;
  nextChapterId?: string;
  courseId: string;
}

export const VideoPlayer = ({
  chapterId,
  title,
  isLocked,
  playbackId,
  completeOnEnd,
  nextChapterId,
  courseId,
}: VideoPlayerProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();

  const [isReady, setIsReady] = useState(false);

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          { isCompleted: true }
        );

        console.log("NextChapterId:", nextChapterId);

        const res = await axios.get(`/api/courses/${courseId}/progress`);

        const { progress } = res.data;

        if (progress === 100) confetti.onOpen();

        toast.success("Progress updated!");

        if (nextChapterId && progress !== 100)
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);

        router.refresh();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="relative aspect-video">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
          <Lock className="w-8 h-8" />
          <p>This chapter is locked</p>
        </div>
      )}
      {!isLocked && (
        <MuxPlayer
          title={title}
          className={cn(!isReady && "hidden")}
          onCanPlay={() => setIsReady(true)}
          onEnded={onEnd}
          autoPlay
          playbackId={playbackId}
        />
      )}
    </div>
  );
};
