import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Loader, Film, AlertCircle, CheckCircle } from "lucide-react";
import { modelFamilies, modelValidations, ModelConfig } from "../config/models";
import ModelTabs from "./ModelTabs";
import ModelForm from "./ModelForm";
import { GeneratedVideo } from "../types";
import { z } from "zod";

const findDefaultVideoModel = (): string => {
  const videoFamily = modelFamilies.find((f) => f.type === "video");
  if (videoFamily) {
    const firstModelConfig = videoFamily.models[0];
    const modelSelectField = firstModelConfig?.fields.find(
      (field) => field.name === "model" && field.type === "select",
    );
    if (modelSelectField?.default) return modelSelectField.default as string;
    if (modelSelectField?.options?.[0])
      return modelSelectField.options[0] as string;
    if (firstModelConfig?.id) {
      if (
        modelSelectField &&
        modelSelectField.options?.includes(firstModelConfig.id)
      )
        return firstModelConfig.id;
      if (!modelSelectField) return firstModelConfig.id;
    }
  }
  console.warn("No default video model found. Falling back.");
  return "kling-v1.6-standard";
};
const defaultVideoModel = findDefaultVideoModel();

interface VideoGeneratorProps {
  onVideoGenerated: (video: GeneratedVideo) => void;
}

export interface VideoGeneratorRef {
  loadSettings: (settings: GeneratedVideo["settings"]) => void;
}

