import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Settings, Loader, Image as ImageIcon } from "lucide-react";
import { GeneratedImage } from "../types";
import ModelTabs from "./ModelTabs";
import ModelForm from "./ModelForm";
import { modelFamilies, modelValidations, ModelConfig } from "../config/models";
import { z } from "zod";

const findDefaultImageModel = (): string => {
  const imageFamily = modelFamilies.find((f) => f.type === "image");
  if (imageFamily) {
    const firstModelConfig = imageFamily.models[0];
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
  console.warn("No default image model found. Falling back to 'flux-1.1-pro'.");
  return "flux-1.1-pro";
};
const defaultImageModel = findDefaultImageModel();

interface ImageGeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
}

export interface ImageGeneratorRef {
  loadSettings: (settings: GeneratedImage["settings"]) => void;
}

const ImageGenerator = forwardRef<ImageGeneratorRef, ImageGeneratorProps>(
  ({ onImageGenerated }, ref) => {
    const [apiKey, setApiKey] = useState(
      localStorage.getItem("hyprFluxApiKey") || "",
    );
    const [selectedModel, setSelectedModel] = useState<string>(() => {
      return defaultImageModel;
    });
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>(
      {},
    );

    const findImageModelConfig = (modelId: string): ModelConfig | null => {
      for (const family of modelFamilies) {
        if (family.type === "image") {
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
      const modelConfig = findImageModelConfig(selectedModel);
      if (!modelConfig) {
        console.warn(`ImageGenerator: ${selectedModel} invalid. Resetting.`);
        setSelectedModel(defaultImageModel);
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
      localStorage.setItem("hyprFluxLastSelectedImageModel", selectedModel);
      setUploadErrors({});
    }, [selectedModel]);

    const initializeDefaults = (modelId: string) => {
      const modelConfig = findImageModelConfig(modelId);
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
        findImageModelConfig(currentModelId)
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
      loadSettings: (settings: GeneratedImage["settings"]) => {
        const modelConfig = findImageModelConfig(settings.model);
        if (modelConfig) {
          const settingsWithoutFiles = { ...settings };
          if (settingsWithoutFiles.control_image)
            delete settingsWithoutFiles.control_image;
          if (settingsWithoutFiles.image_prompt)
            delete settingsWithoutFiles.image_prompt;
          setSelectedModel(settings.model);
          setFormValues({ ...settingsWithoutFiles, model: settings.model });
          setUploadErrors({});
          console.log("Loaded settings for model:", settings.model);
        } else {
          console.warn(`Load failed: ${settings.model} not image model.`);
          setError(`Cannot load: ${settings.model} not image model.`);
          setSelectedModel(defaultImageModel);
        }
      },
    }));

    const handleModelSelect = (modelId: string) => {
      if (findImageModelConfig(modelId)) {
        setSelectedModel(modelId);
        setUploadErrors({});
      } else {
        console.warn(`Attempted select non-image model: ${modelId}`);
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
          const newModelConfig = findImageModelConfig(newModelId);
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
                console.log(
                  `Resetting ${key} from ${newValues[key]} to default ${fieldDef.default} for model ${newModelId}`,
                );
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
                    console.log(
                      `Resetting ${key} from ${numValue} to default ${fieldDef.default} due to range constraints for model ${newModelId}`,
                    );
                    newValues[key] = fieldDef.default;
                  }
                } else if (newValues[key] !== undefined) {
                  console.log(
                    `Resetting ${key} from non-numeric ${newValues[key]} to default ${fieldDef.default} for model ${newModelId}`,
                  );
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
      const modelConfig = findImageModelConfig(currentModelId);

      if (!modelConfig) {
        throw new Error(
          `Invalid image model for API request: ${currentModelId}`,
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
            if (
              (currentModelId === "dall-e-3" ||
                currentModelId === "azure/dall-e-3") &&
              key === "style" &&
              value === "none"
            ) {
            } else {
              acc[key] = value;
            }
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      if (!filteredValues.prompt) filteredValues.prompt = "";
      filteredValues.model = currentModelId;

      const result = {
        ...filteredValues,
        response_format: "b64_json",
      };

      return result;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");
      setUploadErrors({});
      const currentModelId = formValues.model || selectedModel;
      if (!findImageModelConfig(currentModelId)) {
        setError(`Invalid model: ${currentModelId}`);
        setIsLoading(false);
        return;
      }

      try {
        const requestBody = getValidRequestBody(formValues);
        console.log(
          "Final Image API Request Body:",
          JSON.stringify(requestBody, null, 2),
        );

        const modelSchema = modelValidations[requestBody.model];
        if (modelSchema) {
          const validationSchema = modelSchema.extend({
            control_image: z.string().url().optional(),
            image_prompt: z.string().url().optional(),
          });
          validationSchema.parse(requestBody);
        } else {
          console.warn("No validation schema:", requestBody.model);
        }

        const apiEndpoint = "https://api.hyprlab.io/v1/images/generations";
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
        if (!data.data?.[0]?.b64_json) {
          throw new Error("Invalid API response structure.");
        }

        const storageSettings = { ...requestBody };
        delete storageSettings.response_format;
        delete storageSettings.output_format;

        const newImage: GeneratedImage = {
          type: "image",
          imageData: data.data[0].b64_json,
          prompt: requestBody.prompt,
          revised_prompt: data.data[0].revised_prompt,
          settings: storageSettings,
          timestamp: new Date(
            data.created ? data.created * 1000 : Date.now(),
          ).toISOString(),
        };

        onImageGenerated(newImage);
      } catch (err) {
        console.error("Image generation error:", err);
        const errorMsg =
          err instanceof Error ? err.message : "Error generating image.";
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
          filterType="image"
        />
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex-grow flex flex-col mt-4"
        >
          {}
          <div className="flex-shrink-0">
            <label
              htmlFor="imageApiKey"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              API Key
            </label>
            <input
              type="password"
              id="imageApiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="block w-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md bg-gray-100 placeholder-gray-400"
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
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0 transition duration-150 ease-in-out"
          >
            {isLoading ? (
              <>
                {" "}
                <Loader className="animate-spin mr-2 h-5 w-5" /> Generating...{" "}
              </>
            ) : (
              <>
                {" "}
                <ImageIcon size={18} className="mr-2" /> Generate Image{" "}
              </>
            )}
          </button>
        </form>
        {}
        {error && !error.startsWith("Upload failed") && (
          <p className="mt-2 text-red-600 text-sm flex-shrink-0">{error}</p>
        )}
      </div>
    );
  },
);

ImageGenerator.displayName = "ImageGenerator";
export default ImageGenerator;
