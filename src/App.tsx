import { useState } from "react";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { ImageUploader } from "./components/ImageUploader";
import { ProductPreview } from "./components/ProductPreview";
import { CompetitorAnalysisPanel } from "./components/CompetitorAnalysisPanel";
import { ComplianceRiskPanel } from "./components/ComplianceRiskPanel";
import { GenerationPromptPanel } from "./components/GenerationPromptPanel";
import {
  getImageGenerationProviderMode,
  generateProductImage
} from "./services/aiProviders/imageGenerationProvider";
import { getSegmentationProviderMode, segmentProductSubject } from "./services/aiProviders/imageSegmentationProvider";
import { analyzeCompetitorImage, getVisionProviderMode } from "./services/aiProviders/visionAnalysisProvider";
import { runComplianceCheck } from "./services/complianceCheckService";
import { buildGenerationPromptOptions } from "./services/promptBuilderService";
import type {
  ComplianceCheckResult,
  CompetitorAnalysis,
  GenerationResult,
  PromptPlan,
  PromptPlanId,
  ProcessingStatus,
  SegmentationResult,
  UploadedImage
} from "./types";

const providerModes = {
  ai: import.meta.env.VITE_AI_PROVIDER ?? "mock",
  segmentation: getSegmentationProviderMode(),
  vision: getVisionProviderMode(),
  imageGeneration: getImageGenerationProviderMode()
};

const isMockMode =
  providerModes.ai === "mock" &&
  providerModes.segmentation === "mock" &&
  providerModes.vision === "mock" &&
  providerModes.imageGeneration === "mock";

