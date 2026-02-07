import React, { useEffect } from "react";
import { modelFamilies, type Field } from "../config/models";
import FileUpload from "./FileUpload";

interface ModelFormProps {
  modelId: string;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  apiKey: string;
  onUploadError?: (field: string, error: string) => void;
}

const ModelForm: React.FC<ModelFormProps> = ({
  modelId,
  values,
  onChange,
  apiKey,
  onUploadError,
}) => {
  const modelConfigBlock = modelFamilies
    .flatMap((family) => family.models)
    .find(
      (block) =>
        block.id === modelId ||
        block.fields.some(
          (field) =>
            field.name === "model" &&
            field.type === "select" &&
            field.options?.includes(modelId),
        ),
    );

  if (!modelConfigBlock) {
    console.error(
      `ModelForm Critical Error: Could not find configuration block defining fields for specific model ID: ${modelId}. Check models.ts structure.`,
    );
    return (
      <div>Error: Cannot find form configuration for model '{modelId}'.</div>
    );
  }

  const currentSpecificModel = values.model || modelId;

  useEffect(() => {
    modelConfigBlock.fields.forEach((field) => {
      const shouldShow =
        !field.showFor || field.showFor.includes(currentSpecificModel);

      if (
        shouldShow &&
        field.default !== undefined &&
        values[field.name] === undefined
      ) {
        onChange(field.name, field.default);
      }
    });
  }, [modelConfigBlock, currentSpecificModel, onChange, values]);

  const getVisibleFields = () => {
    return modelConfigBlock.fields.filter((field) => {
      return !field.showFor || field.showFor.includes(currentSpecificModel);
    });
  };

  const renderField = (field: Field) => {
    const value = values[field.name] ?? field.default ?? "";
    const uniqueId = `${field.name}-${currentSpecificModel}-${field.showFor?.join("-") || "all"}`;
    const baseInputClasses =
      "block w-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md";
    const lightModeVisibilityClasses = "bg-gray-100 placeholder-gray-400";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={uniqueId}
            name={field.name}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            className={`${baseInputClasses} ${lightModeVisibilityClasses} min-h-[60px]`}
            placeholder={field.label}
            rows={3}
          />
        );

      case "select":
        return (
          <select
            id={uniqueId}
            name={field.name}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            className={`${baseInputClasses} ${lightModeVisibilityClasses}`}
          >
            {!field.required && field.default === undefined && !value && (
              <option value="" disabled>
                -- Select {field.label} --
              </option>
            )}
            {field.options?.map((option) => (
              <option key={String(option)} value={option}>
                {String(option)
                  .replace(/_/g, " ")
                  .replace(/^./, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        );

      case "range":
        const rangeValue = Number(value);
        const displayValue = !isNaN(rangeValue)
          ? rangeValue
          : (field.default ?? field.min ?? 0);
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              id={uniqueId}
              name={field.name}
              value={displayValue}
              onChange={(e) => onChange(field.name, Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-500 w-12 text-right tabular-nums">
              {displayValue}
            </span>
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id={uniqueId}
              name={field.name}
              checked={Boolean(value)}
              onChange={(e) => onChange(field.name, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 focus:ring-offset-0"
            />
            <label
              htmlFor={uniqueId}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            id={uniqueId}
            name={field.name}
            value={value}
            onChange={(e) =>
              onChange(
                field.name,
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            min={field.min}
            max={field.max}
            step={field.step}
            required={field.required}
            className={`${baseInputClasses} ${lightModeVisibilityClasses}`}
            placeholder={field.label}
          />
        );
      case "file":
        const fileType =
          field.name.includes("video") || field.name.includes("vid")
            ? "video"
            : "image";
        const allowMultiple =
          (field.name === "image" &&
            currentSpecificModel === "chatgpt-image-latest") ||
          (field.name === "image" &&
            currentSpecificModel === "gpt-image-1.5") ||
          (field.name === "image" && currentSpecificModel === "gpt-image-1") ||
          (field.name === "image" &&
            currentSpecificModel === "gpt-image-1-mini") ||
          (field.name === "input_images" &&
            currentSpecificModel === "flux-2-max") ||
          (field.name === "input_images" &&
            currentSpecificModel === "flux-2-pro") ||
          (field.name === "input_images" &&
            currentSpecificModel === "flux-2-flex") ||
          (field.name === "input_images" &&
            currentSpecificModel === "flux-2-dev") ||
          (field.name === "image_input" &&
            currentSpecificModel === "nano-banana-pro") ||
          (field.name === "image_input" &&
            currentSpecificModel === "nano-banana") ||
          (field.name === "image_input" &&
            currentSpecificModel === "seedream-4.5") ||
          (field.name === "image_input" &&
            currentSpecificModel === "seedream-4") ||
          (field.name === "image" &&
            currentSpecificModel === "qwen-image-max") ||
          (field.name === "image" &&
            currentSpecificModel === "qwen-image-edit-2511") ||
          (field.name === "image" &&
            currentSpecificModel === "qwen-image-edit-plus") ||
          (field.name === "images" &&
            currentSpecificModel === "p-image-edit") ||
          (field.name === "reference_images" &&
            currentSpecificModel === "veo-3.1");
        const uploadError = values[`${field.name}_error`];

        return (
          <div>
            <FileUpload
              apiKey={apiKey}
              fileType={fileType}
              initialValue={value as string | string[] | undefined}
              allowMultiple={allowMultiple}
              onUploadComplete={(uploadedValue) => {
                onChange(field.name, uploadedValue);
              }}
              onError={(errorMsg) => {
                onUploadError?.(field.name, errorMsg);
              }}
            />
            {}
            {uploadError && (
              <p className="mt-1 text-xs text-red-500">{uploadError}</p>
            )}
          </div>
        );

      default:
        return (
          <input
            type={field.type === "text" ? "text" : field.type}
            id={uniqueId}
            name={field.name}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            className={`${baseInputClasses} ${lightModeVisibilityClasses}`}
            placeholder={field.label}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {getVisibleFields().map((field) => (
        <div key={`${field.name}-${currentSpecificModel}`}>
          {field.type !== "checkbox" && (
            <label
              htmlFor={`${field.name}-${currentSpecificModel}-${field.showFor?.join("-") || "all"}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {renderField(field)}
        </div>
      ))}
    </div>
  );
};

export default ModelForm;
