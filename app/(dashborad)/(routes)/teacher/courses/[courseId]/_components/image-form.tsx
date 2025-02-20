"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ImageIcon, Pencil, PlusCircle } from "lucide-react";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";

interface ImageFormProps {
  imageUrl: string | null;
  courseId: string;
}

export const ImageForm = ({ imageUrl, courseId }: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async ({ imageUrl }: { imageUrl: string }) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, { imageUrl });
      toast.success("Image updated!");
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
        Course image
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && "Cancel"}
          {!isEditing && !imageUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-1" />
              Add an image
            </>
          )}
          {!isEditing && imageUrl && (
            <>
              <Pencil className="h-4 w-4 mr-1" />
              Edit Image
            </>
          )}
        </Button>
      </div>
      {!isEditing && !imageUrl && (
        <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
          <ImageIcon className="h-10 w-10 text-slate-500" />
        </div>
      )}
      {!isEditing && imageUrl && (
        <div className="relative aspect-video mt-2">
          <Image
            src={imageUrl}
            alt="upload"
            fill
            className="object-cover rounded-md"
          />
        </div>
      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseImage"
            onChange={(url) => {
              if (url) onSubmit({ imageUrl: url });
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            16:9 aspect ratio recommended
          </div>
        </div>
      )}
    </div>
  );
};
