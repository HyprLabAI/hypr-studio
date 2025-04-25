import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div
        ref={modalRef}
        className="bg-white max-w-xl w-[95%] p-6 rounded-lg shadow-xl max-h-[85vh] overflow-y-auto"
      >
        {}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">About Hypr Studio</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-200 hover:text-gray-700 p-1.5 rounded-md"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {}
        {}
        <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 space-y-4">
          {}
          <p>
            Welcome to <strong>Hypr Studio</strong>, your playground for
            generating AI images and videos using the{" "}
            <a
              href="https://hyprlab.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              HyprLab
            </a>{" "}
            API.
          </p>
          {}
          <h3 className="text-lg font-semibold text-gray-800 !mb-2">
            Core Features
          </h3>{" "}
          {}
          <ul className="!mt-0">
            {" "}
            {}
            <li>Generate Images & Videos with various AI models.</li>
            <li>Customize model-specific parameters.</li>
            <li>Upload input files (images/videos).</li>
            <li>Save, view, and manage generation history locally.</li>
            <li>Reload settings from history.</li>
            <li>Import/Export history (JSON).</li>
            <li>Light/Dark mode support.</li>
          </ul>
          {}
          <h3 className="text-lg font-semibold text-gray-800 !mb-2">
            Getting Started
          </h3>{" "}
          {}
          <ol className="!mt-0">
            {" "}
            {}
            <li>Enter your HyprLab API key.</li>
            <li>Select 'Image' or 'Video' mode.</li>
            <li>Choose a Model Provider & Version.</li>
            <li>Enter a prompt (and upload files if needed).</li>
            <li>Adjust settings or use defaults.</li>
            <li>Click 'Generate'.</li>
          </ol>
          <p>
            Results appear in the 'Result' panel and are saved to 'History'.
          </p>
          {}
          <hr className="my-4" />
          <p className="text-xs text-gray-500">
            Made By Leon & Catto. Open source on{" "}
            <a
              href="https://github.com/HyprLabAI/hypr-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