function App() {
  const [productImage, setProductImage] = useState<UploadedImage>();
  const [competitorImage, setCompetitorImage] = useState<UploadedImage>();
  const [segmentationStatus, setSegmentationStatus] = useState<ProcessingStatus>("idle");
  const [analysisStatus, setAnalysisStatus] = useState<ProcessingStatus>("idle");
  const [generationStatus, setGenerationStatus] = useState<ProcessingStatus>("idle");
  const [segmentationResult, setSegmentationResult] = useState<SegmentationResult>();
  const [analysis, setAnalysis] = useState<CompetitorAnalysis>();
  const [promptPlans, setPromptPlans] = useState<PromptPlan[]>([]);
  const [generatedResults, setGeneratedResults] = useState<Partial<Record<PromptPlanId, GenerationResult>>>({});
  const [generatingPlanId, setGeneratingPlanId] = useState<PromptPlanId>();
  const [complianceResults, setComplianceResults] = useState<ComplianceCheckResult[]>([]);
  const [complianceWarning, setComplianceWarning] = useState("");

  const canGenerate = Boolean(segmentationResult && analysis);

  const handleProductImageSelected = (image: UploadedImage) => {
    setProductImage(image);
    setSegmentationResult(undefined);
    setPromptPlans([]);
    setGeneratedResults({});
    setGeneratingPlanId(undefined);
    setComplianceResults([]);
    setComplianceWarning("");
    setSegmentationStatus("ready");
    setGenerationStatus("idle");
  };

  const handleCompetitorImageSelected = (image: UploadedImage) => {
    setCompetitorImage(image);
    setAnalysis(undefined);
    setPromptPlans([]);
    setGeneratedResults({});
    setGeneratingPlanId(undefined);
    setComplianceResults([]);
    setComplianceWarning("");
    setAnalysisStatus("ready");
    setGenerationStatus("idle");
  };

  const handleSegmentProduct = async () => {
    if (!productImage) return;

    try {
      setSegmentationStatus("processing");
      const result = await segmentProductSubject(productImage.file);
      setSegmentationResult(result);
      setSegmentationStatus("done");
    } catch (error) {
      console.error(error);
      setSegmentationStatus("error");
    }
  };

  const handleAnalyzeCompetitor = async () => {
    if (!competitorImage) return;

    try {
      setAnalysisStatus("processing");
      const result = await analyzeCompetitorImage(competitorImage.file);
      setAnalysis(result);
      setComplianceResults([]);
      setComplianceWarning("");
      setAnalysisStatus("done");
    } catch (error) {
      console.error(error);
      setAnalysisStatus("error");
    }
  };

  const buildPlanComplianceResults = (plans: PromptPlan[], competitorAnalysis: CompetitorAnalysis) =>
    plans.flatMap((plan) =>
      runComplianceCheck(competitorAnalysis, plan.positivePrompt).map((risk) => ({
        ...risk,
        id: `${plan.id}_${risk.id}`,
        risk_name: `方案 ${plan.id}｜${risk.risk_name}`
      }))
    );

  const handleBuildPlans = () => {
    if (!segmentationResult || !analysis) return;

    try {
      setGenerationStatus("processing");
      const plans = buildGenerationPromptOptions(analysis);
      const checks = buildPlanComplianceResults(plans, analysis);
      setComplianceResults(checks);

      const blocked = checks.some((risk) => risk.risk_level === "high" && !risk.passed);
      if (blocked) {
        setGenerationStatus("idle");
        setPromptPlans([]);
        setGeneratedResults({});
        setComplianceWarning("当前竞品图存在高风险元素，系统已阻止生成方案。请减少高风险元素后重新分析，或继续优化安全改写策略。");
        return;
      }

      setPromptPlans(plans);
      setGeneratedResults({});
      setGeneratingPlanId(undefined);
      setComplianceWarning("");
      setGenerationStatus("done");
    } catch (error) {
      console.error(error);
      setGenerationStatus("error");
    }
  };

  const handleGeneratePlanImage = async (plan: PromptPlan) => {
    if (!segmentationResult || !analysis) return;

    try {
      setGeneratingPlanId(plan.id);
      const checks = runComplianceCheck(analysis, plan.positivePrompt).map((risk) => ({
        ...risk,
        id: `${plan.id}_${risk.id}`,
        risk_name: `方案 ${plan.id}｜${risk.risk_name}`
      }));
      setComplianceResults(checks);

      const blocked = checks.some((risk) => risk.risk_level === "high" && !risk.passed);
      if (blocked) {
        setGeneratingPlanId(undefined);
        setComplianceWarning(`方案 ${plan.id} 存在未通过的高风险项，已阻止 mock 生图。`);
        return;
      }

      setComplianceWarning("");
      const result = await generateProductImage({
        productCutout: segmentationResult.cutoutDataUrl,
        positivePrompt: plan.positivePrompt,
        negativePrompt: plan.negativePrompt,
        aspectRatio: "1:1"
      });
      setGeneratedResults((current) => ({ ...current, [plan.id]: result }));
      setGeneratingPlanId(undefined);
    } catch (error) {
      console.error(error);
      setGeneratingPlanId(undefined);
      setGenerationStatus("error");
    }
  };

  const flowSteps = [
    { label: "上传商品图", done: Boolean(productImage) },
    { label: "Mock 抠图", done: Boolean(segmentationResult) },
    { label: "上传竞品图", done: Boolean(competitorImage) },
    { label: "Mock 分析", done: Boolean(analysis) },
    { label: "3 个方案", done: promptPlans.length === 3 },
    { label: "Mock 生图", done: Object.keys(generatedResults).length > 0 }
  ];

  return (
    <main className="min-h-screen bg-field">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">Temu seller AI workflow</p>
              <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink sm:text-4xl">
                Temu 商品图安全生成工具
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-ink/68">
                基于商品主体 + 爆款图抽象策略，生成原创合规商品图
              </p>
              <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-md border border-line bg-field px-3 py-2 text-sm text-ink/70">
                <span className="font-semibold text-ink">当前模式：{isMockMode ? "Mock" : "Real API"}</span>
                <span>抠图：{providerModes.segmentation}</span>
                <span>视觉分析：{providerModes.vision}</span>
                <span>生图：{providerModes.imageGeneration}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:min-w-[520px]">
              {flowSteps.map((step) => (
                <div
                  key={step.label}
                  className="flex items-center gap-2 rounded-md border border-line bg-field px-3 py-2 text-sm text-ink/75"
                >
                  {step.done ? <CheckCircle2 className="text-mint" size={16} /> : <CircleDashed size={16} />}
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          <ImageUploader
            title="上传你的商品图"
            description="上传用户自己的商品原图，系统会 mock 主体识别并生成透明背景预览。"
            image={productImage}
            onImageSelected={handleProductImageSelected}
            onReset={() => {
              setProductImage(undefined);
              setSegmentationResult(undefined);
              setSegmentationStatus("idle");
              setPromptPlans([]);
              setGeneratedResults({});
              setGeneratingPlanId(undefined);
              setComplianceResults([]);
              setComplianceWarning("");
            }}
          />
          <ProductPreview
            productImage={productImage}
            result={segmentationResult}
            status={segmentationStatus}
            onSegment={handleSegmentProduct}
          />
        </div>

        <div className="space-y-6">
          <ImageUploader
            title="上传竞品爆款图"
            description="上传竞品参考图片，只抽象分析营销策略、视觉方向和合规风险。"
            image={competitorImage}
            onImageSelected={handleCompetitorImageSelected}
            onReset={() => {
              setCompetitorImage(undefined);
              setAnalysis(undefined);
              setAnalysisStatus("idle");
              setPromptPlans([]);
              setGeneratedResults({});
              setGeneratingPlanId(undefined);
              setComplianceResults([]);
              setComplianceWarning("");
            }}
          />
          <CompetitorAnalysisPanel
            competitorImage={competitorImage}
            analysis={analysis}
            status={analysisStatus}
            onAnalyze={handleAnalyzeCompetitor}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:px-8">
        <ComplianceRiskPanel risks={complianceResults} warning={complianceWarning} />
        <GenerationPromptPanel
          plans={promptPlans}
          canBuildPlans={canGenerate}
          isBuildingPlans={generationStatus === "processing"}
          generatingPlanId={generatingPlanId}
          generatedResults={generatedResults}
          onBuildPlans={handleBuildPlans}
          onGenerateImage={handleGeneratePlanImage}
        />
      </section>
    </main>
  );
}

export default App;
