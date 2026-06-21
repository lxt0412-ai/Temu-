export type ProcessingStatus = "idle" | "ready" | "processing" | "done" | "error";

export interface UploadedImage {
  file: File;
  dataUrl: string;
}

export interface SegmentationResult {
  cutoutDataUrl: string;
  confidence: number;
  notes: string;
}

export type SegmentedProductResult = SegmentationResult;

export interface CompetitorAnalysis {
  category_guess: string;
  image_type: string;
  scene_type: string;
  background_style: string;
  composition: string;
  camera_angle: string;
  lighting: string;
  color_palette: string;
  visual_hierarchy: string;
  selling_points: string[];
  emotion_or_lifestyle: string;
  props: string[];
  text_layout: string;
  conversion_design: string;
  risk_elements: string[];
  safe_generation_strategy: string;
}

export type RiskLevel = "low" | "medium" | "high";

export interface ComplianceRisk {
  risk_name: string;
  risk_level: RiskLevel;
  description: string;
  mitigation: string;
}

export interface ComplianceCheckResult {
  id: string;
  risk_name: string;
  risk_level: RiskLevel;
  description: string;
  mitigation: string;
  passed: boolean;
}

export interface PromptBuildResult {
  positivePrompt: string;
  negativePrompt: string;
  complianceNotes: string[];
  creativeSummary: string;
}

export type PromptPlanId = "A" | "B" | "C";

export interface PromptPlan extends PromptBuildResult {
  id: PromptPlanId;
  title: string;
  usage: string;
}

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
  provider: "mock";
  notes: string;
}

export type GeneratedImageResult = GenerationResult;
