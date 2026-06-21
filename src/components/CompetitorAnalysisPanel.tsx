import { FileJson, Sparkles } from "lucide-react";
import type { CompetitorAnalysis, ProcessingStatus, UploadedImage } from "../types";

interface CompetitorAnalysisPanelProps {
  competitorImage?: UploadedImage;
  analysis?: CompetitorAnalysis;
  status: ProcessingStatus;
  onAnalyze: () => void;
}

const fieldLabels: Array<[keyof CompetitorAnalysis, string]> = [
  ["category_guess", "推测类目"],
  ["image_type", "图片类型"],
  ["scene_type", "场景类型"],
  ["background_style", "背景风格"],
  ["composition", "构图方式"],
  ["camera_angle", "镜头角度"],
  ["lighting", "光线风格"],
  ["color_palette", "色彩策略"],
  ["visual_hierarchy", "视觉层级"],
  ["selling_points", "卖点表达"],
  ["emotion_or_lifestyle", "情绪与生活方式"],
  ["props", "泛化道具"],
  ["text_layout", "文字布局"],
  ["conversion_design", "转化设计"],
  ["risk_elements", "风险元素"],
  ["safe_generation_strategy", "安全改写策略"]
];

const renderFieldValue = (value: CompetitorAnalysis[keyof CompetitorAnalysis]) => {
  if (Array.isArray(value)) {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {value.map((item) => (
          <span key={item} className="rounded-md border border-line bg-white px-2 py-1 text-sm leading-5 text-ink/75">
            {item}
          </span>
        ))}
      </div>
    );
  }

  return <p className="mt-1 text-sm leading-6 text-ink/75">{value}</p>;
};

export function CompetitorAnalysisPanel({
  competitorImage,
  analysis,
  status,
  onAnalyze
}: CompetitorAnalysisPanelProps) {
  const disabled = !competitorImage || status === "processing";

  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">竞品元素抽象分析</h2>
          <p className="mt-1 text-sm text-ink/60">只提取营销和视觉策略，不复制具体元素。</p>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:bg-ink/25"
        >
          <Sparkles size={17} />
          {status === "processing" ? "分析中" : "分析竞品元素"}
        </button>
      </div>

      {analysis ? (
        <div className="mt-4 space-y-2">
          {fieldLabels.map(([key, label]) => (
            <div key={key} className="rounded-md border border-line bg-field p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/45">{label}</div>
              {renderFieldValue(analysis[key])}
            </div>
          ))}
          <details className="rounded-md border border-line bg-white p-3">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
              <FileJson size={16} />
              查看结构化 JSON
            </summary>
            <pre className="mt-3 max-h-[300px] overflow-auto rounded-md bg-ink p-3 text-xs leading-5 text-white">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-line bg-field p-6 text-center text-sm leading-6 text-ink/55">
          上传竞品爆款图后点击分析，系统会输出结构化 JSON 和卖家可读的策略摘要。
        </div>
      )}
    </div>
  );
}
