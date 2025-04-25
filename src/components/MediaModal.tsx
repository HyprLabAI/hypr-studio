import React, { useEffect, useRef } from "react";
import { X, ImageDown, Copy, Settings } from "lucide-react";
import { GeneratedMedia, GeneratedImage, GeneratedVideo } from "../types";
import { generateUniqueFileName } from "../utils/fileUtils";

interface MediaModalProps {
  mediaItem: GeneratedMedia;
  onClose: () => void;
  onLoadSettings: (settings: GeneratedMedia["settings"]) => void;
}

const MediaModal: React.FC<MediaModalProps> = ({
  mediaItem,
  onClose,
  onLoadSettings,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleImageDownload = () => {
    if (mediaItem.type !== "image") return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${mediaItem.imageData}`;
    link.download = generateUniqueFileName(
      mediaItem.prompt,
      mediaItem.timestamp,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVideoUrlCopy = () => {
    if (mediaItem.type !== "video") return;
    navigator.clipboard
      .writeText(mediaItem.videoUrl)
      .then(() => {
        alert("Video URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
        alert("Failed to copy URL.");
      });
  };

  const renderSettingValue = (key: string, value: any) => {
    if (key === "control_image_file") return "control_image.temp";
    if (key === "image_prompt_file") return "image_prompt.temp";
    if (key === "start_image_file") return "start_image.temp";
    if (key === "end_image_file") return "end_image.temp";

    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return value.toString();
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "string") return value;

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const getSettingLabel = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const filterSettingsForDisplay = (settings: GeneratedMedia["settings"]) => {
    return Object.entries(settings).filter(
      ([key]) => key !== "prompt" && key !== "model" && !key.endsWith("_file"),
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      {" "}
      {}
      <div
        ref={modalRef}
        className="bg-white max-w-4xl w-[95%] max-h-[90vh] overflow-y-auto flex flex-col"
      >
        {}
        <div className="flex justify-between items-center p-2 border-b bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold px-2">
            {mediaItem.type === "image" ? "Image Details" : "Video Details"}
          </h2>
          <div className="flex items-center">
            {}
            <button
              onClick={() => onLoadSettings(mediaItem.settings)}
              className="text-gray-500 hover:bg-gray-200 p-2 flex items-center gap-1"
              title="Load Settings into Generator"
            >
              <Settings size={20} />
              {}
            </button>
            {}
            {mediaItem.type === "image" ? (
              <button
                onClick={handleImageDownload}
                className="text-gray-500 hover:bg-gray-200 p-2"
                title="Download image"
              >
                <ImageDown size={20} />
              </button>
            ) : (
              <button
                onClick={handleVideoUrlCopy}
                className="text-gray-500 hover:bg-gray-200 p-2"
                title="Copy video URL"
              >
                <Copy size={20} />
              </button>
            )}
            {}
            <button
              onClick={onClose}
              className="text-gray-500 hover:bg-gray-200 p-2"
              title="Close (Esc)"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {}
        <div className="p-4 flex-grow">
          {" "}
          {}
          {}
          <div className="mb-4 flex justify-center bg-gray-100">
            {" "}
            {}
            {mediaItem.type === "image" ? (
              <img
                src={`data:image/png;base64,${mediaItem.imageData}`}
                alt={mediaItem.prompt}
                className="max-w-full max-h-[60vh] h-auto object-contain"
              />
            ) : (
              <video
                controls
                src={mediaItem.videoUrl}
                className="max-w-full max-h-[60vh] h-auto object-contain"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          {}
          <div className="space-y-2">
            <table className="min-w-full table-auto border-collapse border border-gray-200 bg-white text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-2 align-top font-semibold bg-gray-50 w-1/4">
                    Prompt:
                  </td>
                  <td className="p-2 align-top break-words">
                    {mediaItem.prompt}
                  </td>
                </tr>
                {}
                {mediaItem.type === "image" && mediaItem.revised_prompt && (
                  <tr className="border-b border-gray-200">
                    <td className="p-2 align-top font-semibold bg-gray-50 w-1/4">
                      Revised Prompt:
                    </td>
                    <td className="p-2 align-top break-words">
                      {mediaItem.revised_prompt}
                    </td>
                  </tr>
                )}
                {}
                <tr className="border-b border-gray-200">
                  <td className="p-2 align-top font-semibold bg-gray-50 w-1/4">
                    Model:
                  </td>
                  <td className="p-2 align-top break-words">
                    {mediaItem.settings.model}
                  </td>
                </tr>
                {}
                {filterSettingsForDisplay(mediaItem.settings).map(
                  ([key, value]) => (
                    <tr key={key} className="border-b border-gray-200">
                      <td className="p-2 align-top font-semibold bg-gray-50 w-1/4">
                        {getSettingLabel(key)}:
                      </td>
                      <td className="p-2 align-top break-words">
                        {renderSettingValue(key, value)}
                      </td>
                    </tr>
                  ),
                )}
                {}
                <tr className="border-b border-gray-200">
                  <td className="p-2 align-top font-semibold bg-gray-50 w-1/4">
                    Generated:
                  </td>
                  <td className="p-2 align-top">
                    {new Date(mediaItem.timestamp).toLocaleString()}
                  </td>
                </tr>
                {}
                {mediaItem.type === "video" && (
                  <tr className="border-b border-gray-200">
                    <td className="p-2 align-top font-semibold bg-gray-50 w-1/4">
                      Video URL:
                    </td>
                    <td className="p-2 align-top break-words">
                      <a
                        href={mediaItem.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {mediaItem.videoUrl}
                      </a>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaModal;
