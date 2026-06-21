import { FileImage, ImagePlus, Layers, ListChecks, PenTool, ScanSearch, ShieldCheck } from "lucide-react";

const workflowSteps = [
  { title: "上传自有商品图", description: "卖家提供真实商品原图。", icon: ImagePlus },
  { title: "商品主体识别与抠图", description: "识别商品主体并生成透明背景预览。", icon: ScanSearch },
  { title: "上传竞品爆款图", description: "上传参考图用于抽象策略分析。", icon: FileImage },
  { title: "竞品图抽象分析", description: "提取场景、光线、卖点和视觉层级。", icon: Layers },
  { title: "合规风控检查", description: "识别 logo、商标、IP、肖像和包装风险。", icon: ShieldCheck },
  { title: "安全 Prompt 生成", description: "输出正向 Prompt、负向 Prompt 和合规说明。", icon: PenTool },
  { title: "多方案商品图生成", description: "生成主图、场景图、卖点图三类方案。", icon: ListChecks }
];

export function AIWorkflowSection() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">AI Workflow</p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-ink">7 步 AI 商品图生成工作流</h2>
          <p className="mt-3 text-sm leading-6 text-ink/62">
            从商品主体到竞品抽象分析，再到合规 Prompt 和多方案生成，形成可演示、可解释、可扩展的产品闭环。
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article key={step.title} className="rounded-md border border-line bg-field p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-mint">
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-semibold text-ink/42">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-ink/58">{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
