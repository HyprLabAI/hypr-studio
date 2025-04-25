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
  const modelConfig = modelFamilies
    .flatMap((family) => family.models)
    .find(
      (model) =>
        model.id === modelId ||
        model.fields.some(
          (field) =>
            field.type === "select" &&
            field.name === "model" &&
            field.options?.includes(modelId),
        ),
    );

  if (!modelConfig) {
    console.error(`ModelForm: Could not find config for modelId: ${modelId}`);
    return <div>Error: Model configuration not found for {modelId}.</div>;
  }

  useEffect(() => {
    modelConfig.fields.forEach((field) => {
      if (
        field.default !== undefined &&
        values[field.name] === undefined &&
        (!field.showFor || field.showFor.includes(modelId))
      ) {
        onChange(field.name, field.default);
      }
    });
  }, [modelConfig, modelId, onChange]);

  const getVisibleFields = () => {
    const currentSpecificModel = values.model || modelId;
    return modelConfig.fields.filter((field) => {
      return !field.showFor || field.showFor.includes(currentSpecificModel);
    });
  };

  const renderField = (field: Field) => {
    const value = values[field.name] ?? field.default ?? "";
    const uniqueId = `${field.name}-${modelId}-${field.showFor?.join("-") || "all"}`;
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
            className={`${baseInputClasses} ${lightModeVisibilityClasses}`}
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
            {!field.required && field.default === undefined && (
              <option value="">-- Select --</option>
            )}
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {String(option)
                  .replace(/_/g, " ")
                  .replace(/^./, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        );

      case "range":
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              id={uniqueId}
              name={field.name}
              value={value}
              onChange={(e) => onChange(field.name, Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-500 w-12 text-right tabular-nums">
              {value}
            </span>
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
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
              className="text-sm font-medium text-gray-700"
            >
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
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
        return (
          <FileUpload
            apiKey={apiKey}
            fileType={fileType}
            initialUrl={typeof value === "string" ? value : undefined}
            onUploadComplete={(url) => {
              onChange(field.name, url);
            }}
            onError={(errorMsg) => {
              console.error(`Upload error for ${field.name}:`, errorMsg);
              onUploadError?.(field.name, errorMsg);
              onChange(field.name, undefined);
            }}
          />
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
        <div
          key={`${field.name}-${modelId}-${field.showFor?.join("-") || "all"}`}
        >
          {field.type !== "checkbox" && (
            <label
              htmlFor={`${field.name}-${modelId}-${field.showFor?.join("-") || "all"}`}
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
