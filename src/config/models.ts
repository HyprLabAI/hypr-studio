import { z } from "zod";

// ============================================================================
// Shared / Base Validations
// ============================================================================

const baseValidation = {
  prompt: z.string().min(1).max(10000),
  output_format: z.enum(["png", "jpeg", "webp"]).default("png"),
};

// ============================================================================
// Model Validations
// ============================================================================

export const modelValidations: Record<string, z.ZodSchema<any>> = {
  // ============================================================================
  // --- Black Forest Labs ---
  // ============================================================================

  "flux-2-max": z.object({
    ...baseValidation,
    model: z.literal("flux-2-max"),
    input_images: z
      .union([
        z.string().url("Image must be a valid URL."),
        z.array(z.string().url()).min(1).max(8),
      ])
      .optional(),
    aspect_ratio: z
      .enum([
        "match_input_image",
        "1:1",
        "16:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "9:16",
        "3:4",
        "4:3",
      ])
      .optional()
      .default("1:1"),
    resolution: z
      .enum(["match_input_image", "0.5 MP", "1 MP", "2 MP", "4 MP"])
      .optional()
      .default("1 MP"),
    seed: z.number().min(0).max(4294967295).optional(),
  }),

  "flux-2-pro": z.object({
    ...baseValidation,
    model: z.literal("flux-2-pro"),
    input_images: z
      .union([
        z.string().url("Image must be a valid URL."),
        z.array(z.string().url()).min(1).max(8),
      ])
      .optional(),
    aspect_ratio: z
      .enum([
        "match_input_image",
        "1:1",
        "16:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "9:16",
        "3:4",
        "4:3",
      ])
      .optional()
      .default("1:1"),
    resolution: z
      .enum(["match_input_image", "0.5 MP", "1 MP", "2 MP", "4 MP"])
      .optional()
      .default("1 MP"),
    seed: z.number().min(0).max(4294967295).optional(),
  }),

  "flux-2-flex": z.object({
    ...baseValidation,
    model: z.literal("flux-2-flex"),
    input_images: z
      .union([
        z.string().url("Image must be a valid URL."),
        z.array(z.string().url()).min(1).max(10),
      ])
      .optional(),
    aspect_ratio: z
      .enum([
        "match_input_image",
        "1:1",
        "16:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "9:16",
        "3:4",
        "4:3",
      ])
      .optional()
      .default("1:1"),
    resolution: z
      .enum(["match_input_image", "0.5 MP", "1 MP", "2 MP", "4 MP"])
      .optional()
      .default("1 MP"),
    steps: z.number().min(1).max(50).optional().default(30),
    guidance: z.number().min(1.5).max(10).optional().default(4.5),
    seed: z.number().min(0).max(4294967295).optional(),
  }),

  "flux-2-dev": z.object({
    ...baseValidation,
    model: z.literal("flux-2-dev"),
    input_images: z
      .union([
        z.string().url("Image must be a valid URL."),
        z.array(z.string().url()).min(1).max(5),
      ])
      .optional(),
    aspect_ratio: z
      .enum([
        "match_input_image",
        "1:1",
        "16:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "9:16",
        "3:4",
        "4:3",
      ])
      .optional()
      .default("1:1"),
    seed: z.number().min(0).max(4294967295).optional(),
  }),

  "flux-krea-dev": z.object({
    model: z.literal("flux-krea-dev"),
    prompt: z.string().min(1),
    aspect_ratio: z
      .enum([
        "1:1",
        "16:9",
        "21:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "3:4",
        "4:3",
        "9:16",
        "9:21",
      ])
      .optional()
      .default("1:1"),
    image: z.string().url().optional(),
    prompt_strength: z.number().min(0).max(1).optional().default(0.8),
    num_inference_steps: z.number().min(4).max(50).optional().default(28),
    guidance: z.number().min(0).max(10).optional().default(4.5),
  }),

  "flux-kontext-max": z.object({
    model: z.literal("flux-kontext-max"),
    prompt: z.string().min(1),
    input_image: z.string().url().optional(),
    aspect_ratio: z
      .enum([
        "match_input_image",
        "1:1",
        "16:9",
        "21:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "3:4",
        "4:3",
        "9:16",
        "9:21",
        "2:1",
        "1:2",
      ])
      .optional()
      .default("match_input_image"),
  }),

  "flux-kontext-pro": z.object({
    model: z.literal("flux-kontext-pro"),
    prompt: z.string().min(1),
    input_image: z.string().url().optional(),
    aspect_ratio: z
      .enum([
        "match_input_image",
        "1:1",
        "16:9",
        "21:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "3:4",
        "4:3",
        "9:16",
        "9:21",
        "2:1",
        "1:2",
      ])
      .optional()
      .default("match_input_image"),
  }),

  "flux-kontext-dev": z.object({
    model: z.literal("flux-kontext-dev"),
    prompt: z.string().min(1),
    input_image: z.string().url(),
    aspect_ratio: z
      .enum([
        "1:1",
        "16:9",
        "21:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "3:4",
        "4:3",
        "9:16",
        "9:21",
        "match_input_image",
      ])
      .optional()
      .default("match_input_image"),
    num_inference_steps: z.number().min(4).max(50).optional().default(28),
    guidance: z.number().min(0).max(10).optional().default(2.5),
  }),

  "flux-1.1-pro-ultra": z.object({
    model: z.literal("flux-1.1-pro-ultra"),
    prompt: z.string().min(1),
    image_prompt: z.string().url().optional(),
    aspect_ratio: z
      .enum(["21:9", "16:9", "3:2", "4:3", "1:1", "3:4", "2:3", "9:16", "9:21"])
      .optional()
      .default("1:1"),
    image_prompt_strength: z.number().min(0).max(1).optional().default(0.1),
    raw: z.boolean().optional().default(false),
  }),

  "flux-1.1-pro": z.object({
    model: z.literal("flux-1.1-pro"),
    prompt: z.string().min(1),
    image_prompt: z.string().url().optional(),
    aspect_ratio: z
      .enum(["1:1", "16:9", "9:16", "4:3", "3:4"])
      .optional()
      .default("1:1"),
  }),

  // ============================================================================
  // --- Kling Models ---
  // ============================================================================

  "kling-v2.6": z.object({
    model: z.literal("kling-v2.6"),
    prompt: z.string().min(1),
    duration: z
      .union([z.literal(5), z.literal(10)])
      .optional()
      .default(5),
    start_image: z.string().url().optional(),
    end_image: z.string().url().optional(),
    aspect_ratio: z.enum(["16:9", "1:1", "9:16"]).optional().default("16:9"),
    negative_prompt: z.string().optional(),
    generate_audio: z.boolean().optional().default(false),
  }),

  "kling-v2.5-turbo-pro": z.object({
    model: z.literal("kling-v2.5-turbo-pro"),
    prompt: z.string().min(1),
    duration: z
      .union([z.literal(5), z.literal(10)])
      .optional()
      .default(5),
    start_image: z.string().url().optional(),
    end_image: z.string().url().optional(),
    aspect_ratio: z.enum(["16:9", "1:1", "9:16"]).optional().default("16:9"),
    negative_prompt: z.string().optional(),
  }),

  "kling-v2.1-master": z.object({
    model: z.literal("kling-v2.1-master"),
    prompt: z.string().min(1),
    duration: z
      .union([z.literal(5), z.literal(10)])
      .optional()
      .default(5),
    start_image: z.string().url().optional(),
    aspect_ratio: z.enum(["16:9", "1:1", "9:16"]).optional().default("16:9"),
    negative_prompt: z.string().optional(),
  }),

  "kling-v2.1-pro": z.object({
    model: z.literal("kling-v2.1-pro"),
    prompt: z.string().min(1),
    duration: z
      .union([z.literal(5), z.literal(10)])
      .optional()
      .default(5),
    start_image: z.string().url(),
    end_image: z.string().url().optional(),
    negative_prompt: z.string().optional(),
  }),

  "kling-v2.1-standard": z.object({
    model: z.literal("kling-v2.1-standard"),
    prompt: z.string().min(1),
    duration: z
      .union([z.literal(5), z.literal(10)])
      .optional()
      .default(5),
    start_image: z.string().url(),
    negative_prompt: z.string().optional(),
  }),

  "kling-v2": z.object({
    model: z.literal("kling-v2"),
    prompt: z.string().min(1),
    duration: z
      .union([z.literal(5), z.literal(10)])
      .optional()
      .default(5),
    cfg_scale: z.number().min(0).max(1).optional().default(0.5),
    start_image: z.string().url().optional(),
    aspect_ratio: z.enum(["16:9", "1:1", "9:16"]).optional().default("16:9"),
    negative_prompt: z.string().optional(),
  }),

  "kling-v1.6-pro": z.object({
    model: z.literal("kling-v1.6-pro"),
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
  }),

  "kling-v1.6-standard": z.object({
    model: z.literal("kling-v1.6-standard"),
    prompt: z.string().min(1),
    duration: z
      .union([z.literal(5), z.literal(10)])
      .optional()
      .default(5),
    cfg_scale: z.number().min(0).max(1).optional().default(0.5),
    start_image: z.string().url().optional(),
    aspect_ratio: z.enum(["16:9", "1:1", "9:16"]).optional().default("16:9"),
    negative_prompt: z.string().optional(),
  }),

  // ============================================================================
  // --- OpenAI Models ---
  // ============================================================================

  "dall-e-3": z.object({
    ...baseValidation,
    model: z.literal("dall-e-3"),
    size: z.enum(["1024x1024", "1792x1024", "1024x1792"]),
    quality: z.enum(["standard", "hd"]).optional(),
    style: z.enum(["vivid", "natural"]).optional(),
  }),

  "dall-e-2": z.object({
    ...baseValidation,
    model: z.literal("dall-e-2"),
    size: z.enum(["256x256", "512x512", "1024x1024"]),
  }),

  "chatgpt-image-latest": z.object({
    ...baseValidation,
    model: z.literal("chatgpt-image-latest"),
    image: z
      .union([z.string().url(), z.array(z.string().url()).min(1).max(16)])
      .optional(),
    mask: z.string().url().optional(),
    background: z
      .enum(["auto", "transparent", "opaque"])
      .optional()
      .default("auto"),
    moderation: z.enum(["auto", "low"]).optional().default("auto"),
    output_compression: z.number().min(0).max(100).optional().default(100),
    quality: z.enum(["low", "medium", "high"]).optional().default("medium"),
    size: z
      .enum(["1024x1024", "1024x1536", "1536x1024"])
      .optional()
      .default("1024x1024"),
  }),

  "gpt-image-1.5": z.object({
    ...baseValidation,
    model: z.literal("gpt-image-1.5"),
    image: z
      .union([z.string().url(), z.array(z.string().url()).min(1).max(16)])
      .optional(),
    mask: z.string().url().optional(),
    background: z
      .enum(["auto", "transparent", "opaque"])
      .optional()
      .default("auto"),
    moderation: z.enum(["auto", "low"]).optional().default("auto"),
    output_compression: z.number().min(0).max(100).optional().default(100),
    quality: z.enum(["low", "medium", "high"]).optional().default("medium"),
    size: z
      .enum(["1024x1024", "1024x1536", "1536x1024"])
      .optional()
      .default("1024x1024"),
  }),

  "gpt-image-1": z.object({
    ...baseValidation,
    model: z.literal("gpt-image-1"),
    image: z
      .union([z.string().url(), z.array(z.string().url()).min(1).max(16)])
      .optional(),
    mask: z.string().url().optional(),
    background: z
      .enum(["auto", "transparent", "opaque"])
      .optional()
      .default("auto"),
    moderation: z.enum(["auto", "low"]).optional().default("auto"),
    output_compression: z.number().min(0).max(100).optional().default(100),
    quality: z.enum(["low", "medium", "high"]).optional().default("medium"),
    size: z
      .enum(["1024x1024", "1024x1536", "1536x1024"])
      .optional()
      .default("1024x1024"),
  }),

  "gpt-image-1-mini": z.object({
    ...baseValidation,
    model: z.literal("gpt-image-1-mini"),
    image: z
      .union([z.string().url(), z.array(z.string().url()).min(1).max(16)])
      .optional(),
    mask: z.string().url().optional(),
    background: z
      .enum(["auto", "transparent", "opaque"])
      .optional()
      .default("auto"),
    moderation: z.enum(["auto", "low"]).optional().default("auto"),
    output_compression: z.number().min(0).max(100).optional().default(100),
    quality: z.enum(["low", "medium", "high"]).optional().default("medium"),
    size: z
      .enum(["1024x1024", "1024x1536", "1536x1024"])
      .optional()
      .default("1024x1024"),
  }),

  "sora-2-pro": z.object({
    model: z.literal("sora-2-pro"),
    prompt: z.string().min(1),
    input_reference: z.string().url().optional(),
    seconds: z.union([z.literal(4), z.literal(8), z.literal(12)]).optional(),
    aspect_ratio: z.enum(["portrait", "landscape"]).optional(),
    resolution: z.enum(["standard", "high"]).optional(),
  }),

  "sora-2": z.object({
    model: z.literal("sora-2"),
    prompt: z.string().min(1),
    input_reference: z.string().url().optional(),
    seconds: z.union([z.literal(4), z.literal(8), z.literal(12)]).optional(),
    aspect_ratio: z.enum(["portrait", "landscape"]).optional(),
  }),

  // ============================================================================
  // --- Google Models ---
  // ============================================================================

  "veo-3.1": z.object({
    model: z.literal("veo-3.1"),
    prompt: z.string().min(1),
    image: z.string().url().optional(),
    aspect_ratio: z.enum(["16:9", "9:16"]).optional(),
    negative_prompt: z.string().optional(),
    resolution: z.enum(["720p", "1080p"]).optional(),
    seed: z.number().min(0).max(4294967295).optional(),
    reference_images: z
      .union([z.string().url(), z.array(z.string().url()).min(1).max(3)])
      .optional(),
    last_frame: z.string().url().optional(),
  }),

  "veo-3.1-fast": z.object({
    model: z.literal("veo-3.1-fast"),
    prompt: z.string().min(1),
    image: z.string().url().optional(),
    aspect_ratio: z.enum(["16:9", "9:16"]).optional(),
    negative_prompt: z.string().optional(),
    resolution: z.enum(["720p", "1080p"]).optional(),
    seed: z.number().min(0).max(4294967295).optional(),
    last_frame: z.string().url().optional(),
  }),

  "veo-3": z.object({
    model: z.literal("veo-3"),
    prompt: z.string().min(1),
    image: z.string().url().optional(),
    aspect_ratio: z.enum(["16:9", "9:16"]).optional(),
    negative_prompt: z.string().optional(),
    resolution: z.enum(["720p", "1080p"]).optional(),
    seed: z.number().min(0).max(4294967295).optional(),
  }),

  "veo-3-fast": z.object({
    model: z.literal("veo-3-fast"),
    prompt: z.string().min(1),
    image: z.string().url().optional(),
    aspect_ratio: z.enum(["16:9", "9:16"]).optional(),
    negative_prompt: z.string().optional(),
    resolution: z.enum(["720p", "1080p"]).optional(),
    seed: z.number().min(0).max(4294967295).optional(),
  }),

  "nano-banana-pro": z.object({
    ...baseValidation,
    model: z.literal("nano-banana-pro"),
    image_input: z
      .union([z.string().url(), z.array(z.string().url()).min(1).max(14)])
      .optional(),
    aspect_ratio: z
      .enum([
        "match_input_image",
        "1:1",
        "16:9",
        "21:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "3:4",
        "4:3",
        "9:16",
        "9:21",
      ])
      .optional()
      .default("1:1"),
    resolution: z.enum(["1K", "2K", "4K"]).optional().default("2K"),
  }),

  "nano-banana": z.object({
    ...baseValidation,
    model: z.literal("nano-banana"),
    image_input: z
      .union([z.string().url(), z.array(z.string().url()).min(1).max(6)])
      .optional(),
    aspect_ratio: z
      .enum([
        "match_input_image",
        "1:1",
        "16:9",
        "21:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "3:4",
        "4:3",
        "9:16",
        "9:21",
      ])
      .optional()
      .default("1:1"),
  }),

  "imagen-4-ultra": z.object({
    ...baseValidation,
    model: z.literal("imagen-4-ultra"),
    aspect_ratio: z
      .enum(["1:1", "3:4", "4:3", "9:16", "16:9"])
      .optional()
      .default("1:1"),
  }),

  "imagen-4": z.object({
    ...baseValidation,
    model: z.literal("imagen-4"),
    aspect_ratio: z
      .enum(["1:1", "3:4", "4:3", "9:16", "16:9"])
      .optional()
      .default("1:1"),
  }),

  "imagen-4-fast": z.object({
    ...baseValidation,
    model: z.literal("imagen-4-fast"),
    aspect_ratio: z
      .enum(["1:1", "3:4", "4:3", "9:16", "16:9"])
      .optional()
      .default("1:1"),
  }),

  // ============================================================================
  // --- ByteDance Models ---
  // ============================================================================

  "seedream-4.5": z.object({
    ...baseValidation,
    model: z.literal("seedream-4.5"),
    image_input: z
      .union([z.string().url(), z.array(z.string().url()).min(1).max(14)])
      .optional(),
    size: z.enum(["2K", "4K"]).optional().default("2K"),
    aspect_ratio: z
      .enum([
        "match_input_image",
        "1:1",
        "4:3",
        "3:4",
        "16:9",
        "9:16",
        "3:2",
        "2:3",
        "21:9",
      ])
      .optional()
      .default("1:1"),
  }),

  "seedream-4": z.object({
    ...baseValidation,
    model: z.literal("seedream-4"),
    image_input: z
      .union([z.string().url(), z.array(z.string().url()).min(1).max(10)])
      .optional(),
    size: z.enum(["1K", "2K", "4K"]).optional().default("2K"),
    aspect_ratio: z
      .enum([
        "match_input_image",
        "1:1",
        "16:9",
        "21:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "3:4",
        "4:3",
        "9:16",
        "9:21",
      ])
      .optional()
      .default("1:1"),
  }),

  "seedream-3": z.object({
    ...baseValidation,
    model: z.literal("seedream-3"),
    aspect_ratio: z
      .enum(["1:1", "3:4", "4:3", "16:9", "9:16", "2:3", "3:2", "21:9"])
      .optional()
      .default("16:9"),
    size: z.enum(["small", "regular", "big"]).optional().default("regular"),
    guidance_scale: z.number().min(1).max(10).optional().default(2.5),
  }),

  "seededit-3": z.object({
    ...baseValidation,
    model: z.literal("seededit-3"),
    image: z.string().url("Image is required"),
    guidance_scale: z.number().min(1).max(10).optional().default(2.5),
  }),

  "dreamina-3.1": z.object({
    ...baseValidation,
    model: z.literal("dreamina-3.1"),
    enhance_prompt: z.boolean().optional().default(false),
    aspect_ratio: z
      .enum(["1:1", "4:3", "3:4", "3:2", "2:3", "16:9", "9:16", "21:9", "9:21"])
      .optional()
      .default("1:1"),
    resolution: z.enum(["1K", "2K"]).optional().default("2K"),
    seed: z.number().min(0).max(4294967295).optional(),
  }),

  "seedance-1.5-pro": z.object({
    model: z.literal("seedance-1.5-pro"),
    prompt: z.string().min(1),
    image: z.string().url().optional(),
    last_frame_image: z.string().url().optional(),
    duration: z.number().min(2).max(12).optional().default(5),
    aspect_ratio: z
      .enum(["16:9", "4:3", "1:1", "3:4", "9:16", "21:9", "9:21"])
      .optional()
      .default("16:9"),
    camera_fixed: z.boolean().optional().default(false),
    seed: z.number().min(0).max(4294967295).optional(),
  }),

  // ============================================================================
  // --- Recraft Models ---
  // ============================================================================

  "recraft-v3": z.object({
    ...baseValidation,
    model: z.literal("recraft-v3"),
    size: z
      .enum([
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
      ])
      .default("1024x1024"),
    style: z
      .enum([
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
      ])
      .optional(),
  }),

  // ============================================================================
  // --- Ideogram Models ---
  // ============================================================================

  "ideogram-v3-quality": z.object({
    ...baseValidation,
    model: z.literal("ideogram-v3-quality"),
    aspect_ratio: z
      .enum([
        "1:3",
        "3:1",
        "1:2",
        "2:1",
        "9:16",
        "16:9",
        "10:16",
        "16:10",
        "2:3",
        "3:2",
        "3:4",
        "4:3",
        "4:5",
        "5:4",
        "1:1",
      ])
      .default("1:1"),
    style_type: z
      .enum(["Auto", "General", "Realistic", "Design"])
      .optional()
      .default("Auto"),
    style_preset: z
      .enum([
        "None",
        "80s Illustration",
        "90s Nostalgia",
        "Abstract Organic",
        "Analog Nostalgia",
        "Art Brut",
        "Art Deco",
        "Art Poster",
        "Aura",
        "Avant Garde",
        "Bauhaus",
        "Blueprint",
        "Blurry Motion",
        "Bright Art",
        "C4D Cartoon",
        "Children's Book",
        "Collage",
        "Coloring Book I",
        "Coloring Book II",
        "Cubism",
        "Dark Aura",
        "Doodle",
        "Double Exposure",
        "Dramatic Cinema",
        "Editorial",
        "Emotional Minimal",
        "Ethereal Party",
        "Expired Film",
        "Flat Art",
        "Flat Vector",
        "Forest Reverie",
        "Geo Minimalist",
        "Glass Prism",
        "Golden Hour",
        "Graffiti I",
        "Graffiti II",
        "Halftone Print",
        "High Contrast",
        "Hippie Era",
        "Iconic",
        "Japandi Fusion",
        "Jazzy",
        "Long Exposure",
        "Magazine Editorial",
        "Minimal Illustration",
        "Mixed Media",
        "Monochrome",
        "Nightlife",
        "Oil Painting",
        "Old Cartoons",
        "Paint Gesture",
        "Pop Art",
        "Retro Etching",
        "Riviera Pop",
        "Spotlight 80s",
        "Stylized Red",
        "Surreal Collage",
        "Travel Poster",
        "Vintage Geo",
        "Vintage Poster",
        "Watercolor",
        "Weird",
        "Woodblock Print",
      ])
      .optional()
      .default("None"),
    magic_prompt_option: z
      .enum(["Auto", "On", "Off"])
      .optional()
      .default("Auto"),
  }),

  "ideogram-v3-balanced": z.object({
    ...baseValidation,
    model: z.literal("ideogram-v3-balanced"),
    aspect_ratio: z
      .enum([
        "1:3",
        "3:1",
        "1:2",
        "2:1",
        "9:16",
        "16:9",
        "10:16",
        "16:10",
        "2:3",
        "3:2",
        "3:4",
        "4:3",
        "4:5",
        "5:4",
        "1:1",
      ])
      .default("1:1"),
    style_type: z
      .enum(["Auto", "General", "Realistic", "Design"])
      .optional()
      .default("Auto"),
    style_preset: z
      .enum([
        "None",
        "80s Illustration",
        "90s Nostalgia",
        "Abstract Organic",
        "Analog Nostalgia",
        "Art Brut",
        "Art Deco",
        "Art Poster",
        "Aura",
        "Avant Garde",
        "Bauhaus",
        "Blueprint",
        "Blurry Motion",
        "Bright Art",
        "C4D Cartoon",
        "Children's Book",
        "Collage",
        "Coloring Book I",
        "Coloring Book II",
        "Cubism",
        "Dark Aura",
        "Doodle",
        "Double Exposure",
        "Dramatic Cinema",
        "Editorial",
        "Emotional Minimal",
        "Ethereal Party",
        "Expired Film",
        "Flat Art",
        "Flat Vector",
        "Forest Reverie",
        "Geo Minimalist",
        "Glass Prism",
        "Golden Hour",
        "Graffiti I",
        "Graffiti II",
        "Halftone Print",
        "High Contrast",
        "Hippie Era",
        "Iconic",
        "Japandi Fusion",
        "Jazzy",
        "Long Exposure",
        "Magazine Editorial",
        "Minimal Illustration",
        "Mixed Media",
        "Monochrome",
        "Nightlife",
        "Oil Painting",
        "Old Cartoons",
        "Paint Gesture",
        "Pop Art",
        "Retro Etching",
        "Riviera Pop",
        "Spotlight 80s",
        "Stylized Red",
        "Surreal Collage",
        "Travel Poster",
        "Vintage Geo",
        "Vintage Poster",
        "Watercolor",
        "Weird",
        "Woodblock Print",
      ])
      .optional()
      .default("None"),
    magic_prompt_option: z
      .enum(["Auto", "On", "Off"])
      .optional()
      .default("Auto"),
  }),

  "ideogram-v3-turbo": z.object({
    ...baseValidation,
    model: z.literal("ideogram-v3-turbo"),
    aspect_ratio: z
      .enum([
        "1:3",
        "3:1",
        "1:2",
        "2:1",
        "9:16",
        "16:9",
        "10:16",
        "16:10",
        "2:3",
        "3:2",
        "3:4",
        "4:3",
        "4:5",
        "5:4",
        "1:1",
      ])
      .default("1:1"),
    style_type: z
      .enum(["Auto", "General", "Realistic", "Design"])
      .optional()
      .default("Auto"),
    style_preset: z
      .enum([
        "None",
        "80s Illustration",
        "90s Nostalgia",
        "Abstract Organic",
        "Analog Nostalgia",
        "Art Brut",
        "Art Deco",
        "Art Poster",
        "Aura",
        "Avant Garde",
        "Bauhaus",
        "Blueprint",
        "Blurry Motion",
        "Bright Art",
        "C4D Cartoon",
        "Children's Book",
        "Collage",
        "Coloring Book I",
        "Coloring Book II",
        "Cubism",
        "Dark Aura",
        "Doodle",
        "Double Exposure",
        "Dramatic Cinema",
        "Editorial",
        "Emotional Minimal",
        "Ethereal Party",
        "Expired Film",
        "Flat Art",
        "Flat Vector",
        "Forest Reverie",
        "Geo Minimalist",
        "Glass Prism",
        "Golden Hour",
        "Graffiti I",
        "Graffiti II",
        "Halftone Print",
        "High Contrast",
        "Hippie Era",
        "Iconic",
        "Japandi Fusion",
        "Jazzy",
        "Long Exposure",
        "Magazine Editorial",
        "Minimal Illustration",
        "Mixed Media",
        "Monochrome",
        "Nightlife",
        "Oil Painting",
        "Old Cartoons",
        "Paint Gesture",
        "Pop Art",
        "Retro Etching",
        "Riviera Pop",
        "Spotlight 80s",
        "Stylized Red",
        "Surreal Collage",
        "Travel Poster",
        "Vintage Geo",
        "Vintage Poster",
        "Watercolor",
        "Weird",
        "Woodblock Print",
      ])
      .optional()
      .default("None"),
    magic_prompt_option: z
      .enum(["Auto", "On", "Off"])
      .optional()
      .default("Auto"),
  }),

  "ideogram-v2a": z.object({
    ...baseValidation,
    model: z.literal("ideogram-v2a"),
    aspect_ratio: z
      .enum([
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
      ])
      .default("1:1"),
    style_type: z
      .enum(["Auto", "General", "Realistic", "Design", "Render 3D", "Anime"])
      .optional()
      .default("Auto"),
    magic_prompt_option: z
      .enum(["Auto", "On", "Off"])
      .optional()
      .default("Auto"),
  }),

  "ideogram-v2a-turbo": z.object({
    ...baseValidation,
    model: z.literal("ideogram-v2a-turbo"),
    aspect_ratio: z
      .enum([
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
      ])
      .default("1:1"),
    style_type: z
      .enum(["Auto", "General", "Realistic", "Design", "Render 3D", "Anime"])
      .optional()
      .default("Auto"),
    magic_prompt_option: z
      .enum(["Auto", "On", "Off"])
      .optional()
      .default("Auto"),
  }),

  "ideogram-v2": z.object({
    ...baseValidation,
    model: z.literal("ideogram-v2"),
    aspect_ratio: z
      .enum([
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
      ])
      .default("1:1"),
    style_type: z
      .enum(["Auto", "General", "Realistic", "Design", "Render 3D", "Anime"])
      .optional()
      .default("Auto"),
    magic_prompt_option: z
      .enum(["Auto", "On", "Off"])
      .optional()
      .default("Auto"),
    negative_prompt: z.string().optional(),
  }),

  "ideogram-v2-turbo": z.object({
    ...baseValidation,
    model: z.literal("ideogram-v2-turbo"),
    aspect_ratio: z
      .enum([
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
      ])
      .default("1:1"),
    style_type: z
      .enum(["Auto", "General", "Realistic", "Design", "Render 3D", "Anime"])
      .optional()
      .default("Auto"),
    magic_prompt_option: z
      .enum(["Auto", "On", "Off"])
      .optional()
      .default("Auto"),
    negative_prompt: z.string().optional(),
  }),

  // ============================================================================
  // --- Luma Labs Models ---
  // ============================================================================

  photon: z.object({
    ...baseValidation,
    model: z.literal("photon"),
    aspect_ratio: z
      .enum(["1:1", "3:4", "4:3", "9:16", "16:9", "9:21", "21:9"])
      .default("16:9"),
    image_reference_url: z.string().url().optional(),
    image_reference_weight: z.number().min(0).max(1).optional().default(0.85),
    style_reference_url: z.string().url().optional(),
    style_reference_weight: z.number().min(0).max(1).optional().default(0.85),
    character_reference_url: z.string().url().optional(),
  }),

  "photon-flash": z.object({
    ...baseValidation,
    model: z.literal("photon-flash"),
    aspect_ratio: z
      .enum(["1:1", "3:4", "4:3", "9:16", "16:9", "9:21", "21:9"])
      .default("16:9"),
    image_reference_url: z.string().url().optional(),
    image_reference_weight: z.number().min(0).max(1).optional().default(0.85),
    style_reference_url: z.string().url().optional(),
    style_reference_weight: z.number().min(0).max(1).optional().default(0.85),
    character_reference_url: z.string().url().optional(),
  }),

  // ============================================================================
  // --- x.AI Models ---
  // ============================================================================

  "grok-imagine-image": z.object({
    ...baseValidation,
    model: z.literal("grok-imagine-image"),
    image: z.string().url().optional(),
    aspect_ratio: z
      .enum([
        "1:1",
        "3:4",
        "4:3",
        "9:16",
        "16:9",
        "2:3",
        "3:2",
        "9:19.5",
        "19.5:9",
        "9:20",
        "20:9",
        "1:2",
        "2:1",
        "auto",
      ])
      .default("16:9"),
  }),

  "grok-2-image": z.object({
    ...baseValidation,
    model: z.literal("grok-2-image"),
  }),

  "grok-imagine-video": z.object({
    model: z.literal("grok-imagine-video"),
    prompt: z.string().min(1),
    image: z.string().url().optional(),
    video: z.string().url().optional(),
    duration: z.number().min(1).max(15).optional().default(6),
    aspect_ratio: z
      .enum(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"])
      .default("16:9"),
    resolution: z.enum(["480p", "720p"]).optional().default("720p"),
  }),

  // ============================================================================
  // --- Alibaba Models ---
  // ============================================================================

  "qwen-image-max": z.object({
    ...baseValidation,
    model: z.literal("qwen-image-max"),
    image: z.union([z.string().url(), z.array(z.string().url()).min(1).max(3)]),
    aspect_ratio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).default("16:9"),
  }),

  "qwen-image-edit-2511": z.object({
    ...baseValidation,
    model: z.literal("qwen-image-edit-2511"),
    image: z.union([z.string().url(), z.array(z.string().url()).min(1).max(4)]),
    aspect_ratio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).default("16:9"),
  }),

  "qwen-image-edit-plus": z.object({
    ...baseValidation,
    model: z.literal("qwen-image-edit-plus"),
    image: z.union([z.string().url(), z.array(z.string().url()).min(1).max(4)]),
    aspect_ratio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).default("16:9"),
  }),

  "qwen-image-edit": z.object({
    ...baseValidation,
    model: z.literal("qwen-image-edit"),
    image: z.string().url("Image is required"),
    aspect_ratio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).default("16:9"),
  }),

  "qwen-image-2512": z.object({
    ...baseValidation,
    model: z.literal("qwen-image-2512"),
    aspect_ratio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).default("16:9"),
    num_inference_steps: z.number().min(1).max(50).optional().default(50),
    guidance: z.number().min(0).max(10).optional().default(4),
  }),

  "qwen-image": z.object({
    ...baseValidation,
    model: z.literal("qwen-image"),
    enhance_prompt: z.boolean().optional().default(false),
    aspect_ratio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).default("16:9"),
    num_inference_steps: z.number().min(1).max(50).optional().default(50),
    guidance: z.number().min(0).max(10).optional().default(4),
  }),

  "wan-2.6-i2v": z.object({
    model: z.literal("wan-2.6-i2v"),
    prompt: z.string().min(1),
    negative_prompt: z.string().optional(),
    image: z.string().url().optional(),
    resolution: z.enum(["720p", "1080p"]).optional().default("720p"),
    duration: z
      .union([z.literal(5), z.literal(10), z.literal(15)])
      .optional()
      .default(5),
    enable_prompt_expansion: z.boolean().optional().default(false),
    multi_shots: z.boolean().optional().default(false),
    seed: z.number().min(0).max(4294967295).optional(),
  }),

  "wan-2.6-t2v": z.object({
    model: z.literal("wan-2.6-t2v"),
    prompt: z.string().min(1),
    negative_prompt: z.string().optional(),
    size: z
      .enum(["1280*720", "720*1280", "1920*1080", "1080*1920"])
      .optional()
      .default("1280*720"),
    duration: z
      .union([z.literal(5), z.literal(10), z.literal(15)])
      .optional()
      .default(5),
    enable_prompt_expansion: z.boolean().optional().default(false),
    multi_shots: z.boolean().optional().default(false),
    seed: z.number().min(0).max(4294967295).optional(),
  }),

  // ============================================================================
  // --- Pruna Models ---
  // ============================================================================

  "p-image-edit": z.object({
    ...baseValidation,
    model: z.literal("p-image-edit"),
    images: z.union([
      z.string().url(),
      z.array(z.string().url()).min(1).max(10),
    ]),
    aspect_ratio: z
      .enum([
        "match_input_image",
        "1:1",
        "16:9",
        "9:16",
        "4:3",
        "3:4",
        "3:2",
        "2:3",
      ])
      .default("match_input_image"),
  }),

  "p-image": z.object({
    ...baseValidation,
    model: z.literal("p-image"),
    aspect_ratio: z
      .enum(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"])
      .default("16:9"),
  }),
};