const VideoGenerator = forwardRef<VideoGeneratorRef, VideoGeneratorProps>(
  ({ onVideoGenerated }, ref) => {
    const [apiKey, setApiKey] = useState(
      localStorage.getItem("hyprFluxApiKey") || "",
    );
    const [selectedModel, setSelectedModel] = useState<string>(() => {
      const lastVideoModel = localStorage.getItem(
        "hyprFluxLastSelectedVideoModel",
      );
      const isValidVideoModel = modelFamilies.some(
        (family) =>
          family.type === "video" &&
          family.models.some(
            (model) =>
              model.id === lastVideoModel ||
              model.fields.some(
                (field) =>
                  field.name === "model" &&
                  field.options?.includes(lastVideoModel || ""),
              ),
          ),
      );
      return isValidVideoModel && lastVideoModel
        ? lastVideoModel
        : defaultVideoModel;
    });
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [pollingUrl, setPollingUrl] = useState<string | null>(null);
    const [pollingStatus, setPollingStatus] = useState<string | null>(null);
    const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>(
      {},
    );

    const findVideoModelConfig = (modelId: string): ModelConfig | null => {
      for (const family of modelFamilies) {
        if (family.type === "video") {
          for (const model of family.models) {
            if (
              model.id === modelId ||
              model.fields.some(
                (f) =>
                  f.name === "model" &&
                  f.type === "select" &&
                  f.options?.includes(modelId),
              )
            ) {
              return model;
            }
          }
        }
      }
      return null;
    };

    useEffect(() => {
      const modelConfig = findVideoModelConfig(selectedModel);
      if (!modelConfig) {
        console.warn(`VideoGenerator: ${selectedModel} invalid. Resetting.`);
        setSelectedModel(defaultVideoModel);
        return;
      }
      const savedValues = localStorage.getItem(`hyprFlux_${selectedModel}`);
      if (savedValues) {
        try {
          const parsedValues = JSON.parse(savedValues);
          setFormValues({ ...parsedValues, model: selectedModel });
        } catch (e) {
          console.error(`Parse error ${selectedModel}:`, e);
          initializeDefaults(selectedModel);
        }
      } else {
        initializeDefaults(selectedModel);
      }
      localStorage.setItem("hyprFluxLastSelectedVideoModel", selectedModel);
      setUploadErrors({});
    }, [selectedModel]);

    const initializeDefaults = (modelId: string) => {
      const modelConfig = findVideoModelConfig(modelId);
      const defaults: Record<string, any> = { model: modelId };
      modelConfig?.fields.forEach((field) => {
        if (
          field.default !== undefined &&
          (!field.showFor || field.showFor.includes(modelId))
        ) {
          defaults[field.name] = field.default;
        }
      });
      setFormValues(defaults);
    };

    useEffect(() => {
      const currentModelId = formValues.model || selectedModel;
      if (
        Object.keys(formValues).length > 1 &&
        findVideoModelConfig(currentModelId)
      ) {
        localStorage.setItem(
          `hyprFlux_${currentModelId}`,
          JSON.stringify(formValues),
        );
      }
    }, [formValues, selectedModel]);

    useEffect(() => {
      localStorage.setItem("hyprFluxApiKey", apiKey);
    }, [apiKey]);

    useImperativeHandle(ref, () => ({
      loadSettings: (settings: GeneratedVideo["settings"]) => {
        const modelConfig = findVideoModelConfig(settings.model);
        if (modelConfig) {
          const settingsWithoutFiles = { ...settings };
          if (settingsWithoutFiles.start_image)
            delete settingsWithoutFiles.start_image;
          if (settingsWithoutFiles.end_image)
            delete settingsWithoutFiles.end_image;
          if (settingsWithoutFiles.image) delete settingsWithoutFiles.image;

          setSelectedModel(settings.model);
          setFormValues({ ...settingsWithoutFiles, model: settings.model });
          setUploadErrors({});
          console.log("Loaded settings for video model:", settings.model);
        } else {
          console.warn(`Load failed: ${settings.model} not video model.`);
          setError(`Cannot load: ${settings.model} not video model.`);
          setSelectedModel(defaultVideoModel);
        }
      },
    }));

    useEffect(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingUrl && apiKey) {
        setIsPolling(true);
        setPollingStatus("Initiating video check...");
        setError(null);
        const poll = async () => {
          console.log("Polling:", pollingUrl);
          try {
            const response = await fetch(pollingUrl, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: "application/json",
              },
            });
            if (!response.ok) {
              let errorData;
              try {
                errorData = await response.json();
              } catch (e) {
                throw new Error(
                  `Polling failed: ${response.status} ${response.statusText}`,
                );
              }
              throw new Error(
                errorData?.error?.message ||
                  errorData?.message ||
                  `Polling failed: ${response.status}`,
              );
            }
            const result = await response.json();
            if (result.status === "processing") {
              setPollingStatus(result.message || "Processing...");
            } else if (result.data && result.data[0]?.url) {
              setPollingStatus("Complete!");
              const videoResultUrl = result.data[0].url;
              setFinalVideoUrl(videoResultUrl);
              setIsPolling(false);
              setPollingUrl(null);
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              const settingsUsed = { ...formValues };
              const generatedVideoData: GeneratedVideo = {
                type: "video",
                videoUrl: videoResultUrl,
                prompt: settingsUsed.prompt,
                settings: settingsUsed,
                timestamp: new Date(
                  result.created ? result.created * 1000 : Date.now(),
                ).toISOString(),
              };
              onVideoGenerated(generatedVideoData);
            } else if (result.error) {
              throw new Error(result.error.message || "Polling failed.");
            } else {
              console.warn("Unexpected poll response:", result);
            }
          } catch (err) {
            console.error("Polling error:", err);
            setError(err instanceof Error ? err.message : "Polling error.");
            setIsPolling(false);
            setPollingUrl(null);
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        };
        poll();
        pollingIntervalRef.current = setInterval(poll, 5000);
      }
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }, [pollingUrl, apiKey, onVideoGenerated, formValues]);

    const handleModelSelect = (modelId: string) => {
      if (findVideoModelConfig(modelId)) {
        setSelectedModel(modelId);
        setUploadErrors({});
      } else {
        console.warn(`Attempted select non-video model: ${modelId}`);
      }
    };

    const handleFormChange = (name: string, value: any) => {
      setFormValues((prev) => {
        const newValues = { ...prev, [name]: value };
        if (uploadErrors[name]) {
          setUploadErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
        }

        if (name === "model") {
          const newModelId = value;
          const newModelConfig = findVideoModelConfig(newModelId);
          if (newModelConfig) {
            Object.keys(newValues).forEach((key) => {
              if (key === "model") return;
              const fieldDef = newModelConfig.fields.find(
                (f) => f.name === key,
              );
              if (
                !fieldDef ||
                (fieldDef.showFor && !fieldDef.showFor.includes(newModelId))
              ) {
                delete newValues[key];
                return;
              }
              if (
                fieldDef.type === "select" &&
                fieldDef.options &&
                !fieldDef.options.includes(newValues[key])
              ) {
                newValues[key] = fieldDef.default;
              } else if (
                fieldDef.type === "range" ||
                fieldDef.type === "number"
              ) {
                const numValue = Number(newValues[key]);
                const min = fieldDef.min;
                const max = fieldDef.max;
                if (!isNaN(numValue)) {
                  if (
                    (min !== undefined && numValue < min) ||
                    (max !== undefined && numValue > max)
                  ) {
                    newValues[key] = fieldDef.default;
                  }
                } else if (newValues[key] !== undefined) {
                  newValues[key] = fieldDef.default;
                }
              }
            });
            newModelConfig.fields.forEach((field) => {
              if (
                field.default !== undefined &&
                newValues[field.name] === undefined &&
                (!field.showFor || field.showFor.includes(newModelId))
              ) {
                newValues[field.name] = field.default;
              }
            });
          } else {
            return prev;
          }
        }
        return newValues;
      });
    };

    const handleUploadError = (fieldName: string, errorMsg: string) => {
      setUploadErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
      setError(`Upload failed for ${fieldName}: ${errorMsg}`);
    };

    const getValidRequestBody = (values: Record<string, any>) => {
      const currentModelId = values.model || selectedModel;
      const modelConfig = findVideoModelConfig(currentModelId);
      if (!modelConfig) {
        throw new Error(
          `Invalid video model for API request: ${currentModelId}`,
        );
      }
      const applicableFields = modelConfig.fields.filter(
        (field) => !field.showFor || field.showFor.includes(currentModelId),
      );
      const applicableFieldNames = applicableFields.map((field) => field.name);
      if (!applicableFieldNames.includes("model"))
        applicableFieldNames.push("model");
      if (!applicableFieldNames.includes("prompt"))
        applicableFieldNames.push("prompt");
      const filteredValues = Object.entries(values).reduce(
        (acc, [key, value]) => {
          if (
            applicableFieldNames.includes(key) &&
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            if (key === "duration" && typeof value === "string") {
              acc[key] = parseInt(value, 10);
            } else {
              acc[key] = value;
            }
          }
          return acc;
        },
        {} as Record<string, any>,
      );
      filteredValues.model = currentModelId;
      return filteredValues;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading || isPolling) return;
      setIsLoading(true);
      setError(null);
      setPollingUrl(null);
      setPollingStatus(null);
      setFinalVideoUrl(null);
      setUploadErrors({});
      const currentModelId = formValues.model || selectedModel;
      if (!findVideoModelConfig(currentModelId)) {
        setError(`Invalid model: ${currentModelId}`);
        setIsLoading(false);
        return;
      }

      try {
        const requestBody = getValidRequestBody(formValues);
        console.log(
          "Final Video API Request Body:",
          JSON.stringify(requestBody, null, 2),
        );

        const modelSchema = modelValidations[requestBody.model];
        if (modelSchema) {
          modelSchema.parse(requestBody);
        } else {
          console.warn("No validation schema:", requestBody.model);
        }

        const apiEndpoint = "https://api.hyprlab.io/v1/video/generations";
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        };
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: {
              message: `HTTP Error: ${response.status} ${response.statusText}`,
            },
          }));
          throw new Error(
            errorData.error?.message ||
              errorData.message ||
              `Request failed: ${response.status}`,
          );
        }
        const data = await response.json();
        if (data.data?.[0]?.url) {
          setPollingUrl(data.data[0].url);
        } else {
          throw new Error("Invalid API response (missing polling URL).");
        }
      } catch (err) {
        console.error("Video generation start error:", err);
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Error starting video generation.";
        setError(errorMsg);
        if (err instanceof z.ZodError) {
          setError(
            `Invalid settings: ${err.errors.map((e) => `${e.path.join(".")} ${e.message}`).join(", ")}`,
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="h-full flex flex-col">
        <ModelTabs
          selectedModel={selectedModel}
          onModelSelect={handleModelSelect}
          filterType="video"
        />
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex-grow flex flex-col mt-4"
        >
          {}
          <div className="flex-shrink-0">
            <label
              htmlFor="videoApiKey"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              API Key
            </label>
            <input
              type="password"
              id="videoApiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="mt-1 block w-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md bg-gray-100 placeholder-gray-400"
              placeholder="Enter your API key"
            />
          </div>
          {}
          <div className="flex-grow overflow-y-auto pr-2 -mr-2">
            <ModelForm
              modelId={selectedModel}
              values={formValues}
              onChange={handleFormChange}
              apiKey={apiKey}
              onUploadError={handleUploadError}
            />
            {Object.entries(uploadErrors).map(([field, msg]) =>
              msg ? (
                <p key={field} className="mt-1 text-xs text-red-500">
                  Error for {field}: {msg}
                </p>
              ) : null,
            )}
          </div>
          {}
          <button
            type="submit"
            disabled={isLoading || isPolling}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0 transition duration-150 ease-in-out"
          >
            {isLoading ? (
              <>
                {" "}
                <Loader className="animate-spin mr-2 h-5 w-5" /> Starting...{" "}
              </>
            ) : isPolling ? (
              <>
                {" "}
                <Loader className="animate-spin mr-2 h-5 w-5" /> Processing...{" "}
              </>
            ) : (
              <>
                {" "}
                <Film size={18} className="mr-2" /> Generate Video{" "}
              </>
            )}
          </button>
        </form>
        {}
        <div className="mt-4 space-y-2 flex-shrink-0">
          {isPolling && pollingStatus && (
            <div className="flex items-center p-3 bg-blue-100 text-blue-700 border border-blue-200 text-sm rounded-md">
              {" "}
              <Loader
                className="animate-spin mr-2 flex-shrink-0"
                size={16}
              />{" "}
              <span>{pollingStatus}</span>{" "}
            </div>
          )}
          {error && !error.startsWith("Upload failed") && (
            <div className="flex items-center p-3 bg-red-100 text-red-600 border border-red-200 text-sm rounded-md">
              {" "}
              <AlertCircle className="mr-2 flex-shrink-0" size={16} />{" "}
              <span>Error: {error}</span>{" "}
            </div>
          )}
          {finalVideoUrl && !isPolling && !error && (
            <div className="flex items-center p-3 bg-green-100 text-green-700 border border-green-200 text-sm rounded-md">
              {" "}
              <CheckCircle className="mr-2 flex-shrink-0" size={16} />{" "}
              <span>
                Video ready! Result displayed in main panel / history.
              </span>{" "}
            </div>
          )}
        </div>
      </div>
    );
  },
);

VideoGenerator.displayName = "VideoGenerator";
export default VideoGenerator;
