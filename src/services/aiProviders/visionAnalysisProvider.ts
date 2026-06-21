import { analyzeCompetitorImage as mockAnalyzeCompetitorImage } from "../mockCompetitorAnalysisService";
import type { CompetitorAnalysis } from "../../types";

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("无法读取竞品图文件"));
    reader.readAsDataURL(file);
  });

const visionProvider = import.meta.env.VITE_VISION_PROVIDER ?? import.meta.env.VITE_AI_PROVIDER ?? "mock";

export async function analyzeCompetitorImage(file: File): Promise<CompetitorAnalysis> {
  if (visionProvider !== "mock") {
    console.info(`[AI Provider] Vision provider "${visionProvider}" is not implemented yet. Falling back to mock.`);
  }

  const imageDataUrl = await fileToDataUrl(file);
  return mockAnalyzeCompetitorImage(imageDataUrl);
}

export function getVisionProviderMode() {
  return visionProvider;
}
