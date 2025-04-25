import React, { useState, useRef } from "react";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  ImageDown,
  Video,
  Copy,
} from "lucide-react";
import { GeneratedMedia, GeneratedImage, GeneratedVideo } from "../types";
import { generateUniqueFileName } from "../utils/fileUtils";

interface ImageHistoryProps {
  images: GeneratedMedia[];
  onClearHistory: () => void;
  onImageClick: (media: GeneratedMedia) => void;
  onDeleteImage: (timestamp: string) => void;
  onImportImages: (mediaList: GeneratedMedia[]) => void;
}

const ITEMS_PER_PAGE = 60;

const ImageHistory: React.FC<ImageHistoryProps> = ({
  images,
  onClearHistory,
  onImageClick,
  onDeleteImage,
  onImportImages,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClearClick = () => {
    onClearHistory();
  };

  const handleImageDownload = (e: React.MouseEvent, image: GeneratedImage) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${image.imageData}`;
    link.download = generateUniqueFileName(image.prompt, image.timestamp);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVideoUrlCopy = (e: React.MouseEvent, video: GeneratedVideo) => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(video.videoUrl)
      .then(() => {
        alert("Video URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
        alert("Failed to copy URL.");
      });
  };

  const handleDelete = (e: React.MouseEvent, timestamp: string) => {
    e.stopPropagation();
    onDeleteImage(timestamp);
  };

  const handleExportHistory = () => {
    const exportData = {
      version: "1.1",
      timestamp: new Date().toISOString(),
      media: images,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hypr-media-history-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (
        !data.version ||
        !(Array.isArray(data.media) || Array.isArray(data.images))
      ) {
        throw new Error(
          "Invalid import file format. Missing version or media/images array.",
        );
      }

      const mediaList = data.media || data.images;

      onImportImages(mediaList as GeneratedMedia[]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert(
        `Failed to import history: ${error instanceof Error ? error.message : "Unknown error"}. Please check file format.`,
      );
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMediaItems = images.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div>
      {}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">History</h2>
        <div className="flex items-center gap-4">
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({images.length} items)
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
          {}
          <button
            onClick={handleExportHistory}
            className="text-gray-500 hover:text-gray-700 flex items-center"
            title="Export history"
            disabled={images.length === 0}
          >
            <Upload size={20} /> {}
          </button>
          <button
            onClick={handleImportClick}
            className="text-gray-500 hover:text-gray-700 flex items-center"
            title="Import history"
          >
            <Download size={20} /> {}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={handleClearClick}
            className="text-red-500 hover:text-red-700 flex items-center mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear history"
            disabled={images.length === 0}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 xl:grid-cols-10 gap-2">
        {currentMediaItems.map((item) => (
          <div
            key={item.timestamp}
            className="group relative cursor-pointer hover:opacity-90 transition-opacity border bg-gray-50"
            onClick={() => onImageClick(item)}
          >
            {}
            {item.type === "image" ? (
              <img
                src={`data:image/png;base64,${item.imageData}`}
                alt={item.prompt}
                className="w-full h-32 object-cover mb-1"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-32 bg-gray-200 flex items-center justify-center mb-1">
                <Video size={48} className="text-gray-400" />
              </div>
            )}

            {}
            <div className="absolute top-1 right-1 flex flex-col gap-1">
              {}
              {item.type === "image" ? (
                <button
                  onClick={(e) => handleImageDownload(e, item)}
                  className="p-1 bg-gray-200 bg-opacity-75 hover:bg-blue-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"
                  title="Download image"
                >
                  <ImageDown size={16} />
                </button>
              ) : (
                <button
                  onClick={(e) => handleVideoUrlCopy(e, item)}
                  className="p-1 bg-gray-200 bg-opacity-75 hover:bg-green-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"
                  title="Copy video URL"
                >
                  <Copy size={16} />
                </button>
              )}
              {}
              <button
                onClick={(e) => handleDelete(e, item.timestamp)}
                className="p-1 bg-gray-200 bg-opacity-75 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"
                title="Delete item"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {}
            <div className="p-1">
              <p className="text-xs text-gray-600 truncate" title={item.prompt}>
                {} {}
                {item.prompt}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(item.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {}
      {images.length === 0 && (
        <div className="text-center text-gray-500 py-8">History is empty</div>
      )}
    </div>
  );
};

export default ImageHistory;
