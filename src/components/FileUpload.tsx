import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Loader,
  AlertCircle,
  UploadCloud,
  Video,
  Image as ImageIcon,
  X,
} from "lucide-react";

interface FileUploadProps {
  apiKey: string;
  fileType: "image" | "video";
  initialValue?: string | string[];
  onUploadComplete: (value: string | string[] | undefined) => void;
  onError?: (error: string) => void;
  allowMultiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  apiKey,
  fileType,
  initialValue,
  onUploadComplete,
  onError,
  allowMultiple = false,
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getValueAsArray = useCallback((): string[] => {
    if (!initialValue) return [];
    return Array.isArray(initialValue) ? initialValue : [initialValue];
  }, [initialValue]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const filesToUpload = allowMultiple ? acceptedFiles : [acceptedFiles[0]];
      if (filesToUpload.length === 0) return;

      setError(null);
      setUploading(true);
      onError?.("");

      let newlyUploadedUrls: string[] = [];
      let uploadErrors: string[] = [];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const response = await fetch("https://api.hyprlab.io/v1/uploads", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}` },
            body: formData,
          });
          if (!response.ok) {
            let d;
            try {
              d = await response.json();
            } catch (e) {}
            throw new Error(
              d?.error?.message ||
                d?.message ||
                `Upload ${file.name}: ${response.status}`,
            );
          }
          const result = await response.json();
          const key = fileType === "image" ? "imageUrl" : "videoUrl";
          const url = result[key];
          if (!url || typeof url !== "string") {
            throw new Error(`Upload ${file.name}: Missing ${key}.`);
          }
          newlyUploadedUrls.push(url);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Unknown upload error.";
          console.error(`Upload error for ${file.name}:`, err);
          uploadErrors.push(message);
        }
      }

      setUploading(false);

      if (uploadErrors.length > 0) {
        const msg = uploadErrors.join("; ");
        setError(msg);
        onError?.(msg);
      }

      if (newlyUploadedUrls.length > 0) {
        const currentPropValueArray = getValueAsArray();

        const nextValueArray = allowMultiple
          ? [...currentPropValueArray, ...newlyUploadedUrls]
          : [...newlyUploadedUrls];

        const callbackValue = allowMultiple
          ? nextValueArray.length > 0
            ? nextValueArray
            : undefined
          : nextValueArray.length > 0
            ? nextValueArray[0]
            : undefined;

        onUploadComplete(callbackValue);
      } else if (
        uploadErrors.length > 0 &&
        getValueAsArray().length === 0 &&
        !allowMultiple
      ) {
        onUploadComplete(undefined);
      }
    },
    [
      apiKey,
      fileType,
      onUploadComplete,
      onError,
      allowMultiple,
      getValueAsArray,
    ],
  );

  const handleDelete = (indexToDelete: number) => {
    if (uploading) return;

    const currentPropValueArray = getValueAsArray();

    const nextValueArray = currentPropValueArray.filter(
      (_, index) => index !== indexToDelete,
    );

    const callbackValue = allowMultiple
      ? nextValueArray.length > 0
        ? nextValueArray
        : undefined
      : undefined;

    onUploadComplete(callbackValue);

    setError(null);
    onError?.("");
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: fileType === "image" ? { "image/*": [] } : { "video/*": [] },
      multiple: allowMultiple,
      disabled: uploading,
    });

  const getBorderColor = () => {
    if (isDragReject) return "border-red-500";
    if (isDragActive) return "border-blue-500";
    if (error && !uploading) return "border-red-500";
    return "border-gray-300 hover:border-blue-500";
  };
  const dropzoneBaseClasses = `border-2 border-dashed p-4 text-center cursor-pointer transition-colors rounded-md`;
  const dropzoneStateClasses = `${getBorderColor()} ${isDragActive ? "bg-blue-50" : ""} ${uploading ? "opacity-50 cursor-not-allowed" : ""}`;

  const previewsToDisplay = getValueAsArray();

  return (
    <div className="w-full">
      {}
      <div
        {...getRootProps()}
        className={`${dropzoneBaseClasses} ${dropzoneStateClasses}`}
      >
        <input {...getInputProps()} />
        {}
        {uploading ? (
          <div className="flex flex-col items-center text-gray-500">
            <Loader className="animate-spin h-8 w-8 mb-2" />
            <p>Uploading...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center text-blue-600">
            <UploadCloud className="h-8 w-8 mb-2" />
            <p>Drop {allowMultiple ? "files" : `the ${fileType}`} here...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <UploadCloud className="h-8 w-8 mb-2" />
            <p>
              Drag & drop {allowMultiple ? `${fileType}(s)` : fileType} here, or
              click to select
            </p>
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
      {}
      {}
      {previewsToDisplay.length > 0 && !uploading && (
        <div className="mt-2 space-y-1">
          <div className="flex flex-wrap gap-2 w-full">
            {previewsToDisplay.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative group border p-0.5 inline-block bg-gray-50 rounded shadow-sm"
              >
                {}
                {fileType === "image" ? (
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="block h-24 w-auto max-w-[150px] object-contain rounded-sm"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={url}
                    controls={false}
                    className="block h-24 w-auto max-w-[150px] object-contain rounded-sm bg-gray-200"
                    preload="metadata"
                    muted
                    loop
                    playsInline
                  >
                    Video preview not supported.
                  </video>
                )}
                {}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0 m-0 w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-md"
                  title="Remove file"
                  type="button"
                  aria-label={`Remove file ${index + 1}`}
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
