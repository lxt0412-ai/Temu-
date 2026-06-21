import { generateMockProductImage } from "../mockImageGenerationService";
import type { GeneratedImageResult } from "../../types";

export interface GenerateProductImageParams {
  productCutout: string;
  positivePrompt: string;
  negativePrompt: string;
  aspectRatio: "1:1" | "4:5" | "3:4";
}

const imageGenerationProvider =
  import.meta.env.VITE_IMAGE_GENERATION_PROVIDER ?? import.meta.env.VITE_AI_PROVIDER ?? "mock";

export async function generateProductImage(params: GenerateProductImageParams): Promise<GeneratedImageResult> {
  if (imageGenerationProvider !== "mock") {
    console.info(
      `[AI Provider] Image generation provider "${imageGenerationProvider}" is not implemented yet. Falling back to mock.`
    );
  }

  return generateMockProductImage(
    params.productCutout,
    `${params.positivePrompt}\n\nNegative prompt:\n${params.negativePrompt}\n\nAspect ratio: ${params.aspectRatio}`
  );
}

export function getImageGenerationProviderMode() {
  return imageGenerationProvider;
}
