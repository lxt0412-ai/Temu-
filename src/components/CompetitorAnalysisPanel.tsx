import { FileJson, Lightbulb, Megaphone, ShieldAlert, Sparkles, WandSparkles } from "lucide-react";
import type { CompetitorAnalysis, ProcessingStatus, UploadedImage } from "../types";

interface CompetitorAnalysisPanelProps {
  competitorImage?: UploadedImage;
  analysis?: CompetitorAnalysis;
  status: ProcessingStatus;
  onAnalyze: () => void;
}

const riskCatalog = [
  { label: "logo", keywords: ["logo", "品牌标识"] },
  { label: "品牌名", keywords: ["brand", "品牌名", "品牌"] },
  { label: "商标", keywords: ["trademark", "商标"] },
  { label: "IP 角色", keywords: ["ip", "角色", "copyrighted character"] },
  { label: "人物肖像", keywords: ["face", "celebrity", "人物", "肖像", "人脸"] },
  { label: "独特包装", keywords: ["unique packaging", "独特包装", "包装设计"] },
  { label: "竞品商品主体", keywords: ["competitor product", "竞品商品主体", "竞品主体"] },
  { label: "版权图案", keywords: ["版权图案", "版权", "copyrighted"] }
];

const containsAny = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.toLowerCase().includes(keyword.toLowerCase()));

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

const StrategyCard = ({
  title,
  rows,
  icon: Icon
}: {
  title: string;
  rows: Array<{ label: string; value: CompetitorAnalysis[keyof CompetitorAnalysis] }>;
  icon: typeof Lightbulb;
}) => (
  <section className="rounded-md border border-line bg-field p-4">
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-mint">
        <Icon size={17} />
      </div>
      <h3 className="text-sm font-bold text-ink">{title}</h3>
    </div>
    <div className="grid gap-3">
      {rows.map((row) => (
        <div key={row.label} className="rounded-md border border-line bg-white p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/45">{row.label}</div>
          {renderFieldValue(row.value)}
        </div>
      ))}
    </div>
  </section>
);

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
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <StrategyCard
              title="视觉策略"
              icon={Lightbulb}
              rows={[
                { label: "场景类型", value: analysis.scene_type },
                { label: "背景风格", value: analysis.background_style },
                { label: "构图方式", value: analysis.composition },
                { label: "镜头角度", value: analysis.camera_angle },
                { label: "光线风格", value: analysis.lighting },
                { label: "色彩策略", value: analysis.color_palette }
              ]}
            />
            <StrategyCard
              title="营销策略"
              icon={Megaphone}
              rows={[
                { label: "图片类型", value: analysis.image_type },
                { label: "视觉层级", value: analysis.visual_hierarchy },
                { label: "卖点表达", value: analysis.selling_points },
                { label: "情绪 / 生活方式", value: analysis.emotion_or_lifestyle },
                { label: "转化设计", value: analysis.conversion_design }
              ]}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <StrategyCard
              title="可泛化元素"
              icon={WandSparkles}
              rows={[
                { label: "可使用的通用道具类型", value: analysis.props },
                { label: "可借鉴的氛围方向", value: `${analysis.lighting}；${analysis.color_palette}；${analysis.emotion_or_lifestyle}` },
                { label: "可借鉴的信息层级", value: `${analysis.visual_hierarchy}；${analysis.text_layout}` }
              ]}
            />

            <section className="rounded-md border border-coral/25 bg-[#fff5f1] p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-coral">
                  <ShieldAlert size={17} />
                </div>
                <h3 className="text-sm font-bold text-ink">禁止复用元素</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {riskCatalog.map((risk) => {
                  const riskText = analysis.risk_elements.join(" ");
                  const detected = containsAny(riskText, risk.keywords);

                  return (
                    <span
                      key={risk.label}
                      className={`rounded-md border px-2 py-1 text-sm font-medium ${
                        detected
                          ? "border-coral/40 bg-coral/10 text-coral"
                          : "border-line bg-white text-ink/60"
                      }`}
                    >
                      {risk.label}：{detected ? "高风险" : "默认避开"}
                    </span>
                  );
                })}
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/65">
                无论是否在竞品图中明显出现，生成图都不应复用以上元素，尤其不能使用竞品商品主体。
              </p>
            </section>

            <section className="rounded-md border border-mint/25 bg-mint/10 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-mint">
                  <Sparkles size={17} />
                </div>
                <h3 className="text-sm font-bold text-ink">安全改写策略</h3>
              </div>
              <p className="text-sm leading-6 text-ink/72">{analysis.safe_generation_strategy}</p>
              <p className="mt-3 text-sm leading-6 text-ink/62">
                产品只借鉴抽象营销意图，生成时重新设计背景、构图、道具、文字区和视觉节奏，确保是用户商品主体的新方案。
              </p>
            </section>
          </div>

          <details className="rounded-md border border-line bg-white p-3">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
              <FileJson size={16} />
              查看原始 JSON
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