// ============================================================================
// --- Stability Models ---
// ============================================================================

[
  "stable-diffusion-3.5-large",
  "stable-diffusion-3.5-large-turbo",
  "stable-diffusion-3.5-medium",
  "stable-diffusion-3.5-flash",
].forEach((model) => {
  modelValidations[model] = z.object({
    ...baseValidation,
    model: z.literal(model),
    prompt: z.string().min(1).max(10000),
    negative_prompt: z.string().max(10000).optional(),
    aspect_ratio: z
      .enum(["16:9", "1:1", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"])
      .optional()
      .default("1:1"),
    seed: z.number().int().min(0).max(4294967294).optional(),
  });
});

["stable-image-ultra", "stable-image-core"].forEach((model) => {
  modelValidations[model] = z.object({
    ...baseValidation,
    model: z.literal(model),
    prompt: z.string().min(1).max(10000),
    negative_prompt: z.string().max(10000).optional(),
    aspect_ratio: z
      .enum(["16:9", "1:1", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"])
      .optional()
      .default("1:1"),
    seed: z.number().int().min(0).max(4294967294).optional(),
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
  });
});

// ============================================================================

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

// ============================================================================

export const modelFamilies: ModelFamily[] = [
  {
    id: "openai-image",
    name: "OpenAI",
    description: "OpenAI Image models",
    type: "image",
    models: [
      {
        id: "openai-image",
        name: "OpenAI",
        description: "OpenAI Image models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: [
              "chatgpt-image-latest",
              "gpt-image-1.5",
              "gpt-image-1",
              "gpt-image-1-mini",
              "dall-e-3",
              "dall-e-2",
            ],
            default: "chatgpt-image-latest",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "size",
            type: "select",
            label: "Size",
            options: ["1024x1024", "1792x1024", "1024x1792"],
            showFor: ["dall-e-3"],
            default: "1024x1024",
          },
          {
            name: "quality",
            type: "select",
            label: "Quality",
            options: ["standard", "hd"],
            showFor: ["dall-e-3"],
            default: "standard",
          },
          {
            name: "style",
            type: "select",
            label: "Style",
            options: ["vivid", "natural", "none"],
            showFor: ["dall-e-3"],
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
            showFor: [
              "chatgpt-image-latest",
              "gpt-image-1.5",
              "gpt-image-1",
              "gpt-image-1-mini",
            ],
            required: false,
          },
          {
            name: "mask",
            type: "file",
            label: "Mask Input",
            showFor: [
              "chatgpt-image-latest",
              "gpt-image-1.5",
              "gpt-image-1",
              "gpt-image-1-mini",
            ],
            required: false,
          },
          {
            name: "background",
            type: "select",
            label: "Background",
            options: ["auto", "transparent", "opaque"],
            showFor: [
              "chatgpt-image-latest",
              "gpt-image-1.5",
              "gpt-image-1",
              "gpt-image-1-mini",
            ],
            default: "auto",
          },
          {
            name: "moderation",
            type: "select",
            label: "Moderation",
            options: ["auto", "low"],
            showFor: [
              "chatgpt-image-latest",
              "gpt-image-1.5",
              "gpt-image-1",
              "gpt-image-1-mini",
            ],
            default: "auto",
          },
          {
            name: "output_compression",
            type: "range",
            label: "Output Compression",
            min: 0,
            max: 100,
            step: 1,
            showFor: [
              "chatgpt-image-latest",
              "gpt-image-1.5",
              "gpt-image-1",
              "gpt-image-1-mini",
            ],
            default: 100,
          },
          {
            name: "quality",
            type: "select",
            label: "Quality",
            options: ["low", "medium", "high"],
            showFor: [
              "chatgpt-image-latest",
              "gpt-image-1.5",
              "gpt-image-1",
              "gpt-image-1-mini",
            ],
            default: "medium",
          },
          {
            name: "size",
            type: "select",
            label: "Size",
            options: ["1024x1024", "1024x1536", "1536x1024"],
            showFor: [
              "chatgpt-image-latest",
              "gpt-image-1.5",
              "gpt-image-1",
              "gpt-image-1-mini",
            ],
            default: "1024x1024",
          },
        ],
      },
    ],
  },
  {
    id: "google-image",
    name: "Google",
    description: "Google Image models",
    type: "image",
    models: [
      {
        id: "google-image",
        name: "Google",
        description: "Google Image models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: [
              "nano-banana-pro",
              "nano-banana",
              "imagen-4-ultra",
              "imagen-4",
              "imagen-4-fast",
            ],
            default: "nano-banana-pro",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "image_input",
            type: "file",
            label: "Image Input",
            showFor: ["nano-banana-pro", "nano-banana"],
            required: false,
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["1:1", "3:4", "4:3", "9:16", "16:9"],
            showFor: ["imagen-4-ultra", "imagen-4", "imagen-4-fast"],
            default: "1:1",
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "match_input_image",
              "1:1",
              "9:16",
              "16:9",
              "3:4",
              "4:3",
              "3:2",
              "2:3",
              "5:4",
              "4:5",
              "21:9",
            ],
            showFor: ["nano-banana-pro", "nano-banana"],
            default: "1:1",
          },
          {
            name: "resolution",
            type: "select",
            label: "Resolution",
            options: ["1K", "2K", "4K"],
            default: "2K",
            showFor: ["nano-banana-pro"],
          },
        ],
      },
    ],
  },
  {
    id: "xai-image",
    name: "x.AI",
    description: "x.AI Image models",
    type: "image",
    models: [
      {
        id: "xai-image",
        name: "x.AI",
        description: "x.AI Image models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["grok-imagine-image", "grok-2-image"],
            default: "grok-imagine-image",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "image",
            type: "file",
            label: "Image",
            required: false,
            showFor: ["grok-imagine-image"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "1:1",
              "3:4",
              "4:3",
              "9:16",
              "16:9",
              "2:3",
              "3:2",
              "9:19.5",
              "19.5:9",
              "9:20",
              "20:9",
              "1:2",
              "2:1",
              "auto",
            ],
            default: "1:1",
            showFor: ["grok-imagine-image"],
          },
        ],
      },
    ],
  },
  {
    id: "black-forest-labs",
    name: "Black Forest Labs",
    description: "Black Forest Labs Image models",
    type: "image",
    models: [
      {
        id: "black-forest-labs",
        name: "Black Forest Labs",
        description: "Black Forest Labs Image models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: [
              "flux-2-max",
              "flux-2-pro",
              "flux-2-flex",
              "flux-2-dev",
              "flux-krea-dev",
              "flux-kontext-max",
              "flux-kontext-pro",
              "flux-kontext-dev",
              "flux-1.1-pro-ultra",
              "flux-1.1-pro",
            ],
            default: "flux-2-max",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "input_images",
            type: "file",
            label: "Input Images",
            showFor: ["flux-2-max", "flux-2-pro", "flux-2-flex", "flux-2-dev"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "match_input_image",
              "1:1",
              "16:9",
              "3:2",
              "2:3",
              "4:5",
              "5:4",
              "9:16",
              "3:4",
              "4:3",
            ],
            default: "1:1",
            showFor: ["flux-2-max", "flux-2-pro", "flux-2-flex", "flux-2-dev"],
          },
          {
            name: "resolution",
            type: "select",
            label: "Resolution",
            options: ["match_input_image", "0.5 MP", "1 MP", "2 MP", "4 MP"],
            default: "1 MP",
            showFor: ["flux-2-max", "flux-2-pro", "flux-2-flex"],
          },
          {
            name: "input_image",
            type: "file",
            label: "Input Image",
            showFor: ["flux-kontext-max", "flux-kontext-pro"],
          },
          {
            name: "image_prompt",
            type: "file",
            label: "Image Prompt",
            showFor: ["flux-1.1-pro-ultra", "flux-1.1-pro"],
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
            showFor: ["flux-2-flex"],
          },
          {
            name: "guidance",
            type: "range",
            label: "Guidance",
            showFor: ["flux-2-flex"],
            min: 1.5,
            max: 10,
            step: 0.01,
            default: 4.5,
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
              "1:1",
              "3:4",
              "2:3",
              "9:16",
              "9:21",
            ],
            default: "1:1",
            showFor: ["flux-1.1-pro-ultra"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["1:1", "16:9", "9:16", "4:3", "3:4"],
            default: "1:1",
            showFor: ["flux-1.1-pro"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "match_input_image",
              "1:1",
              "16:9",
              "9:16",
              "4:3",
              "3:4",
              "3:2",
              "2:3",
              "4:5",
              "5:4",
              "21:9",
              "9:21",
              "2:1",
              "1:2",
            ],
            default: "match_input_image",
            showFor: ["flux-kontext-max", "flux-kontext-pro"],
          },
          {
            name: "raw",
            type: "checkbox",
            label: "Raw Output",
            default: false,
            showFor: ["flux-1.1-pro-ultra"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "1:1",
              "16:9",
              "21:9",
              "3:2",
              "2:3",
              "4:5",
              "5:4",
              "3:4",
              "4:3",
              "9:16",
              "9:21",
            ],
            default: "1:1",
            showFor: ["flux-krea-dev"],
          },
          {
            name: "input_image",
            type: "file",
            label: "Input Image",
            required: true,
            showFor: ["flux-kontext-dev"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "1:1",
              "16:9",
              "21:9",
              "3:2",
              "2:3",
              "4:5",
              "5:4",
              "3:4",
              "4:3",
              "9:16",
              "9:21",
              "match_input_image",
            ],
            default: "match_input_image",
            showFor: ["flux-kontext-dev"],
          },
          {
            name: "image",
            type: "file",
            label: "Image",
            showFor: ["flux-krea-dev"],
          },
          {
            name: "prompt_strength",
            type: "range",
            label: "Prompt Strength",
            showFor: ["flux-krea-dev"],
            min: 0,
            max: 1,
            step: 0.01,
            default: 0.8,
          },
          {
            name: "num_inference_steps",
            type: "range",
            label: "Number Inference Steps",
            showFor: ["flux-krea-dev", "flux-kontext-dev"],
            min: 1,
            max: 50,
            default: 28,
          },
          {
            name: "guidance",
            type: "range",
            label: "Guidance",
            showFor: ["flux-krea-dev"],
            min: 0,
            max: 10,
            step: 0.01,
            default: 4.5,
          },
          {
            name: "guidance",
            type: "range",
            label: "Guidance",
            showFor: ["flux-kontext-dev"],
            min: 0,
            max: 10,
            step: 0.01,
            default: 2.5,
          },
          {
            name: "seed",
            type: "number",
            label: "Seed",
            min: 0,
            max: 4294967295,
            showFor: ["flux-2-max", "flux-2-pro", "flux-2-flex", "flux-2-dev"],
          },
        ],
      },
    ],
  },
  {
    id: "bytedance-image",
    name: "ByteDance",
    description: "ByteDance Image models",
    type: "image",
    models: [
      {
        id: "bytedance-image",
        name: "ByteDance",
        description: "ByteDance Image models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: [
              "seedream-4.5",
              "seedream-4",
              "seedream-3",
              "seededit-3",
              "dreamina-3.1",
            ],
            default: "seedream-4.5",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "image",
            type: "file",
            label: "Image",
            required: true,
            showFor: ["seededit-3"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "1:1",
              "3:4",
              "4:3",
              "16:9",
              "9:16",
              "2:3",
              "3:2",
              "21:9",
            ],
            default: "16:9",
            showFor: ["seedream-3"],
          },
          {
            name: "size",
            type: "select",
            label: "Size",
            options: ["small", "regular", "big"],
            default: "regular",
            showFor: ["seedream-3"],
          },
          {
            name: "guidance_scale",
            type: "range",
            label: "Guidance Scale",
            min: 1,
            max: 10,
            step: 0.01,
            default: 2.5,
            showFor: ["seededit-3", "seedream-3"],
          },
          {
            name: "image_input",
            type: "file",
            label: "Image Input",
            required: false,
            showFor: ["seedream-4.5", "seedream-4"],
          },
          {
            name: "size",
            type: "select",
            label: "Size",
            options: ["1K", "2K", "4K"],
            default: "2K",
            showFor: ["seedream-4"],
          },
          {
            name: "size",
            type: "select",
            label: "Size",
            options: ["2K", "4K"],
            default: "2K",
            showFor: ["seedream-4.5"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "match_input_image",
              "1:1",
              "4:3",
              "3:4",
              "16:9",
              "9:16",
              "3:2",
              "2:3",
              "21:9",
            ],
            default: "1:1",
            showFor: ["seedream-4.5", "seedream-4"],
          },
          {
            name: "enhance_prompt",
            type: "checkbox",
            label: "Enhance Prompt",
            default: false,
            showFor: ["dreamina-3.1"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "1:1",
              "4:3",
              "3:4",
              "3:2",
              "2:3",
              "16:9",
              "9:16",
              "21:9",
              "9:21",
            ],
            default: "1:1",
            showFor: ["dreamina-3.1"],
          },
          {
            name: "resolution",
            type: "select",
            label: "Resolution",
            options: ["1K", "2K"],
            default: "2K",
            showFor: ["dreamina-3.1"],
          },
          {
            name: "seed",
            type: "number",
            label: "Seed",
            min: 0,
            max: 4294967295,
            showFor: ["dreamina-3.1"],
          },
        ],
      },
    ],
  },
  {
    id: "alibaba-image",
    name: "Alibaba",
    description: "Alibaba Image models",
    type: "image",
    models: [
      {
        id: "alibaba-image",
        name: "Alibaba",
        description: "Alibaba Image models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: [
              "qwen-image-max",
              "qwen-image-edit-2511",
              "qwen-image-edit-plus",
              "qwen-image-edit",
              "qwen-image-2512",
              "qwen-image",
            ],
            default: "qwen-image-max",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "image",
            type: "file",
            label: "Image",
            required: true,
            showFor: [
              "qwen-image-max",
              "qwen-image-edit-2511",
              "qwen-image-edit-plus",
              "qwen-image-edit",
            ],
          },
          {
            name: "enhance_prompt",
            type: "checkbox",
            label: "Enhance Prompt",
            default: false,
            showFor: ["qwen-image"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["1:1", "16:9", "9:16", "4:3", "3:4"],
            default: "16:9",
          },
          {
            name: "num_inference_steps",
            type: "range",
            label: "Number Inference Steps",
            min: 1,
            max: 50,
            default: 50,
            showFor: ["qwen-image-2512", "qwen-image"],
          },
          {
            name: "guidance",
            type: "range",
            label: "Guidance",
            min: 0,
            max: 10,
            step: 0.01,
            default: 4,
            showFor: ["qwen-image-2512", "qwen-image"],
          },
        ],
      },
    ],
  },
  {
    id: "pruna",
    name: "Pruna",
    description: "Pruna Image models",
    type: "image",
    models: [
      {
        id: "pruna",
        name: "Pruna",
        description: "Pruna Image models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["p-image-edit", "p-image"],
            default: "p-image-edit",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "images",
            type: "file",
            label: "Images",
            required: true,
            showFor: ["p-image-edit"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "match_input_image",
              "1:1",
              "16:9",
              "9:16",
              "4:3",
              "3:4",
              "3:2",
              "2:3",
            ],
            default: "1:1",
            showFor: ["p-image-edit"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"],
            default: "16:9",
            showFor: ["p-image"],
          },
        ],
      },
    ],
  },
  {
    id: "stability",
    name: "Stability",
    description: "Stability Image models",
    type: "image",
    models: [
      {
        id: "stability",
        name: "Stability",
        description: "Stability Image models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: [
              "stable-diffusion-3.5-large",
              "stable-diffusion-3.5-large-turbo",
              "stable-diffusion-3.5-medium",
              "stable-diffusion-3.5-flash",
              "stable-image-ultra",
              "stable-image-core",
            ],
            default: "stable-diffusion-3.5-large",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "negative_prompt",
            type: "textarea",
            label: "Negative Prompt",
            required: false,
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
            required: false,
          },
          {
            name: "seed",
            type: "number",
            label: "Seed",
            min: 0,
            max: 4294967294,
            required: false,
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
            showFor: ["stable-image-ultra", "stable-image-core"],
            required: false,
          },
        ],
      },
    ],
  },
  {
    id: "recraft",
    name: "Recraft",
    description: "Recraft Image models",
    type: "image",
    models: [
      {
        id: "recraft",
        name: "Recraft",
        description: "Recraft Image models",
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
    description: "Ideogram Image models",
    type: "image",
    models: [
      {
        id: "ideogram",
        name: "Ideogram",
        description: "Ideogram Image models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: [
              "ideogram-v3-quality",
              "ideogram-v3-balanced",
              "ideogram-v3-turbo",
              "ideogram-v2a",
              "ideogram-v2a-turbo",
              "ideogram-v2",
              "ideogram-v2-turbo",
            ],
            default: "ideogram-v3-quality",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "negative_prompt",
            type: "textarea",
            label: "Negative Prompt",
            showFor: ["ideogram-v2", "ideogram-v2-turbo"],
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
            showFor: [
              "ideogram-v2a",
              "ideogram-v2a-turbo",
              "ideogram-v2",
              "ideogram-v2-turbo",
            ],
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
            showFor: [
              "ideogram-v2a",
              "ideogram-v2a-turbo",
              "ideogram-v2",
              "ideogram-v2-turbo",
            ],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: [
              "1:3",
              "3:1",
              "1:2",
              "2:1",
              "9:16",
              "16:9",
              "10:16",
              "16:10",
              "2:3",
              "3:2",
              "3:4",
              "4:3",
              "4:5",
              "5:4",
              "1:1",
            ],
            default: "1:1",
            showFor: [
              "ideogram-v3-quality",
              "ideogram-v3-balanced",
              "ideogram-v3-turbo",
            ],
          },
          {
            name: "style_type",
            type: "select",
            label: "Style Type",
            options: ["Auto", "General", "Realistic", "Design"],
            default: "Auto",
            showFor: [
              "ideogram-v3-quality",
              "ideogram-v3-balanced",
              "ideogram-v3-turbo",
            ],
          },
          {
            name: "style_preset",
            type: "select",
            label: "Style Preset",
            options: [
              "None",
              "80s Illustration",
              "90s Nostalgia",
              "Abstract Organic",
              "Analog Nostalgia",
              "Art Brut",
              "Art Deco",
              "Art Poster",
              "Aura",
              "Avant Garde",
              "Bauhaus",
              "Blueprint",
              "Blurry Motion",
              "Bright Art",
              "C4D Cartoon",
              "Children's Book",
              "Collage",
              "Coloring Book I",
              "Coloring Book II",
              "Cubism",
              "Dark Aura",
              "Doodle",
              "Double Exposure",
              "Dramatic Cinema",
              "Editorial",
              "Emotional Minimal",
              "Ethereal Party",
              "Expired Film",
              "Flat Art",
              "Flat Vector",
              "Forest Reverie",
              "Geo Minimalist",
              "Glass Prism",
              "Golden Hour",
              "Graffiti I",
              "Graffiti II",
              "Halftone Print",
              "High Contrast",
              "Hippie Era",
              "Iconic",
              "Japandi Fusion",
              "Jazzy",
              "Long Exposure",
              "Magazine Editorial",
              "Minimal Illustration",
              "Mixed Media",
              "Monochrome",
              "Nightlife",
              "Oil Painting",
              "Old Cartoons",
              "Paint Gesture",
              "Pop Art",
              "Retro Etching",
              "Riviera Pop",
              "Spotlight 80s",
              "Stylized Red",
              "Surreal Collage",
              "Travel Poster",
              "Vintage Geo",
              "Vintage Poster",
              "Watercolor",
              "Weird",
              "Woodblock Print",
            ],
            default: "None",
            showFor: [
              "ideogram-v3-quality",
              "ideogram-v3-balanced",
              "ideogram-v3-turbo",
            ],
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
    id: "luma-labs",
    name: "Luma Labs",
    description: "Luma Labs Image models",
    type: "image",
    models: [
      {
        id: "luma-labs",
        name: "Luma Labs",
        description: "Luma Labs Image models",
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
    id: "openai-video",
    name: "OpenAI",
    description: "OpenAI Video models",
    type: "video",
    models: [
      {
        id: "openai-video",
        name: "OpenAI",
        description: "OpenAI Video models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["sora-2-pro", "sora-2"],
            default: "sora-2-pro",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "input_reference",
            type: "file",
            label: "Input Reference",
            required: false,
          },
          {
            name: "seconds",
            type: "select",
            label: "Seconds",
            options: [4, 8, 12],
            default: 4,
            required: false,
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["portrait", "landscape"],
            default: "landscape",
            required: false,
          },
          {
            name: "resolution",
            type: "select",
            label: "Resolution",
            options: ["standard", "high"],
            default: "standard",
            required: false,
            showFor: ["sora-2-pro"],
          },
        ],
      },
    ],
  },
  {
    id: "google-video",
    name: "Google",
    description: "Google Video models",
    type: "video",
    models: [
      {
        id: "google-video",
        name: "Google",
        description: "Google Video Models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["veo-3.1", "veo-3.1-fast", "veo-3", "veo-3-fast"],
            default: "veo-3.1",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "image",
            type: "file",
            label: "Image",
            required: false,
          },
          {
            name: "last_frame",
            type: "file",
            label: "Last Frame",
            required: false,
            showFor: ["veo-3.1", "veo-3.1-fast"],
          },
          {
            name: "reference_images",
            type: "file",
            label: "Reference Images",
            required: false,
            showFor: ["veo-3.1"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["16:9", "9:16"],
            default: "16:9",
            required: false,
          },
          {
            name: "negative_prompt",
            type: "textarea",
            label: "Negative Prompt",
          },
          {
            name: "resolution",
            type: "select",
            label: "Resolution",
            options: ["720p", "1080p"],
            default: "720p",
            required: false,
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
    id: "xai-video",
    name: "x.AI",
    description: "x.AI Video models",
    type: "video",
    models: [
      {
        id: "xai-video",
        name: "x.AI",
        description: "x.AI Video models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["grok-imagine-video"],
            default: "grok-imagine-video",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "image",
            type: "file",
            label: "Image",
            required: false,
          },
          {
            name: "video",
            type: "file",
            label: "Video",
            required: false,
          },
          {
            name: "duration",
            type: "range",
            label: "Duration",
            min: 1,
            max: 15,
            step: 1,
            default: 6,
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"],
            default: "16:9",
            required: false,
          },
          {
            name: "resolution",
            type: "select",
            label: "Resolution",
            options: ["480p", "720p"],
            default: "720p",
            required: false,
          },
        ],
      },
    ],
  },
  {
    id: "kling-video",
    name: "Kling",
    description: "Kling Video models",
    type: "video",
    models: [
      {
        id: "kling-video",
        name: "Kling",
        description: "Kling Video models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: [
              "kling-v2.6",
              "kling-v2.5-turbo-pro",
              "kling-v2.1-master",
              "kling-v2.1-pro",
              "kling-v2.1-standard",
              "kling-v2",
              "kling-v1.6-pro",
              "kling-v1.6-standard",
            ],
            default: "kling-v2.6",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "start_image",
            type: "file",
            label: "Start Image",
            required: false,
            showFor: [
              "kling-v2.6",
              "kling-v2.5-turbo-pro",
              "kling-v2.1-master",
              "kling-v2",
              "kling-v1.6-standard",
            ],
          },
          {
            name: "start_image",
            type: "file",
            label: "Start Image",
            required: true,
            showFor: [
              "kling-v2.1-pro",
              "kling-v2.1-standard",
              "kling-v1.6-pro",
            ],
          },
          {
            name: "end_image",
            type: "file",
            label: "End Image",
            required: false,
            showFor: [
              "kling-v2.5-turbo-pro",
              "kling-v2.1-pro",
              "kling-v1.6-pro",
            ],
          },
          {
            name: "generate_audio",
            type: "checkbox",
            label: "Generate Audio",
            default: false,
            showFor: ["kling-v2.6"],
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
            showFor: ["kling-v2", "kling-v1.6-pro", "kling-v1.6-standard"],
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["16:9", "1:1", "9:16"],
            default: "16:9",
            required: false,
            showFor: [
              "kling-v2.6",
              "kling-v2.5-turbo-pro",
              "kling-v2.1-master",
              "kling-v2",
              "kling-v1.6-pro",
              "kling-v1.6-standard",
            ],
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
    id: "bytedance-video",
    name: "Bytedance",
    description: "Bytedance Video models",
    type: "video",
    models: [
      {
        id: "bytedance-video",
        name: "Bytedance",
        description: "Bytedance Video models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["seedance-1.5-pro"],
            default: "seedance-1.5-pro",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "image",
            type: "file",
            label: "Image",
            required: false,
          },
          {
            name: "last_frame_image",
            type: "file",
            label: "Last Frame Image",
            required: false,
          },
          {
            name: "duration",
            type: "range",
            label: "Duration (seconds)",
            min: 2,
            max: 12,
            step: 1,
            default: 5,
          },
          {
            name: "aspect_ratio",
            type: "select",
            label: "Aspect Ratio",
            options: ["16:9", "4:3", "1:1", "3:4", "9:16", "21:9", "9:21"],
            default: "16:9",
            required: false,
          },
          {
            name: "camera_fixed",
            type: "checkbox",
            label: "Camera Fixed",
            default: false,
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
    id: "alibaba-video",
    name: "Alibaba",
    description: "Alibaba Video models",
    type: "video",
    models: [
      {
        id: "alibaba-video",
        name: "Alibaba",
        description: "Alibaba Video models",
        fields: [
          {
            name: "model",
            type: "select",
            label: "Model Version",
            required: true,
            options: ["wan-2.6-i2v", "wan-2.6-t2v"],
            default: "wan-2.6-i2v",
          },
          { name: "prompt", type: "textarea", label: "Prompt", required: true },
          {
            name: "negative_prompt",
            type: "textarea",
            label: "Negative Prompt",
            required: false,
          },
          {
            name: "image",
            type: "file",
            label: "Image",
            required: false,
            showFor: ["wan-2.6-i2v"],
          },
          {
            name: "resolution",
            type: "select",
            label: "Resolution",
            options: ["720p", "1080p"],
            default: "720p",
            required: false,
            showFor: ["wan-2.6-i2v"],
          },
          {
            name: "size",
            type: "select",
            label: "Size",
            options: ["1280*720", "720*1280", "1920*1080", "1080*1920"],
            default: "1280*720",
            required: false,
            showFor: ["wan-2.6-t2v"],
          },
          {
            name: "duration",
            type: "select",
            label: "Duration (seconds)",
            options: [5, 10, 15],
            default: 5,
            required: false,
          },
          {
            name: "enable_prompt_expansion",
            type: "checkbox",
            label: "Enable Prompt Expansion",
            default: false,
          },
          {
            name: "multi_shots",
            type: "checkbox",
            label: "Multi Shots",
            default: false,
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
];
