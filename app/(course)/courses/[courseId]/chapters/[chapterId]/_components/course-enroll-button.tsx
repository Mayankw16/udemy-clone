"use client";

import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useState } from "react";

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
}

export const CourseEnrollButton = ({
  price,
  courseId,
}: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/courses/${courseId}/checkout`);
      window.location.assign(response.data.url);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button size="sm" onClick={onClick} disabled={isLoading}>
      Enroll for {formatPrice(price)}
    </Button>
  );
};
