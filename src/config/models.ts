import { z } from "zod";

const baseValidation = {
  prompt: z.string().min(1).max(10000),
  output_format: z.enum(["png", "jpeg", "webp"]).default("png"),
};

const klingValidationBase = {
  model: z.literal("kling-v1.6-standard"),
  prompt: z.string().min(1),
  duration: z
    .union([z.literal(5), z.literal(10)])
    .optional()
    .default(5),
  cfg_scale: z.number().min(0).max(1).optional().default(0.5),
  start_image: z.string().url(),
  end_image: z.string().url().optional(),
  aspect_ratio: z.enum(["16:9", "1:1", "9:16"]).optional().default("16:9"),
  negative_prompt: z.string().optional(),
};

const veoValidationBase = {
  model: z.literal("veo-2"),
  prompt: z.string().min(1),
  duration: z
    .union([z.literal(5), z.literal(6), z.literal(7), z.literal(8)])
    .optional()
    .default(5),
  image: z.string().url(),
  aspect_ratio: z.enum(["16:9", "9:16"]).optional().default("16:9"),
};

export const modelValidations = {
  "kling-v1.6-standard": z.object(klingValidationBase),
  "veo-2": z.object(veoValidationBase),
  "dall-e-3": z.object({
    ...baseValidation,
    model: z.literal("dall-e-3"),
    size: z.enum(["1024x1024", "1792x1024", "1024x1792"]),
    quality: z.enum(["standard", "hd"]).optional(),
    style: z.enum(["vivid", "natural"]).optional(),
  }),
  "azure/dall-e-3": z.object({
    ...baseValidation,
    model: z.literal("azure/dall-e-3"),
    size: z.enum(["1024x1024", "1792x1024", "1024x1792"]),
    quality: z.enum(["standard", "hd"]).optional(),
    style: z.enum(["vivid", "natural"]).optional(),
  }),
  "dall-e-2": z.object({
    ...baseValidation,
    model: z.literal("dall-e-2"),
    size: z.enum(["256x256", "512x512", "1024x1024"]),
  }),
  "gpt-image-1": z.object({
    ...baseValidation,
    model: z.literal("gpt-image-1"),
    image: z
      .union([
        z.string().url("Image must be a valid URL."),
        z
          .array(z.string().url("Each image in the array must be a valid URL."))
          .min(1, "At least one image URL is required in the array.")
          .max(4),
      ])
      .optional(),
    mask: z.string().url().optional(),
    background: z
      .enum(["auto", "transparent", "opaque"])
      .optional()
      .default("auto"),
    moderation: z.enum(["auto", "low"]).optional().default("auto"),
    output_compression: z.number().min(0).max(100).optional().default(80),
    quality: z.enum(["low", "medium", "high"]).optional().default("medium"),
    size: z
      .enum(["1024x1024", "1024x1536", "1536x1024"])
      .optional()
      .default("1024x1024"),
  }),
  "sdxl-1.0": z.object({
    ...baseValidation,
    model: z.literal("sdxl-1.0"),
    height: z.number().min(640).max(1536),
    width: z.number().min(640).max(1536),
    cfg_scale: z.number().min(0).max(35),
    sampler: z.enum([
      "DDIM",
      "DDPM",
      "K_DPMPP_2M",
      "K_DPMPP_2S_ANCESTRAL",
      "K_DPM_2",
      "K_DPM_2_ANCESTRAL",
      "K_EULER",
      "K_EULER_ANCESTRAL",
      "K_HEUN",
      "K_LMS",
    ]),
    seed: z.number().min(0).max(4294967295).optional(),
    steps: z.number().min(1).max(50),
    style_preset: z
      .enum([
        "3d-model",
        "analog-film",
        "anime",
        "cinematic",
        "comic-book",
        "digital-art",
        "enhance",
        "fantasy-art",
        "isometric",
        "line-art",
        "low-poly",
        "modeling-compound",
        "neon-punk",
        "origami",
        "photographic",
        "pixel-art",
        "tile-texture",
      ])
      .optional(),
    control_image: z.string().url().optional(),
    image_prompt: z.string().url().optional(),
  }),
  "sd3-core": z.object({
    ...baseValidation,
    model: z.literal("sd3-core"),
    aspect_ratio: z
      .enum(["16:9", "1:1", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"])
      .optional(),
    seed: z.number().min(0).max(4294967294).optional(),
    negative_prompt: z.string().max(10000).optional(),
    style_preset: z
      .enum([
        "3d-model",
        "analog-film",
        "anime",
        "cinematic",
        "comic-book",
        "digital-art",
        "enhance",
        "fantasy-art",
        "isometric",
        "line-art",
        "low-poly",
        "modeling-compound",
        "neon-punk",
        "origami",
        "photographic",
        "pixel-art",
        "tile-texture",
      ])
      .optional(),
    control_image: z.string().url().optional(),
    image_prompt: z.string().url().optional(),
  }),
} as Record<string, z.ZodSchema<any>>;

[
  "sd3-ultra",
  "sd3-large",
  "sd3-large-turbo",
  "sd3-medium",
  "sd3.5-large",
  "sd3.5-large-turbo",
  "sd3.5-medium",
].forEach((model) => {
  modelValidations[model] = z.object({
    ...baseValidation,
    model: z.literal(model),
    aspect_ratio: z
      .enum(["16:9", "1:1", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"])
      .optional(),
    seed: z.number().min(0).max(4294967294).optional(),
    negative_prompt: z.string().max(10000).optional(),
    control_image: z.string().url().optional(),
    image_prompt: z.string().url().optional(),
  });
});

export type ModelConfig = {
  id: string;
  name: string;
  description: string;
  fields: Field[];
};
export type Field = {
  name: string;
  type:
    | "text"
    | "number"
    | "select"
    | "range"
    | "textarea"
    | "checkbox"
    | "file";
  label: string;
  required?: boolean;
  options?: (string | number)[];
  min?: number;
  max?: number;
  step?: number;
  default?: any;
  showFor?: string[];
};
export type ModelFamily = {
  id: string;
  name: string;
  description: string;
  models: ModelConfig[];
  type: "image" | "video";
};

export const modelFamilies: ModelFamily[] = [
  {
    id: "dalle",
    name: "OpenAI",
    description: "OpenAI's image generation models",
    type: "image",
    models: [
      {
        id: "openai-models",
        name: "OpenAI Models",
        description: "DALL·E & GPT Image",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["gpt-image-1", "azure/dall-e-3", "dall-e-3", "dall-e-2"],
            default: "gpt-image-1",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "size",
            type: "select",
            label: "Size",
            options: ["1024x1024", "1792x1024", "1024x1792"],
            showFor: ["azure/dall-e-3", "dall-e-3"],
            default: "1024x1024",
          },
          {
            name: "quality",
            type: "select",
            label: "Quality",
            options: ["standard", "hd"],
            showFor: ["azure/dall-e-3", "dall-e-3"],
            default: "standard",
          },
          {
            name: "style",
            type: "select",
            label: "Style",
            options: ["vivid", "natural", "none"],
            showFor: ["azure/dall-e-3", "dall-e-3"],
            default: "vivid",
          },
          {
            name: "size",
            type: "select",
            label: "Size",
            options: ["256x256", "512x512", "1024x1024"],
            showFor: ["dall-e-2"],
            default: "1024x1024",
          },
          {
            name: "image",
            type: "file",
            label: "Image Input",
            showFor: ["gpt-image-1"],
            required: false,
          },
          {
            name: "mask",
            type: "file",
            label: "Mask Input",
            showFor: ["gpt-image-1"],
            required: false,
          },
          {
            name: "background",
            type: "select",
            label: "Background",
            options: ["auto", "transparent", "opaque"],
            showFor: ["gpt-image-1"],
            default: "auto",
          },
          {
            name: "moderation",
            type: "select",
            label: "Moderation",
            options: ["auto", "low"],
            showFor: ["gpt-image-1"],
            default: "auto",
          },
          {
            name: "output_compression",
            type: "range",
            label: "Output Compression",
            min: 0,
            max: 100,
            step: 1,
            showFor: ["gpt-image-1"],
            default: 80,
          },
          {
            name: "quality",
            type: "select",
            label: "Quality",
            options: ["low", "medium", "high"],
            showFor: ["gpt-image-1"],
            default: "medium",
          },
          {
            name: "size",
            type: "select",
            label: "Size",
            options: ["1024x1024", "1024x1536", "1536x1024"],
            showFor: ["gpt-image-1"],
            default: "1024x1024",
          },
        ],
      },
    ],
  },
  {
    id: "flux",
    name: "Black Forest Labs",
    description: "Black Forest Labs image generation models",
    type: "image",
    models: [
      {
        id: "flux",
        name: "Black Forest Labs",
        description: "Flux models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: [
              "flux-1.1-pro-ultra",
              "flux-1.1-pro",
              "flux-pro",
              "flux-dev",
              "flux-schnell",
              "flux-pro-canny",
            ],
            default: "flux-1.1-pro-ultra",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "control_image",
            type: "file",
            label: "Control Image",
            showFor: ["flux-pro-canny"],
            required: true,
          },
          {
            name: "image_prompt",
            type: "file",
            label: "Image Prompt",
            showFor: ["flux-1.1-pro-ultra", "flux-1.1-pro", "flux-pro"],
          },
          {
            name: "image_prompt_strength",
            type: "range",
            label: "Image Prompt Strength",
            showFor: ["flux-1.1-pro-ultra"],
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.1,
          },
          {
            name: "steps",
            type: "range",
            label: "Steps",
            min: 1,
            max: 50,
            default: 30,
            showFor: [
              "flux-1.1-pro",
              "flux-pro",
              "flux-pro-canny",
              "flux-dev",
              "flux-schnell",
            ],
          },
          {
            name: "height",
            type: "range",
            label: "Height",
            min: 256,
            max: 1440,
            step: 32,
            default: 1024,
            showFor: ["flux-1.1-pro", "flux-pro", "flux-dev", "flux-schnell"],
          },
          {
            name: "width",
            type: "range",
            label: "Width",
            min: 256,
            max: 1440,
            step: 32,
            default: 1024,
            showFor: ["flux-1.1-pro", "flux-pro", "flux-dev", "flux-schnell"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "21:9",
              "16:9",
              "3:2",
              "4:3",
              "5:4",
              "1:1",
              "4:5",
              "3:4",
              "2:3",
              "9:16",
              "9:21",
            ],
            default: "1:1",
            showFor: ["flux-1.1-pro-ultra"],
          },
          {
            name: "raw",
            type: "checkbox",
            label: "Raw Output",
            default: false,
            showFor: ["flux-1.1-pro-ultra"],
          },
          {
            name: "guidance",
            type: "range",
            label: "Guidance",
            showFor: ["flux-pro-canny"],
            min: 1,
            max: 100,
            default: 55,
          },
          {
            name: "prompt_upsampling",
            type: "checkbox",
            label: "Prompt Upsampling",
            showFor: ["flux-pro-canny"],
            default: false,
          },
        ],
      },
    ],
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    description: "Stable Diffusion image generation models",
    type: "image",
    models: [
      {
        id: "stable-diffusion",
        name: "Stable Diffusion",
        description: "Stable Diffusion models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: [
              "sd3.5-large",
              "sd3.5-medium",
              "sd3.5-large-turbo",
              "sd3-ultra",
              "sd3-large",
              "sd3-large-turbo",
              "sd3-core",
              "sd3-medium",
              "sdxl-1.0",
            ],
            default: "sd3.5-large",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "negative_prompt",
            type: "textarea",
            label: "Negative Prompt",
            showFor: [
              "sd3-core",
              "sd3-ultra",
              "sd3-large",
              "sd3-large-turbo",
              "sd3-medium",
              "sd3.5-large",
              "sd3.5-large-turbo",
              "sd3.5-medium",
            ],
          },
          {
            name: "height",
            type: "range",
            label: "Height",
            min: 640,
            max: 1536,
            step: 64,
            default: 1024,
            showFor: ["sdxl-1.0"],
          },
          {
            name: "width",
            type: "range",
            label: "Width",
            min: 640,
            max: 1536,
            step: 64,
            default: 1024,
            showFor: ["sdxl-1.0"],
          },
          {
            name: "cfg_scale",
            type: "range",
            label: "CFG Scale",
            min: 0,
            max: 35,
            step: 0.5,
            default: 7,
            showFor: ["sdxl-1.0"],
          },
          {
            name: "sampler",
            type: "select",
            label: "Sampler",
            options: [
              "DDIM",
              "DDPM",
              "K_DPMPP_2M",
              "K_DPMPP_2S_ANCESTRAL",
              "K_DPM_2",
              "K_DPM_2_ANCESTRAL",
              "K_EULER",
              "K_EULER_ANCESTRAL",
              "K_HEUN",
              "K_LMS",
            ],
            default: "K_EULER",
            showFor: ["sdxl-1.0"],
          },
          {
            name: "steps",
            type: "range",
            label: "Steps",
            min: 1,
            max: 50,
            default: 20,
            showFor: ["sdxl-1.0"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "16:9",
              "1:1",
              "21:9",
              "2:3",
              "3:2",
              "4:5",
              "5:4",
              "9:16",
              "9:21",
            ],
            default: "1:1",
            showFor: [
              "sd3-core",
              "sd3-ultra",
              "sd3-large",
              "sd3-large-turbo",
              "sd3-medium",
              "sd3.5-large",
              "sd3.5-large-turbo",
              "sd3.5-medium",
            ],
          },
          {
            name: "style_preset",
            type: "select",
            label: "Style Preset",
            options: [
              "3d-model",
              "analog-film",
              "anime",
              "cinematic",
              "comic-book",
              "digital-art",
              "enhance",
              "fantasy-art",
              "isometric",
              "line-art",
              "low-poly",
              "modeling-compound",
              "neon-punk",
              "origami",
              "photographic",
              "pixel-art",
              "tile-texture",
            ],
            showFor: ["sdxl-1.0", "sd3-core"],
          },
          {
            name: "seed",
            type: "number",
            label: "Seed",
            min: 0,
            max: 4294967295,
          },
        ],
      },
    ],
  },
  {
    id: "recraft",
    name: "Recraft",
    description: "Recraft image generation models",
    type: "image",
    models: [
      {
        id: "recraft",
        name: "Recraft",
        description: "Recraft models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["recraft-v3"],
            default: "recraft-v3",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "size",
            type: "select",
            label: "Size",
            required: true,
            options: [
              "1024x1024",
              "1365x1024",
              "1024x1365",
              "1536x1024",
              "1024x1536",
              "1820x1024",
              "1024x1820",
              "1024x2048",
              "2048x1024",
              "1434x1024",
              "1024x1434",
              "1024x1280",
              "1280x1024",
              "1024x1707",
              "1707x1024",
            ],
            default: "1024x1024",
          },
          {
            name: "style",
            type: "select",
            label: "Style",
            options: [
              "digital_illustration",
              "digital_illustration/pixel_art",
              "digital_illustration/hand_drawn",
              "digital_illustration/grain",
              "digital_illustration/infantile_sketch",
              "digital_illustration/2d_art_poster",
              "digital_illustration/handmade_3d",
              "digital_illustration/hand_drawn_outline",
              "digital_illustration/engraving_color",
              "digital_illustration/2d_art_poster_2",
              "realistic_image",
              "realistic_image/b_and_w",
              "realistic_image/hard_flash",
              "realistic_image/hdr",
              "realistic_image/natural_light",
              "realistic_image/studio_portrait",
              "realistic_image/enterprise",
              "realistic_image/motion_blur",
              "vector_illustration",
              "vector_illustration/engraving",
              "vector_illustration/line_art",
              "vector_illustration/line_circuit",
              "vector_illustration/linocut",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ideogram",
    name: "Ideogram",
    description: "Ideogram image generation models",
    type: "image",
    models: [
      {
        id: "ideogram",
        name: "Ideogram",
        description: "Ideogram models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["ideogram-v2", "ideogram-v2-turbo"],
            default: "ideogram-v2",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "negative_prompt",
            type: "textarea",
            label: "Negative Prompt",
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "1:1",
              "16:9",
              "9:16",
              "4:3",
              "3:4",
              "3:2",
              "2:3",
              "16:10",
              "10:16",
              "3:1",
              "1:3",
            ],
            default: "1:1",
          },
          {
            name: "style_type",
            type: "select",
            label: "Style Type",
            options: [
              "Auto",
              "General",
              "Realistic",
              "Design",
              "Render 3D",
              "Anime",
            ],
            default: "Auto",
          },
          {
            name: "magic_prompt_option",
            type: "select",
            label: "Magic Prompt",
            options: ["Auto", "On", "Off"],
            default: "Auto",
          },
        ],
      },
    ],
  },
  {
    id: "photon",
    name: "Luma",
    description: "Luma image generation models",
    type: "image",
    models: [
      {
        id: "photon",
        name: "Photon",
        description: "Photon models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["photon", "photon-flash"],
            default: "photon",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["1:1", "3:4", "4:3", "9:16", "16:9", "9:21", "21:9"],
            default: "16:9",
          },
          {
            name: "image_reference_url",
            type: "file",
            label: "Image Reference",
          },
          {
            name: "image_reference_weight",
            type: "range",
            label: "Image Reference Weight",
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.85,
          },
          {
            name: "style_reference_url",
            type: "file",
            label: "Style Reference",
          },
          {
            name: "style_reference_weight",
            type: "range",
            label: "Style Reference Weight",
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.85,
          },
          {
            name: "character_reference_url",
            type: "file",
            label: "Character Reference",
          },
        ],
      },
    ],
  },
  {
    id: "grok",
    name: "x.AI",
    description: "x.AI image generation models",
    type: "image",
    models: [
      {
        id: "grok",
        name: "Grok",
        description: "Grok models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["grok-2-image"],
            default: "grok-2-image",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
        ],
      },
    ],
  },
  {
    id: "kling",
    name: "Kling",
    description: "Kling video generation models",
    type: "video",
    models: [
      {
        id: "kling",
        name: "Kling",
        description: "Kling model",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["kling-v1.6-pro", "kling-v1.6-standard"],
            default: "kling-v1.6-standard",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "start_image",
            type: "file",
            label: "Start Image",
            required: true,
          },
          {
            name: "end_image",
            type: "file",
            label: "End Image",
            required: false,
          },
          {
            name: "duration",
            type: "select",
            label: "Duration (seconds)",
            options: [5, 10],
            default: 5,
            required: false,
          },
          {
            name: "cfg_scale",
            type: "range",
            label: "CFG Scale",
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.5,
            required: false,
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["16:9", "1:1", "9:16"],
            default: "16:9",
            required: false,
          },
          {
            name: "negative_prompt",
            type: "textarea",
            label: "Negative Prompt",
            required: false,
          },
        ],
      },
    ],
  },
  {
    id: "google-video",
    name: "Google",
    description: "Google video generation models",
    type: "video",
    models: [
      {
        id: "veo-2-config",
        name: "Veo 2",
        description: "Google Veo 2 Model",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["veo-2"],
            default: "veo-2",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "image",
            type: "file",
            label: "Input Image",
            required: true,
            showFor: ["veo-2"],
          },
          {
            name: "duration",
            type: "select",
            label: "Duration (seconds)",
            options: [5, 6, 7, 8],
            default: 5,
            required: false,
            showFor: ["veo-2"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["16:9", "9:16"],
            default: "16:9",
            required: false,
            showFor: ["veo-2"],
          },
        ],
      },
    ],
  },
];
