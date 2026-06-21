import { segmentProductSubject as mockSegmentProductSubject } from "../mockSegmentationService";
import type { SegmentedProductResult } from "../../types";

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("无法读取商品图文件"));
    reader.readAsDataURL(file);
  });

const segmentationProvider = import.meta.env.VITE_SEGMENTATION_PROVIDER ?? import.meta.env.VITE_AI_PROVIDER ?? "mock";

export async function segmentProductSubject(file: File): Promise<SegmentedProductResult> {
  if (segmentationProvider !== "mock") {
    console.info(
      `[AI Provider] Segmentation provider "${segmentationProvider}" is not implemented yet. Falling back to mock.`
    );
  }

  const imageDataUrl = await fileToDataUrl(file);
  return mockSegmentProductSubject(imageDataUrl);
}

export function getSegmentationProviderMode() {
  return segmentationProvider;
}
