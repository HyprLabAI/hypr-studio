export interface GeneratedImage {
  type: "image";
  imageData: string;
  prompt: string;
  revised_prompt?: string;
  settings: {
    model: string;
    control_image?: string;
    image_prompt?: string;
    image?: string;
    mask?: string;
    steps?: number;
    height?: number;
    width?: number;
    size?: string;
    quality?: string;
    style?: string;
    n?: number;
    cfg_scale?: number;
    sampler?: string;
    seed?: number;
    style_preset?: string;
    aspect_ratio?: string;
    negative_prompt?: string;
    raw?: boolean;
    guidance?: number;
    prompt_upsampling?: boolean;
    image_prompt_strength?: number;
    style_type?: string;
    magic_prompt_option?: string;
    background?: string;
    moderation?: string;
    output_compression?: number;
    [key: string]: any;
  };
  timestamp: string;
}

export interface GeneratedVideo {
  type: "video";
  videoUrl: string;
  prompt: string;
  settings: {
    model: string;
    start_image?: string;
    end_image?: string;
    image?: string;
    duration?: number;
    cfg_scale?: number;
    aspect_ratio?: string;
    negative_prompt?: string;
    [key: string]: any;
  };
  timestamp: string;
}

export type GeneratedMedia = GeneratedImage | GeneratedVideo;
