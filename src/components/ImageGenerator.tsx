import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Settings,
  Loader,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
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
    if (firstModelConfig?.id && !modelSelectField) return firstModelConfig.id;
  }
  console.warn("No default image model found. Falling back to 'gpt-image-1'.");
  return "gpt-image-1";
};
const defaultImageModel = findDefaultImageModel();

const findModelConfigBlockContainingModel = (
  specificModelId: string,
): ModelConfig | null => {
  for (const family of modelFamilies) {
    if (family.type === "image") {
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
  return null;
};

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
      const lastImageModel = localStorage.getItem(
        "hyprFluxLastSelectedImageModel",
      );
      const isValid =
        lastImageModel && !!findModelConfigBlockContainingModel(lastImageModel);
      return isValid ? lastImageModel : defaultImageModel;
    });
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>(
      {},
    );

    useEffect(() => {
      const modelConfigBlock =
        findModelConfigBlockContainingModel(selectedModel);
      if (!modelConfigBlock) {
        console.error(
          `ImageGenerator: Cannot load/initialize: No config block found for ${selectedModel}. Resetting.`,
        );
        setSelectedModel(defaultImageModel);
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
          console.error(`Error parsing ${selectedModel} values:`, e);
          initializeDefaults(selectedModel, modelConfigBlock);
        }
      } else {
        initializeDefaults(selectedModel, modelConfigBlock);
      }
      localStorage.setItem("hyprFluxLastSelectedImageModel", selectedModel);
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
      loadSettings: (settings: GeneratedImage["settings"]) => {
        if (!settings || !settings.model) {
          setError(
            "Cannot load settings: Invalid settings object or model missing.",
          );
          return;
        }
        const modelConfigBlock = findModelConfigBlockContainingModel(
          settings.model,
        );
        if (modelConfigBlock) {
          const settingsWithoutFiles = { ...settings };
          delete settingsWithoutFiles.control_image;
          delete settingsWithoutFiles.image_prompt;
          delete settingsWithoutFiles.image;
          delete settingsWithoutFiles.mask;

          setSelectedModel(settings.model);
          setFormValues({ ...settingsWithoutFiles, model: settings.model });
          setError(null);
          setUploadErrors({});
        } else {
          setError(
            `Cannot load settings: Model '${settings.model}' is not a valid image model.`,
          );
        }
      },
    }));

    const handleModelSelect = (modelId: string) => {
      if (findModelConfigBlockContainingModel(modelId)) {
        setSelectedModel(modelId);
      } else {
        console.warn(`Tab selection failed: No config found for ${modelId}.`);
      }
    };

    const handleUploadError = (fieldName: string, errorMsg: string) => {
      setUploadErrors((prev) => ({ ...prev, [fieldName]: errorMsg || "" }));
      if (errorMsg)
        setError(`Upload error for ${fieldName.replace(/_/g, " ")}.`);
      else setError(null);
    };

    const handleFormChange = (name: string, value: any) => {
      setFormValues((prev) => {
        const intermediateValues = { ...prev, [name]: value };

        if (error && error.toLowerCase().includes(name.replace(/_/g, " "))) {
          setError(null);
        }
        if (uploadErrors[name]) {
          setUploadErrors((currentErrors) => ({
            ...currentErrors,
            [name]: "",
          }));
        }

        if (name === "model") {
          const newSpecificModelId = value;
          const newModelConfigBlock =
            findModelConfigBlockContainingModel(newSpecificModelId);

          if (newModelConfigBlock) {
            const finalValuesForNewModel: Record<string, any> = {
              model: newSpecificModelId,
            };
            const fieldsForNewModel = newModelConfigBlock.fields;

            fieldsForNewModel.forEach((fieldDef) => {
              const key = fieldDef.name;
              const shouldShow =
                !fieldDef.showFor ||
                fieldDef.showFor.includes(newSpecificModelId);

              if (shouldShow) {
                const previousValue = intermediateValues[key];
                let keepPrevious = false;
                if (previousValue !== undefined) {
                  if (fieldDef.type === "file" && previousValue) {
                    keepPrevious = true;
                  } else if (
                    fieldDef.type === "select" &&
                    fieldDef.options?.includes(previousValue)
                  ) {
                    keepPrevious = true;
                  } else if (
                    (fieldDef.type === "range" || fieldDef.type === "number") &&
                    previousValue !== ""
                  ) {
                    const numValue = Number(previousValue);
                    if (
                      !isNaN(numValue) &&
                      (fieldDef.min === undefined ||
                        numValue >= fieldDef.min) &&
                      (fieldDef.max === undefined || numValue <= fieldDef.max)
                    ) {
                      keepPrevious = true;
                    }
                  } else if (
                    fieldDef.type === "checkbox" ||
                    fieldDef.type === "textarea" ||
                    fieldDef.type === "text"
                  ) {
                    keepPrevious = true;
                  }
                }

                if (keepPrevious) {
                  finalValuesForNewModel[key] = previousValue;
                } else if (fieldDef.default !== undefined) {
                  finalValuesForNewModel[key] = fieldDef.default;
                }
              }
            });
            return finalValuesForNewModel;
          } else {
            console.warn(
              `Model switch failed: No config for ${newSpecificModelId}`,
            );
            return prev;
          }
        }
        return intermediateValues;
      });
    };

    const getValidRequestBody = (values: Record<string, any>) => {
      const currentModelId = values.model;
      if (!currentModelId) throw new Error("Model ID missing.");
      const modelConfigBlock =
        findModelConfigBlockContainingModel(currentModelId);
      if (!modelConfigBlock)
        throw new Error(`No config block for ${currentModelId}.`);

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
            if (key === "image" && currentModelId === "gpt-image-1") {
              if (
                (typeof value === "string" && value) ||
                (Array.isArray(value) &&
                  value.length > 0 &&
                  value.every((v) => typeof v === "string" && v))
              ) {
                acc[key] = value;
              }
            } else if (
              key === "image" &&
              currentModelId === "gpt-image-1-mini"
            ) {
              if (
                (typeof value === "string" && value) ||
                (Array.isArray(value) &&
                  value.length > 0 &&
                  value.every((v) => typeof v === "string" && v))
              ) {
                acc[key] = value;
              }
            } else if (
              key === "input_images" &&
              currentModelId === "flux-2-pro"
            ) {
              if (
                (typeof value === "string" && value) ||
                (Array.isArray(value) &&
                  value.length > 0 &&
                  value.every((v) => typeof v === "string" && v))
              ) {
                acc[key] = value;
              }
            } else if (
              key === "input_images" &&
              currentModelId === "flux-2-flex"
            ) {
              if (
                (typeof value === "string" && value) ||
                (Array.isArray(value) &&
                  value.length > 0 &&
                  value.every((v) => typeof v === "string" && v))
              ) {
                acc[key] = value;
              }
            } else if (
              key === "image_input" &&
              currentModelId === "nano-banana-pro"
            ) {
              if (
                (typeof value === "string" && value) ||
                (Array.isArray(value) &&
                  value.length > 0 &&
                  value.every((v) => typeof v === "string" && v))
              ) {
                acc[key] = value;
              }
            } else if (
              key === "image_input" &&
              currentModelId === "nano-banana"
            ) {
              if (
                (typeof value === "string" && value) ||
                (Array.isArray(value) &&
                  value.length > 0 &&
                  value.every((v) => typeof v === "string" && v))
              ) {
                acc[key] = value;
              }
            } else if (
              key === "image_input" &&
              currentModelId === "seedream-4"
            ) {
              if (
                (typeof value === "string" && value) ||
                (Array.isArray(value) &&
                  value.length > 0 &&
                  value.every((v) => typeof v === "string" && v))
              ) {
                acc[key] = value;
              }
            } else if (
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

      if (
        !filteredValues.prompt &&
        modelConfigBlock.fields.some((f) => f.name === "prompt" && f.required)
      ) {
      } else if (
        !filteredValues.prompt &&
        !modelConfigBlock.fields.some((f) => f.name === "prompt" && f.required)
      ) {
      }

      filteredValues.model = currentModelId;

      return { ...filteredValues, response_format: "b64_json" };
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      const currentModelId = formValues.model;

      if (
        !currentModelId ||
        !findModelConfigBlockContainingModel(currentModelId)
      ) {
        setError(`Invalid model selected: '${currentModelId || "None"}'.`);
        setIsLoading(false);
        return;
      }

      if (!apiKey) {
        setError("API Key is required.");
        setIsLoading(false);
        return;
      }

      const modelConfigBlock =
        findModelConfigBlockContainingModel(currentModelId);
      let firstValidationError = "";

      if (modelConfigBlock) {
        for (const field of modelConfigBlock.fields) {
          const isApplicableToCurrentModel =
            !field.showFor || field.showFor.includes(currentModelId);
          if (isApplicableToCurrentModel && field.required) {
            if (field.type === "file") {
              if (
                field.name === "image" &&
                currentModelId === "gpt-image-1" &&
                Array.isArray(formValues[field.name])
              ) {
                if (
                  !formValues[field.name] ||
                  formValues[field.name].length === 0
                ) {
                  firstValidationError = `${field.label} is required. Please upload at least one file.`;
                  break;
                }
              } else if (
                field.name === "image" &&
                currentModelId === "gpt-image-1-mini" &&
                Array.isArray(formValues[field.name])
              ) {
                if (
                  !formValues[field.name] ||
                  formValues[field.name].length === 0
                ) {
                  firstValidationError = `${field.label} is required. Please upload at least one file.`;
                  break;
                }
              } else if (
                field.name === "input_images" &&
                currentModelId === "flux-2-pro" &&
                Array.isArray(formValues[field.name])
              ) {
                if (
                  !formValues[field.name] ||
                  formValues[field.name].length === 0
                ) {
                  firstValidationError = `${field.label} is required. Please upload at least one file.`;
                  break;
                }
              } else if (
                field.name === "input_images" &&
                currentModelId === "flux-2-flex" &&
                Array.isArray(formValues[field.name])
              ) {
                if (
                  !formValues[field.name] ||
                  formValues[field.name].length === 0
                ) {
                  firstValidationError = `${field.label} is required. Please upload at least one file.`;
                  break;
                }
              } else if (
                field.name === "image_input" &&
                currentModelId === "nano-banana-pro" &&
                Array.isArray(formValues[field.name])
              ) {
                if (
                  !formValues[field.name] ||
                  formValues[field.name].length === 0
                ) {
                  firstValidationError = `${field.label} is required. Please upload at least one file.`;
                  break;
                }
              } else if (
                field.name === "image_input" &&
                currentModelId === "nano-banana" &&
                Array.isArray(formValues[field.name])
              ) {
                if (
                  !formValues[field.name] ||
                  formValues[field.name].length === 0
                ) {
                  firstValidationError = `${field.label} is required. Please upload at least one file.`;
                  break;
                }
              } else if (
                field.name === "image_input" &&
                currentModelId === "seedream-4" &&
                Array.isArray(formValues[field.name])
              ) {
                if (
                  !formValues[field.name] ||
                  formValues[field.name].length === 0
                ) {
                  firstValidationError = `${field.label} is required. Please upload at least one file.`;
                  break;
                }
              } else if (!formValues[field.name]) {
                firstValidationError = `${field.label} is required. Please upload a file.`;
                break;
              }
            } else {
              if (
                formValues[field.name] === undefined ||
                formValues[field.name] === null ||
                formValues[field.name] === ""
              ) {
                firstValidationError = `${field.label} is required.`;
                break;
              }
            }
          }
        }
      }

      if (firstValidationError) {
        setError(firstValidationError);
        setIsLoading(false);
        return;
      }

      const hasExistingUploadErrors = Object.values(uploadErrors).some(
        (msg) => !!msg,
      );
      if (hasExistingUploadErrors) {
        setError("Please resolve all file upload errors before generating.");
        setIsLoading(false);
        return;
      }

      try {
        const requestBody = getValidRequestBody(formValues);
        console.log(
          "Final Image API Request Body:",
          JSON.stringify(requestBody, null, 2),
        );

        const baseModelSchema = modelValidations[requestBody.model];
        if (baseModelSchema) {
          let finalSchema = baseModelSchema;
          if (requestBody.model === "gpt-image-1") {
            finalSchema = baseModelSchema.extend({
              image: z
                .union([z.string().url(), z.array(z.string().url()).min(1)])
                .optional(),
              mask: z.string().url().optional(),
            });
          } else if (requestBody.model === "gpt-image-1-mini") {
            finalSchema = baseModelSchema.extend({
              image: z
                .union([z.string().url(), z.array(z.string().url()).min(1)])
                .optional(),
              mask: z.string().url().optional(),
            });
          } else if (requestBody.model === "flux-2-pro") {
            finalSchema = baseModelSchema.extend({
              input_images: z
                .union([z.string().url(), z.array(z.string().url()).min(1)])
                .optional(),
            });
          } else if (requestBody.model === "flux-2-flex") {
            finalSchema = baseModelSchema.extend({
              input_images: z
                .union([z.string().url(), z.array(z.string().url()).min(1)])
                .optional(),
            });
          } else if (requestBody.model === "nano-banana-pro") {
            finalSchema = baseModelSchema.extend({
              image_input: z
                .union([z.string().url(), z.array(z.string().url()).min(1)])
                .optional(),
            });
          } else if (requestBody.model === "nano-banana") {
            finalSchema = baseModelSchema.extend({
              image_input: z
                .union([z.string().url(), z.array(z.string().url()).min(1)])
                .optional(),
            });
          } else if (requestBody.model === "seedream-4") {
            finalSchema = baseModelSchema.extend({
              image_input: z
                .union([z.string().url(), z.array(z.string().url()).min(1)])
                .optional(),
            });
          } else if (
            modelConfigBlock?.fields.some(
              (f) => f.name === "control_image" || f.name === "image_prompt",
            )
          ) {
            finalSchema = baseModelSchema.extend({
              control_image: z.string().url().optional(),
              image_prompt: z.string().url().optional(),
            });
          }
          finalSchema.parse(requestBody);
          console.log(`Validation OK for ${requestBody.model}.`);
        } else {
          console.warn(
            `No Zod schema for ${requestBody.model}. Skipping Zod validation.`,
          );
        }

        const apiEndpoint = "https://api.hyprlab.io/v1/images/generations";
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
              `API request failed with status: ${response.status}`,
          );
        }
        const data = await response.json();
        if (!data.data?.[0]?.b64_json && !data.data?.[0]?.url) {
          throw new Error(
            "Invalid API response structure: Missing image data (b64_json or url).",
          );
        }

        const storageSettings = { ...requestBody };
        delete storageSettings.response_format;

        const newImage: GeneratedImage = {
          type: "image",
          imageData: data.data[0].b64_json || data.data[0].url,
          prompt: requestBody.prompt || "N/A",
          revised_prompt: data.data[0].revised_prompt,
          settings: storageSettings,
          timestamp: new Date(
            data.created && typeof data.created === "number"
              ? data.created * 1000
              : Date.now(),
          ).toISOString(),
        };

        onImageGenerated(newImage);
      } catch (err) {
        const errorMsg =
          err instanceof z.ZodError
            ? `Invalid settings: ${err.errors.map((e) => `${e.path.join(".")} - ${e.message}`).join("; ")}`
            : err instanceof Error
              ? err.message
              : "An unexpected error occurred during image generation.";
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
          filterType="image"
        />

        {}
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
              autoComplete="current-password"
            />
          </div>

          {}
          <div className="flex-grow overflow-y-auto pr-2 -mr-2 custom-scrollbar">
            {configBlockForForm ? (
              <ModelForm
                modelId={selectedModel}
                values={formValues}
                onChange={handleFormChange}
                apiKey={apiKey}
                onUploadError={handleUploadError}
              />
            ) : (
              <p className="text-red-500 p-4">
                Error: Could not load form configuration for model '
                {selectedModel}'. Check models.ts.
              </p>
            )}
            {}
            {Object.entries(uploadErrors)
              .filter(([, msg]) => !!msg)
              .map(([field, msg]) => (
                <p key={field} className="mt-1 text-xs text-red-500 px-1">
                  <AlertCircle size={12} className="inline mr-1" />
                  Upload error ({field.replace(/_/g, " ")}): {msg}
                </p>
              ))}
          </div>

          {}
          <div className="flex-shrink-0 mt-auto pt-4">
            <button
              type="submit"
              disabled={
                isLoading ||
                Object.values(uploadErrors).some((msg) => !!msg) ||
                !apiKey
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-2 h-5 w-5" /> Generating...
                </>
              ) : (
                <>
                  <ImageIcon size={18} className="mr-2" /> Generate Image
                </>
              )}
            </button>
          </div>
        </form>

        {}
        {error && (
          <div className="mt-4 flex-shrink-0">
            {" "}
            {}
            <div className="flex items-center p-3 bg-red-100 text-red-600 border border-red-200 text-sm rounded-md">
              <AlertCircle className="mr-2 flex-shrink-0" size={16} />
              <span>Error: {error}</span>
            </div>
          </div>
        )}
      </div>
    );
  },
);

ImageGenerator.displayName = "ImageGenerator";
export default ImageGenerator;
