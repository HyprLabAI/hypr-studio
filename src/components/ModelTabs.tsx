import React from "react";
import { modelFamilies, ModelFamily } from "../config/models";

interface ModelTabsProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  filterType: "image" | "video";
}

const ModelTabs: React.FC<ModelTabsProps> = ({
  selectedModel,
  onModelSelect,
  filterType,
}) => {
  const filteredFamilies = modelFamilies.filter(
    (family) => family.type === filterType,
  );

  const selectedFamily = filteredFamilies.find((family) =>
    family.models.some(
      (modelConfig) =>
        modelConfig.fields.some(
          (field) =>
            field.type === "select" &&
            field.name === "model" &&
            field.options?.includes(selectedModel),
        ) || modelConfig.id === selectedModel,
    ),
  );

  return (
    <div className="border-b border-gray-200">
      <nav
        className="-mb-px flex space-x-2 overflow-x-auto"
        aria-label="Model families"
      >
        {}
        {filteredFamilies.map((family) => {
          const isSelected = family.id === selectedFamily?.id;

          const firstModelConfig = family.models[0];
          const modelSelectField = firstModelConfig?.fields.find(
            (f) => f.name === "model" && f.type === "select",
          );
          const defaultModelId =
            (modelSelectField?.default as string) ||
            (modelSelectField?.options?.[0] as string) ||
            firstModelConfig?.id ||
            "";

          return (
            <button
              key={family.id}
              onClick={() => {
                if (defaultModelId) {
                  onModelSelect(defaultModelId);
                } else {
                  console.error(
                    "Could not determine default model ID for family tab:",
                    family.name,
                  );
                }
              }}
              className={`
                whitespace-nowrap py-1 px-2 border-b-2 text-sm transition-colors duration-150 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-300 rounded-t-md
                ${
                  isSelected
                    ? "border-blue-500 text-blue-600 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
              aria-current={isSelected ? "page" : undefined}
            >
              {family.name} {}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ModelTabs;
