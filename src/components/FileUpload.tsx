import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Loader,
  AlertCircle,
  UploadCloud,
  Video,
  Image as ImageIcon,
} from "lucide-react";

interface FileUploadProps {
  apiKey: string;
  fileType: "image" | "video";
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  initialUrl?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  apiKey,
  fileType,
  onUploadComplete,
  onError,
  initialUrl,
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setUploading(true);
      onError?.("");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("https://api.hyprlab.io/v1/uploads", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            throw new Error(
              `Upload failed with status ${response.status}: ${response.statusText || "Server error"}`,
            );
          }
          throw new Error(
            errorData?.error?.message ||
              errorData?.message ||
              errorData?.error ||
              `Upload failed with status ${response.status}`,
          );
        }

        const result = await response.json();
        const expectedKey = fileType === "image" ? "imageUrl" : "videoUrl";
        const url = result[expectedKey];

        if (!url || typeof url !== "string") {
          console.error(
            "Upload succeeded but response missing expected URL key:",
            expectedKey,
            result,
          );
          throw new Error(
            `Upload succeeded but the response did not contain the expected ${expectedKey}.`,
          );
        }

        console.log(`Upload successful, received URL: ${url}`);
        onUploadComplete(url);
      } catch (err) {
        console.error("File upload error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unknown upload error occurred.";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setUploading(false);
      }
    },
    [apiKey, fileType, onUploadComplete, onError],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: fileType === "image" ? { "image/*": [] } : { "video/*": [] },
      multiple: false,
      disabled: uploading,
    });

  const getBorderColor = () => {
    if (isDragReject) return "border-red-500";
    if (isDragActive) return "border-blue-500";
    if (error) return "border-red-500";
    return "border-gray-300 hover:border-blue-500";
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${getBorderColor()} ${
          isDragActive ? "bg-blue-50" : ""
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center text-gray-500">
            <Loader className="animate-spin h-8 w-8 mb-2" />
            <p>Uploading...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center text-blue-600">
            <UploadCloud className="h-8 w-8 mb-2" />
            <p>Drop the {fileType} here...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <UploadCloud className="h-8 w-8 mb-2" />
            <p>Drag & drop {fileType} here, or click to select</p>
          </div>
        )}
        {isDragReject && (
          <p className="text-red-500 text-sm mt-2">Invalid file type.</p>
        )}
      </div>

      {}
      {error && !uploading && (
        <div className="mt-2 text-red-600 text-sm flex items-center">
          <AlertCircle size={16} className="mr-1" /> {error}
        </div>
      )}

      {}
      {initialUrl && !uploading && (
        <div className="mt-2 border p-1 inline-block">
          {" "}
          {}
          {fileType === "image" ? (
            <img
              src={initialUrl}
              alt="Preview"
              className="max-h-32 max-w-full mx-auto"
            />
          ) : (
            <video
              src={initialUrl}
              controls
              className="max-h-32 max-w-full mx-auto"
              preload="metadata"
            >
              Preview not supported.
            </video>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
