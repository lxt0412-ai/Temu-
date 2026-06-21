import { CheckCircle2, Copy, ImageIcon, LayoutPanelLeft, Store, WandSparkles } from "lucide-react";
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

const planDisplayMeta: Record<
  PromptPlanId,
  {
    title: string;
    usage: string;
    features: string[];
    difference: string;
    badgeClassName: string;
  }
> = {
  A: {
    title: "方案 A：平台主图方案",
    usage: "适合 Temu 商品主图",
    features: ["商品主体突出", "白底或浅色背景", "少道具", "高点击率", "适合商品列表页"],
    difference: "与竞品图的差异点：去掉复杂背景、装饰道具和密集信息区，改为原创浅色主图表达，只突出用户商品主体。",
    badgeClassName: "bg-mint text-white"
  },
  B: {
    title: "方案 B：生活场景方案",
    usage: "适合商品轮播图 / 详情页",
    features: ["原创生活化场景", "强调使用场景", "展示商品价值", "不复刻竞品背景"],
    difference: "与竞品图的差异点：重新设计生活场景、背景材质、道具组合和镜头距离，只保留抽象使用意图。",
    badgeClassName: "bg-amber text-ink"
  },
  C: {
    title: "方案 C：卖点表达方案",
    usage: "适合详情页卖点图",
    features: ["结构化表达核心卖点", "可使用原创文字区域", "不复制竞品文案和排版", "避免夸大宣传"],
    difference: "与竞品图的差异点：重建卖点信息结构，改变文字区位置、层级、图标样式和视觉节奏。",
    badgeClassName: "bg-coral text-white"
  }
};

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
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">Creative Options</p>
          <h2 className="mt-2 text-base font-semibold text-ink">多方案商品图生成模块</h2>
          <p className="mt-1 text-sm text-ink/60">
            将同一商品主体拆成平台主图、生活场景、卖点表达三类方案，展示 AI 产品从策略到素材的生成闭环。
          </p>
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
            const meta = planDisplayMeta[plan.id];

            return (
              <article key={plan.id} className="rounded-lg border border-line bg-field p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-base font-bold ${meta.badgeClassName}`}>
                      {plan.id}
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-mint">Portfolio generation plan</div>
                      <h3 className="mt-1 text-lg font-semibold text-ink">{meta.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-ink/65">使用场景：{meta.usage}</p>
                    </div>
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

                <div className="mt-4 grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-md border border-line bg-white p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Store size={16} className="text-mint" />
                      方案特点
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {meta.features.map((feature) => (
                        <span key={feature} className="inline-flex items-center gap-1 rounded-md border border-line bg-field px-2 py-1 text-sm text-ink/72">
                          <CheckCircle2 size={14} className="text-mint" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border border-line bg-white p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <LayoutPanelLeft size={16} className="text-mint" />
                      与竞品图的差异点
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink/70">{meta.difference}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-md border border-line bg-white p-3">
                  <div className="text-sm font-semibold text-ink">创意说明</div>
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
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-ink">Positive Prompt</div>
                      <button
                        type="button"
                        onClick={() => copyText(plan.positivePrompt)}
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink transition hover:border-mint hover:text-mint"
                      >
                        <Copy size={13} />
                        复制
                      </button>
                    </div>
                    <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-white p-3 text-xs leading-5 text-ink/75">
                      {plan.positivePrompt}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-ink">Negative Prompt</div>
                      <button
                        type="button"
                        onClick={() => copyText(plan.negativePrompt)}
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink transition hover:border-mint hover:text-mint"
                      >
                        <Copy size={13} />
                        复制
                      </button>
                    </div>
                    <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-ink p-3 text-xs leading-5 text-white">
                      {plan.negativePrompt}
                    </pre>
                  </div>
                </div>
              </article>
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
