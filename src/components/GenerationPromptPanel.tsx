import { Copy, ImageIcon, WandSparkles } from "lucide-react";
import type { GenerationResult, PromptPlan, PromptPlanId } from "../types";

interface GenerationPromptPanelProps {
  plans: PromptPlan[];
  canBuildPlans: boolean;
  isBuildingPlans: boolean;
  generatingPlanId?: PromptPlanId;
  generatedResults: Partial<Record<PromptPlanId, GenerationResult>>;
  onBuildPlans: () => void;
  onGenerateImage: (plan: PromptPlan) => void;
}

export function GenerationPromptPanel({
  plans,
  canBuildPlans,
  isBuildingPlans,
  generatingPlanId,
  generatedResults,
  onBuildPlans,
  onGenerateImage
}: GenerationPromptPanelProps) {
  const copyText = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">多方案生成 Prompt</h2>
          <p className="mt-1 text-sm text-ink/60">一次生成 3 个原创合规方向，每个方案都可以单独复制和 mock 生图。</p>
        </div>
        <button
          type="button"
          onClick={onBuildPlans}
          disabled={!canBuildPlans || isBuildingPlans}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/25"
        >
          <WandSparkles size={17} />
          {isBuildingPlans ? "生成方案中" : "生成安全商品图"}
        </button>
      </div>

      {plans.length > 0 ? (
        <div className="mt-4 grid gap-4">
          {plans.map((plan) => {
            const result = generatedResults[plan.id];
            const isGenerating = generatingPlanId === plan.id;

            return (
              <div key={plan.id} className="rounded-lg border border-line bg-field p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-mint">方案 {plan.id}</div>
                    <h3 className="mt-1 text-lg font-semibold text-ink">{plan.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink/65">适合用途：{plan.usage}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(plan.positivePrompt)}
                      className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-mint hover:text-mint"
                    >
                      <Copy size={16} />
                      复制 Positive
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(plan.negativePrompt)}
                      className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-mint hover:text-mint"
                    >
                      <Copy size={16} />
                      复制 Negative
                    </button>
                    <button
                      type="button"
                      onClick={() => onGenerateImage(plan)}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 rounded-md bg-mint px-3 py-2 text-sm font-semibold text-white transition hover:bg-mint/90 disabled:cursor-not-allowed disabled:bg-ink/25"
                    >
                      <ImageIcon size={16} />
                      {isGenerating ? "生成中" : "Mock 生图"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-md border border-line bg-white p-3">
                  <div className="text-sm font-semibold text-ink">中文创意说明</div>
                  <p className="mt-1 text-sm leading-6 text-ink/70">{plan.creativeSummary}</p>
                </div>

                <div className="mt-3 rounded-md border border-line bg-white p-3">
                  <div className="text-sm font-semibold text-ink">合规说明</div>
                  <ul className="mt-1 space-y-1 text-sm leading-6 text-ink/70">
                    {plan.complianceNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>

                {result ? (
                  <div className="mt-3 rounded-md border border-line bg-white p-3">
                    <div className="mb-2 text-sm font-semibold text-ink">Mock 生成图片</div>
                    <div className="flex min-h-[240px] items-center justify-center rounded-md bg-[linear-gradient(135deg,#fff,#f7f8f4_52%,#fff3ec)] p-4">
                      <img src={result.imageUrl} alt={`${plan.title} mock 生成图`} className="max-h-[260px] max-w-full object-contain" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{result.notes}</p>
                  </div>
                ) : null}

                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div>
                    <div className="mb-2 text-sm font-semibold text-ink">Positive Prompt</div>
                    <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-white p-3 text-xs leading-5 text-ink/75">
                      {plan.positivePrompt}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-semibold text-ink">Negative Prompt</div>
                    <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-ink p-3 text-xs leading-5 text-white">
                      {plan.negativePrompt}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <pre className="mt-4 min-h-[280px] whitespace-pre-wrap rounded-md border border-line bg-field p-4 text-sm leading-6 text-ink/75">
          完成商品抠图和竞品分析后，点击生成安全商品图，系统会生成 3 个不同创意方向：主图风格、场景图风格、卖点图风格。
        </pre>
      )}
    </div>
  );
}
