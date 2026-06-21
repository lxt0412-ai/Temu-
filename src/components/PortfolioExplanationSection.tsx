import { BarChart3, BrainCircuit, CheckCircle2, GitBranch, ShieldCheck, ShoppingBag } from "lucide-react";

const portfolioPoints = [
  {
    title: "业务场景明确",
    description: "聚焦 Temu 跨境卖家商品图生产，需求来自真实增长和素材生产场景。",
    icon: ShoppingBag
  },
  {
    title: "AI 能力拆解清晰",
    description: "把主体识别、视觉分析、Prompt 生成、合规检查和生图 provider 拆成独立模块。",
    icon: BrainCircuit
  },
  {
    title: "产品闭环完整",
    description: "完整跑通上传、抠图、竞品分析、风控、三方案 Prompt、mock 生图。",
    icon: CheckCircle2
  },
  {
    title: "合规意识强",
    description: "明确规避 logo、商标、IP、人物肖像、竞品包装和复制式构图风险。",
    icon: ShieldCheck
  },
  {
    title: "指标意识完整",
    description: "围绕点击率、转化率、作图效率、审核通过率和方案采用率设计流程。",
    icon: BarChart3
  },
  {
    title: "工程化预留",
    description: "保留 mock provider，同时预留 OpenAI、Replicate、ComfyUI、分割模型等接入点。",
    icon: GitBranch
  }
];

export function PortfolioExplanationSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">Portfolio Fit</p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-ink">
            为什么适合作为 AI 产品经理作品集 Demo
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink/62">
            这个 Demo 不只是展示页面，而是把业务问题、AI 能力边界、合规约束和工程落地路径放进同一个可运行原型里。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {portfolioPoints.map((point) => {
            const Icon = point.icon;

            return (
              <article key={point.title} className="rounded-md border border-line bg-white p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-field text-mint">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">{point.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-ink/62">{point.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
