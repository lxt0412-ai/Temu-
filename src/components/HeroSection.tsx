import { CheckCircle2, CircleDashed, ShieldCheck, Sparkles, Target } from "lucide-react";

interface FlowStep {
  label: string;
  done: boolean;
}

interface ProviderModes {
  ai: string;
  segmentation: string;
  vision: string;
  imageGeneration: string;
}

interface HeroSectionProps {
  flowSteps: FlowStep[];
  isMockMode: boolean;
  providerModes: ProviderModes;
}

const valueTags = [
  { label: "爆款策略提取", icon: Target },
  { label: "原创商品图生成", icon: Sparkles },
  { label: "合规风险规避", icon: ShieldCheck }
];

export function HeroSection({ flowSteps, isMockMode, providerModes }: HeroSectionProps) {
  return (
    <section className="border-b border-line bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-12">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">AI Product Manager Demo</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-normal text-white sm:text-5xl">
            Temu 商品图安全生成工具
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/72 sm:text-lg">
            基于商品主体识别、竞品图抽象分析与合规 Prompt 生成，帮助跨境卖家快速生成原创商品图方案。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {valueTags.map((tag) => {
              const Icon = tag.icon;

              return (
                <div
                  key={tag.label}
                  className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/8 px-3 py-2 text-sm font-medium text-white"
                >
                  <Icon size={16} className="text-mint" />
                  <span>{tag.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 inline-flex w-fit flex-wrap items-center gap-2 rounded-md border border-white/12 bg-white/8 px-3 py-2 text-sm text-white/72">
            <span className="font-semibold text-white">当前模式：{isMockMode ? "Mock" : "Real API"}</span>
            <span>抠图：{providerModes.segmentation}</span>
            <span>视觉分析：{providerModes.vision}</span>
            <span>生图：{providerModes.imageGeneration}</span>
          </div>
        </div>

        <div className="grid content-center gap-3 rounded-md border border-white/12 bg-white/[0.06] p-4 shadow-soft">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-sm font-semibold text-white">MVP 流程状态</p>
              <p className="mt-1 text-xs text-white/56">保留当前可运行闭环，展示 Demo 完成度</p>
            </div>
            <div className="rounded-md bg-mint px-3 py-1 text-xs font-semibold text-white">
              {flowSteps.filter((step) => step.done).length}/{flowSteps.length}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {flowSteps.map((step) => (
              <div
                key={step.label}
                className="flex min-h-11 items-center gap-2 rounded-md border border-white/10 bg-white/8 px-3 py-2 text-sm text-white/76"
              >
                {step.done ? <CheckCircle2 className="text-mint" size={16} /> : <CircleDashed size={16} />}
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
