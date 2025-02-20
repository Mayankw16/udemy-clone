import { ourFileRouter } from "@/app/api/uploadthing/core";
import { UploadDropzone } from "@/lib/uploadthing";
import toast from "react-hot-toast";

interface FileUploadProps {
  onChange: (url?: string, name?: string) => void;
  endpoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => (
  <UploadDropzone
    endpoint={endpoint}
    onClientUploadComplete={(res) => {
      console.log("Response: ", res);
      onChange(res?.[0].url, res?.[0].name);
    }}
    onUploadError={(error: Error) => {
      toast.error(`${error?.message}`);
    }}
  />
);
