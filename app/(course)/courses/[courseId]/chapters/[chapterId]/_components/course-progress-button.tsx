"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface CourseProgressButtonProps {
  chapterId: string;
  courseId: string;
  isCompleted?: boolean;
  nextChapterId?: string;
}

export const CourseProgressButton = ({
  chapterId,
  courseId,
  isCompleted,
  nextChapterId,
}: CourseProgressButtonProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        { isCompleted: !isCompleted }
      );

      const res = await axios.get(`/api/courses/${courseId}/progress`);

      const { progress } = res.data;

      if (!isCompleted && progress === 100) confetti.onOpen();

      if (!isCompleted && progress !== 100 && nextChapterId)
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);

      toast.success("Progress updated!");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isCompleted ? XCircle : CheckCircle;

  return (
    <Button
      type="button"
      variant={isCompleted ? "outline" : "success"}
      onClick={onClick}
      disabled={isLoading}
    >
      {isCompleted ? "Not completed" : "Mark as complete"}
      <Icon className="w-4 h-4 ml-1" />
    </Button>
  );
};
