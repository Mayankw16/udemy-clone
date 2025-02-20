"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { File, Loader2, PlusCircle, X } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { Attachment } from "@prisma/client";

interface AttachmentFormProps {
  courseId: string;
  attachments: Attachment[];
}

export const AttachmentForm = ({
  attachments,
  courseId,
}: AttachmentFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async ({ url, name }: { url: string; name?: string }) => {
    try {
      await axios.post(`/api/courses/${courseId}/attachments`, { url, name });
      toast.success("Course updated!");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  const onDelete = async (id: string, fileKey: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
      const res = await axios.delete(`/api/uploadthing/${fileKey}`);
      console.log(res);
      toast.success("Attachment deleted!");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="flex items-center justify-between font-medium">
        Course attachments
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && "Cancel"}
          {!isEditing && (
            <>
              <PlusCircle className="h-4 w-4 mr-1" />
              Add a file
            </>
          )}
        </Button>
      </div>
      {!isEditing && !attachments.length && (
        <div className="text-sm mt-2 text-slate-500 italic">
          No attachments yet
        </div>
      )}
      {!isEditing && !!attachments.length && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center p-3 w-full bg-purple-100 border-purple-200 border text-purple-700 rounded-md"
            >
              <File className="h-4 w-4 mr-1 flex-shrink-0" />
              <p className="text-xs line-clamp-1 mr-2">{attachment.name}</p>
              {deletingId !== attachment.id && (
                <button
                  disabled={!!deletingId}
                  onClick={() =>
                    onDelete(attachment.id, attachment.url.split("/").pop()!)
                  }
                  className="ml-auto hover:opacity-75 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {deletingId === attachment.id && (
                <Loader2 className="ml-auto w-4 h-4 animate-spin" />
              )}
            </div>
          ))}
        </div>
      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseAttachment"
            onChange={(url, name) => {
              if (url) onSubmit({ url, name });
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Add anything your students might need to complete the course.
          </div>
        </div>
      )}
    </div>
  );
};
