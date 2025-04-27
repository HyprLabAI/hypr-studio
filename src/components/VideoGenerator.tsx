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
    if (firstModelConfig?.id && !modelSelectField) return firstModelConfig.id;
  }
  console.warn(
    "No default video model found. Falling back to 'kling-v1.6-standard'.",
  );
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
            (modelConfig) =>
              modelConfig.fields.some(
                (field) =>
                  field.name === "model" &&
                  field.type === "select" &&
                  field.options?.includes(lastVideoModel || ""),
              ) || modelConfig.id === lastVideoModel,
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

    const findModelConfigBlockContainingModel = (
      specificModelId: string,
    ): ModelConfig | null => {
      for (const family of modelFamilies) {
        if (family.type === "video") {
          const foundConfigBlock = family.models.find(
            (block) =>
              block.id === specificModelId ||
              block.fields.some(
                (field) =>
                  field.name === "model" &&
                  field.type === "select" &&
                  field.options?.includes(specificModelId),
              ),
          );
          if (foundConfigBlock) return foundConfigBlock;
        }
      }
      console.warn(
        `Could not find a Video ModelConfig block definition containing: ${specificModelId}`,
      );
      return null;
    };

    useEffect(() => {
      const modelConfigBlock =
        findModelConfigBlockContainingModel(selectedModel);

      if (!modelConfigBlock) {
        console.warn(
          `VideoGenerator: Config block for selected video model '${selectedModel}' not found. Resetting.`,
        );
        setSelectedModel(defaultVideoModel);
        return;
      }

      const storageKey = `hyprFlux_${selectedModel}`;
      const savedValues = localStorage.getItem(storageKey);

      if (savedValues) {
        try {
          const parsedValues = JSON.parse(savedValues);
          if (!parsedValues.model || parsedValues.model !== selectedModel) {
            parsedValues.model = selectedModel;
          }
          setFormValues(parsedValues);
        } catch (e) {
          console.error(
            `Error parsing saved video values for ${selectedModel}. Initializing defaults.`,
            e,
          );
          initializeDefaults(selectedModel, modelConfigBlock);
        }
      } else {
        initializeDefaults(selectedModel, modelConfigBlock);
      }
      localStorage.setItem("hyprFluxLastSelectedVideoModel", selectedModel);
      setError(null);
      setUploadErrors({});
    }, [selectedModel]);

    const initializeDefaults = (
      specificModelId: string,
      configBlock: ModelConfig | null,
    ) => {
      const defaults: Record<string, any> = { model: specificModelId };
      configBlock?.fields.forEach((field) => {
        const appliesToModel =
          !field.showFor || field.showFor.includes(specificModelId);
        if (appliesToModel && field.default !== undefined) {
          defaults[field.name] = field.default;
        }
      });
      setFormValues(defaults);
    };

    useEffect(() => {
      const currentModelId = formValues.model;
      if (
        currentModelId &&
        Object.keys(formValues).length > 1 &&
        findModelConfigBlockContainingModel(currentModelId)
      ) {
        localStorage.setItem(
          `hyprFlux_${currentModelId}`,
          JSON.stringify(formValues),
        );
      }
    }, [formValues]);

    useEffect(() => {
      localStorage.setItem("hyprFluxApiKey", apiKey);
    }, [apiKey]);

    useImperativeHandle(ref, () => ({
      loadSettings: (settings: GeneratedVideo["settings"]) => {
        const modelConfigBlock = findModelConfigBlockContainingModel(
          settings.model,
        );
        if (modelConfigBlock) {
          const settingsWithoutFiles = { ...settings };
          delete settingsWithoutFiles.start_image;
          delete settingsWithoutFiles.end_image;
          delete settingsWithoutFiles.image;

          setSelectedModel(settings.model);
          setFormValues({ ...settingsWithoutFiles, model: settings.model });

          setError(null);
          setUploadErrors({});
          console.log(
            "Loaded settings via ref for video model:",
            settings.model,
          );
        } else {
          console.warn(
            `Load Settings via ref failed: Video model config for '${settings.model}' not found.`,
          );
          setError(
            `Cannot load settings: Model '${settings.model}' is not a valid video model.`,
          );
        }
      },
    }));

    useEffect(() => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

      if (pollingUrl && apiKey) {
        setIsPolling(true);
        setPollingStatus("Checking video status...");
        setError(null);

        const poll = async () => {
          console.log("Polling video:", pollingUrl);
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
              } catch (e) {}
              throw new Error(
                errorData?.error?.message ||
                  errorData?.message ||
                  `Polling failed: ${response.status}`,
              );
            }

            const result = await response.json();

            if (result.status === "processing" || result.status === "pending") {
              setPollingStatus(result.message || "Processing video...");
            } else if (result.data?.[0]?.url) {
              setPollingStatus("Video ready!");
              const videoResultUrl = result.data[0].url;
              setFinalVideoUrl(videoResultUrl);
              setIsPolling(false);
              setPollingUrl(null);
              if (pollingIntervalRef.current)
                clearInterval(pollingIntervalRef.current);

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
            } else if (result.status === "failed" || result.error) {
              throw new Error(
                result.error?.message ||
                  result.message ||
                  "Video generation failed during processing.",
              );
            } else {
              console.warn("Unexpected polling response structure:", result);
              setPollingStatus("Received unexpected status...");
            }
          } catch (err) {
            console.error("Polling error:", err);
            const message =
              err instanceof Error
                ? err.message
                : "Polling failed unexpectedly.";
            setError(`Polling Error: ${message}`);
            setIsPolling(false);
            setPollingUrl(null);
            if (pollingIntervalRef.current)
              clearInterval(pollingIntervalRef.current);
          }
        };

        poll();
        pollingIntervalRef.current = setInterval(poll, 5000);
      }

      return () => {
        if (pollingIntervalRef.current)
          clearInterval(pollingIntervalRef.current);
      };
    }, [pollingUrl, apiKey, onVideoGenerated, formValues]);

    const handleModelSelect = (modelId: string) => {
      if (findModelConfigBlockContainingModel(modelId)) {
        setSelectedModel(modelId);
      } else {
        console.warn(
          `Attempted select invalid video model via tabs: ${modelId}`,
        );
      }
    };

    const handleFormChange = (name: string, value: any) => {
      setFormValues((prev) => {
        let newValues = { ...prev, [name]: value };

        if (error && error.includes(name)) setError(null);
        if (uploadErrors[name]) {
          setUploadErrors((current) => ({ ...current, [name]: "" }));
        }

        if (name === "model") {
          const newSpecificModelId = value;
          const newModelConfigBlock =
            findModelConfigBlockContainingModel(newSpecificModelId);

          if (newModelConfigBlock) {
            const fieldsForNewModel = newModelConfigBlock.fields;
            const validFieldNames = new Set(
              fieldsForNewModel.map((f) => f.name),
            );
            validFieldNames.add("model");

            Object.keys(newValues).forEach((key) => {
              if (!validFieldNames.has(key)) {
                delete newValues[key];
                return;
              }
              const fieldDef = fieldsForNewModel.find((f) => f.name === key);
              if (fieldDef) {
                const shouldShow =
                  !fieldDef.showFor ||
                  fieldDef.showFor.includes(newSpecificModelId);
                if (!shouldShow) {
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
                  (fieldDef.type === "range" || fieldDef.type === "number") &&
                  newValues[key] !== ""
                ) {
                  const numValue = Number(newValues[key]);
                  if (
                    isNaN(numValue) ||
                    (fieldDef.min !== undefined && numValue < fieldDef.min) ||
                    (fieldDef.max !== undefined && numValue > fieldDef.max)
                  ) {
                    newValues[key] = fieldDef.default;
                  }
                }
              }
            });
            fieldsForNewModel.forEach((field) => {
              const applies =
                !field.showFor || field.showFor.includes(newSpecificModelId);
              if (
                applies &&
                field.default !== undefined &&
                newValues[field.name] === undefined
              ) {
                newValues[field.name] = field.default;
              }
            });
            newValues.model = newSpecificModelId;
          } else {
            return prev;
          }
        }
        return newValues;
      });
    };

    const handleUploadError = (fieldName: string, errorMsg: string) => {
      setUploadErrors((prev) => ({ ...prev, [fieldName]: errorMsg || "" }));
      if (errorMsg) setError(`Upload error for ${fieldName}.`);
      else setError(null);
    };

    const getValidRequestBody = (values: Record<string, any>) => {
      const currentModelId = values.model;
      if (!currentModelId) throw new Error("Model ID missing from values.");
      const modelConfigBlock =
        findModelConfigBlockContainingModel(currentModelId);
      if (!modelConfigBlock)
        throw new Error(
          `Cannot find config block for model ${currentModelId}.`,
        );

      const applicableFieldNames = new Set<string>(["model", "prompt"]);
      modelConfigBlock.fields.forEach((field) => {
        if (!field.showFor || field.showFor.includes(currentModelId)) {
          applicableFieldNames.add(field.name);
        }
      });

      const filteredValues = Object.entries(values).reduce(
        (acc, [key, value]) => {
          if (
            applicableFieldNames.has(key) &&
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            if (key === "duration" && typeof value === "string") {
              acc[key] = parseInt(value, 10);
            } else if (
              (key === "start_image" ||
                key === "end_image" ||
                key === "image") &&
              typeof value === "string"
            ) {
              acc[key] = value;
            } else if (
              !(key === "start_image" || key === "end_image" || key === "image")
            ) {
              acc[key] = value;
            }
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      filteredValues.model = currentModelId;
      if (!filteredValues.prompt) filteredValues.prompt = "";

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

      const currentModelId = formValues.model;

      if (
        !currentModelId ||
        !findModelConfigBlockContainingModel(currentModelId)
      ) {
        setError(
          `Configuration error: Invalid or missing video model ('${currentModelId || "None"}').`,
        );
        setIsLoading(false);
        return;
      }
      const hasUploadErrors = Object.values(uploadErrors).some((msg) => !!msg);
      if (hasUploadErrors) {
        setError("Please resolve file upload errors.");
        setIsLoading(false);
        return;
      }
      if (!apiKey) {
        setError("API Key is required.");
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
          const videoValidationSchema = modelSchema.extend({
            start_image: z.string().url().optional(),
            end_image: z.string().url().optional(),
            image: z.string().url().optional(),
          });
          videoValidationSchema.parse(requestBody);
          console.log(
            `Validation successful for video model ${requestBody.model}.`,
          );
        } else {
          console.warn(
            "No Zod validation schema for video model:",
            requestBody.model,
          );
        }

        const apiEndpoint = "https://api.hyprlab.io/v1/video/generations";
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: { message: `HTTP Error: ${response.status}` },
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
          throw new Error(
            "Invalid API response: Missing polling URL (data[0].url).",
          );
        }
      } catch (err) {
        console.error("Video generation start error:", err);
        const errorMsg =
          err instanceof z.ZodError
            ? `Invalid settings: ${err.errors.map((e) => `${e.path.join(".")} ${e.message}`).join(", ")}`
            : err instanceof Error
              ? err.message
              : "Error starting video generation.";
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    const configBlockForForm =
      findModelConfigBlockContainingModel(selectedModel);

    return (
      <div className="h-full flex flex-col">
        {}
        <ModelTabs
          selectedModel={selectedModel}
          onModelSelect={handleModelSelect}
          filterType="video"
        />

        {}
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
              {" "}
              API Key{" "}
            </label>
            <input
              type="password"
              id="videoApiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="mt-1 block w-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md bg-gray-100 placeholder-gray-400"
              placeholder="Enter your API key"
              autoComplete="current-password"
            />
          </div>

          {}
          <div className="flex-grow overflow-y-auto pr-2 -mr-2">
            {configBlockForForm ? (
              <ModelForm
                modelId={selectedModel}
                values={formValues}
                onChange={handleFormChange}
                apiKey={apiKey}
                onUploadError={handleUploadError}
              />
            ) : (
              <p className="text-red-500">
                Error: Could not load form configuration for video model '
                {selectedModel}'.
              </p>
            )}
            {}
            {Object.entries(uploadErrors)
              .filter(([, msg]) => !!msg)
              .map(([field, msg]) => (
                <p key={field} className="mt-1 text-xs text-red-500">
                  {" "}
                  Upload error ({field}): {msg}{" "}
                </p>
              ))}
          </div>

          {}
          <div className="flex-shrink-0 mt-auto pt-4">
            <button
              type="submit"
              disabled={
                isLoading ||
                isPolling ||
                !apiKey ||
                Object.values(uploadErrors).some((msg) => !!msg)
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-2 h-5 w-5" /> Starting...
                </>
              ) : isPolling ? (
                <>
                  <Loader className="animate-spin mr-2 h-5 w-5" /> Processing...
                </>
              ) : (
                <>
                  <Film size={18} className="mr-2" /> Generate Video
                </>
              )}
            </button>
          </div>
        </form>

        {}
        <div className="mt-4 space-y-2 flex-shrink-0">
          {isPolling && pollingStatus && (
            <div className="flex items-center p-3 bg-blue-100 text-blue-700 border border-blue-200 text-sm rounded-md">
              <Loader className="animate-spin mr-2 flex-shrink-0" size={16} />{" "}
              <span>{pollingStatus}</span>{" "}
            </div>
          )}
          {error && (
            <div className="flex items-center p-3 bg-red-100 text-red-600 border border-red-200 text-sm rounded-md">
              <AlertCircle className="mr-2 flex-shrink-0" size={16} />{" "}
              <span>Error: {error}</span>{" "}
            </div>
          )}
          {finalVideoUrl && !isPolling && !error && (
            <div className="flex items-center p-3 bg-green-100 text-green-700 border border-green-200 text-sm rounded-md">
              <CheckCircle className="mr-2 flex-shrink-0" size={16} />{" "}
              <span>Video ready! Result displayed/saved.</span>{" "}
            </div>
          )}
        </div>
      </div>
    );
  },
);

VideoGenerator.displayName = "VideoGenerator";
export default VideoGenerator;
