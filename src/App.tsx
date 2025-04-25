import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Video, Moon, Sun, Info } from "lucide-react";
import ImageGenerator, { ImageGeneratorRef } from "./components/ImageGenerator";
import VideoGenerator from "./components/VideoGenerator";
import MediaHistory from "./components/ImageHistory";
import MediaModal from "./components/MediaModal";
import InfoModal from "./components/InfoModal";
import { GeneratedImage, GeneratedMedia, GeneratedVideo } from "./types";
import { DatabaseService } from "./services/databaseService";
import favicon from "/public/favicon.svg";

const db = new DatabaseService();

type GeneratorType = "image" | "video";

function App() {
  const imageGeneratorRef = useRef<ImageGeneratorRef>(null);
  const videoGeneratorRef = useRef<any>(null);

  const [activeGeneratorType, setActiveGeneratorType] =
    useState<GeneratorType>("image");
  const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia[]>([]);
  const [currentMedia, setCurrentMedia] = useState<GeneratedMedia | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<GeneratedMedia | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  useEffect(() => {
    const loadMediaHistory = async () => {
      setIsLoading(true);
      try {
        await db.init();
        const media = await db.loadMedia();
        setGeneratedMedia(media);
      } catch (error) {
        console.error("Failed to load media history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMediaHistory();
  }, []);

  useEffect(() => {
    if (window.DarkReader) {
      if (darkMode) {
        window.DarkReader.enable({
          darkSchemeBackgroundColor: "#191919",
          darkSchemeTextColor: "#fafafa",
          scrollbarColor: "",
          selectionColor: "auto",
        });
      } else {
        window.DarkReader.disable();
      }
    } else {
      console.warn("DarkReader library not found.");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prevMode) => !prevMode);
  const handleImageGenerated = async (newImage: GeneratedImage) => {
    try {
      await db.saveMedia(newImage, true);
      setGeneratedMedia((prevMedia) => [newImage, ...prevMedia]);
      setCurrentMedia(newImage);
    } catch (error) {
      console.error("Failed to save generated image:", error);
    }
  };
  const handleVideoGenerated = async (newVideo: GeneratedVideo) => {
    try {
      await db.saveMedia(newVideo, true);
      setGeneratedMedia((prevMedia) => [newVideo, ...prevMedia]);
      setCurrentMedia(newVideo);
    } catch (error) {
      console.error("Failed to save generated video:", error);
    }
  };
  const handleClearHistory = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all history? This action cannot be undone.",
      )
    )
      return;
    try {
      await db.clearAll();
      setGeneratedMedia([]);
      setCurrentMedia(null);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };
  const handleMediaClick = (media: GeneratedMedia) => setSelectedMedia(media);
  const handleCloseModal = () => setSelectedMedia(null);
  const handleLoadSettings = (
    settings: GeneratedMedia["settings"],
    type: GeneratorType,
  ) => {
    console.log("Loading settings for type:", type, settings);
    setActiveGeneratorType(type);
    const cleanSettings = Object.entries(settings)
      .filter(([key]) => !key.endsWith("_file"))
      .reduce(
        (obj, [key, value]) => {
          if (
            key === "steps" ||
            key === "height" ||
            key === "width" ||
            key === "cfg_scale" ||
            key === "seed" ||
            key === "duration" ||
            key === "guidance" ||
            key === "image_prompt_strength"
          ) {
            const num = Number(value);
            if (!isNaN(num)) {
              obj[key] = num;
            } else {
              obj[key] = value;
              console.warn(
                `Could not convert setting '${key}' to number:`,
                value,
              );
            }
          } else if (key === "raw" || key === "prompt_upsampling") {
            obj[key] = Boolean(value);
          } else {
            obj[key] = value;
          }
          return obj;
        },
        {} as Record<string, any>,
      );
    setTimeout(() => {
      if (type === "image" && imageGeneratorRef.current) {
        imageGeneratorRef.current.loadSettings(
          cleanSettings as GeneratedImage["settings"],
        );
        console.log("Loaded settings into Image Generator");
      } else if (type === "video" && videoGeneratorRef.current) {
        console.warn(
          "VideoGenerator loadSettings ref method not implemented yet.",
        );
        console.log(
          "Attempted to load settings into Video Generator:",
          cleanSettings,
        );
      } else {
        console.warn(
          "Generator ref not available or type mismatch for loading settings after timeout.",
        );
      }
    }, 50);
    handleCloseModal();
  };
  const handleDeleteMedia = async (timestamp: string) => {
    if (
      !window.confirm("Are you sure you want to delete this item from history?")
    )
      return;
    try {
      await db.deleteMedia(timestamp);
      setGeneratedMedia((prevMedia) =>
        prevMedia.filter((item) => item.timestamp !== timestamp),
      );
      if (currentMedia?.timestamp === timestamp) {
        setCurrentMedia(null);
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
    }
  };
  const handleImportMedia = async (mediaList: GeneratedMedia[]) => {
    try {
      if (!Array.isArray(mediaList)) {
        throw new Error("Imported data is not an array.");
      }
      await db.importMedia(mediaList);
      const updatedMedia = await db.loadMedia();
      setGeneratedMedia(updatedMedia);
      alert(
        `Import processed. Check history for new items (duplicates were skipped).`,
      );
    } catch (error) {
      console.error("Failed to import media:", error);
      alert(
        `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-gray-900 border-t-transparent"></div>
        <p className="ml-4 text-gray-700">Loading History...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {" "}
      {}
      {}
      <header className="p-2 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-50">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center leading-none">
          {" "}
          {}
          <img src={favicon} alt="Favicon" className="h-6 w-6 mx-2" />
          <span className="flex items-center mb-1"> - Hypr Studio</span>
        </h1>
        <div>
          <button
            onClick={toggleDarkMode}
            className="p-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-md"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun /> : <Moon />}
          </button>
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-md"
            title="About"
          >
            <Info />
          </button>
        </div>
      </header>
      {}
      <main className="p-4 space-y-4">
        {" "}
        {}
        <div className="flex flex-col lg:flex-row gap-4">
          {" "}
          {}
          {}
          <section className="w-full lg:w-1/2 border border-gray-200 p-4 flex flex-col bg-white rounded-lg shadow-md">
            {" "}
            {}
            {}
            <div className="flex border-b border-gray-200 mb-4">
              {" "}
              {}
              <button
                onClick={() => setActiveGeneratorType("image")}
                className={`py-2 px-4 flex items-center gap-1 text-sm sm:text-base rounded-t-md ${
                  // Added rounding
                  activeGeneratorType === "image"
                    ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-b-2 border-transparent" // Added hover bg
                }`}
              >
                <ImageIcon size={18} /> Image
              </button>
              <button
                onClick={() => setActiveGeneratorType("video")}
                className={`py-2 px-4 flex items-center gap-1 text-sm sm:text-base rounded-t-md ${
                  // Added rounding
                  activeGeneratorType === "video"
                    ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-b-2 border-transparent" // Added hover bg
                }`}
              >
                <Video size={18} /> Video
              </button>
            </div>
            {}
            <div className="flex-grow min-h-0">
              {activeGeneratorType === "image" && (
                <ImageGenerator
                  ref={imageGeneratorRef}
                  onImageGenerated={handleImageGenerated}
                />
              )}
              {activeGeneratorType === "video" && (
                <VideoGenerator
                  ref={videoGeneratorRef}
                  onVideoGenerated={handleVideoGenerated}
                />
              )}
            </div>
            {}
          </section>
          {}
          <section className="w-full lg:w-1/2 border border-gray-200 p-4 flex flex-col bg-white rounded-lg shadow-md">
            {" "}
            {}
            <h2 className="text-2xl font-bold mb-2 flex-shrink-0 text-gray-800">
              Result
            </h2>
            {}
            <div className="flex-grow flex flex-col items-center justify-center bg-gray-100 min-h-[300px] sm:min-h-[512px] rounded-md p-2">
              {" "}
              {}
              {currentMedia ? (
                <div className="w-full flex flex-col items-center">
                  {}
                  <div className="mb-4 max-w-full">
                    {currentMedia.type === "image" ? (
                      <img
                        src={`data:image/png;base64,${currentMedia.imageData}`}
                        alt={currentMedia.prompt}
                        className="max-w-full h-auto object-contain block rounded"
                        style={{ maxHeight: "60vh" }}
                      />
                    ) : (
                      <video
                        controls
                        src={currentMedia.videoUrl}
                        className="max-w-full h-auto object-contain block rounded"
                        style={{ maxHeight: "60vh" }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                  {}
                  <div className="w-full px-1 mt-1 text-left self-start space-y-1">
                    <p className="text-sm text-gray-800 break-words">
                      {" "}
                      {}
                      <strong>Prompt: </strong>
                      {currentMedia.prompt}
                    </p>
                    {currentMedia.type === "image" &&
                      currentMedia.revised_prompt && (
                        <p className="text-sm text-gray-600 break-words">
                          {" "}
                          {}
                          <strong>Revised: </strong>
                          {currentMedia.revised_prompt}
                        </p>
                      )}
                    <p className="text-xs text-gray-600 break-words">
                      {" "}
                      {}
                      <strong>Settings: </strong>
                      {}
                      {Object.entries(currentMedia.settings)
                        .filter(([key]) => key !== "prompt" && key !== "model")
                        .map(([key, value]) => {
                          if (key === "control_image") return `ctrl_img:true`;
                          if (key === "image_prompt") return `img_prompt:true`;
                          if (key === "start_image") return `start_img:true`;
                          if (key === "end_image") return `end_img:true`;
                          return `${key.replace(/_/g, " ").replace("aspect ratio", "AR").replace("negative prompt", "neg prompt")}: ${value}`;
                        })
                        .filter(Boolean)
                        .join(", ")}
                      {currentMedia.settings.model &&
                        ` (Model: ${currentMedia.settings.model})`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 flex flex-col items-center text-center">
                  {" "}
                  {}
                  {activeGeneratorType === "image" ? (
                    <ImageIcon size={64} />
                  ) : (
                    <Video size={64} />
                  )}
                  <p className="mt-2">
                    Your generated {activeGeneratorType} will appear here
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
        {}
        <section className="border border-gray-200 p-4 bg-white rounded-lg shadow-md">
          {" "}
          {}
          {}
          <MediaHistory
            images={generatedMedia}
            onClearHistory={handleClearHistory}
            onImageClick={handleMediaClick}
            onDeleteImage={handleDeleteMedia}
            onImportImages={handleImportMedia}
          />
        </section>
      </main>
      {}
      {selectedMedia && (
        <MediaModal
          mediaItem={selectedMedia}
          onClose={handleCloseModal}
          onLoadSettings={(settings) =>
            handleLoadSettings(settings, selectedMedia.type)
          }
        />
      )}
      {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
    </div>
  );
}

export default App;
