import { Ban, Boxes, Compass, FileText, ShieldCheck } from "lucide-react";

const promptSections = [
  {
    title: "Main Subject Constraint",
    purpose: "约束生成图只能使用用户上传并抠出的商品主体。",
    riskReduction: "避免模型误用竞品商品、竞品包装或参考图里的产品细节，保证商品主体归属清晰。",
    icon: Boxes
  },
  {
    title: "Abstract Inspiration",
    purpose: "只使用竞品图中的抽象营销策略，例如场景、光线、色彩、卖点和信息层级。",
    riskReduction: "把“参考爆款”限制在策略层，避免复制背景、构图、道具和整体视觉外观。",
    icon: Compass
  },
  {
    title: "Original Creative Direction",
    purpose: "要求重新设计背景、构图、道具、文字区和视觉节奏。",
    riskReduction: "强制生成结果从表达方式上与竞品图拉开距离，让结果成为原创商品图方案。",
    icon: FileText
  },
  {
    title: "Compliance Guardrails",
    purpose: "明确禁止 logo、商标、IP、人物肖像、竞品包装、复制布局和误导性声明。",
    riskReduction: "把高风险元素写成硬约束，降低商标、版权、肖像权和平台审核风险。",
    icon: ShieldCheck
  },
  {
    title: "Negative Prompt",
    purpose: "用负向 Prompt 排除竞品 logo、品牌名、水印、低质图、错误商品形状和虚假促销标识。",
    riskReduction: "在生成阶段进一步抑制不合规元素和质量问题，减少后期返工。",
    icon: Ban
  }
];

export function PromptExplainabilitySection() {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">Prompt Explainability</p>
          <h2 className="mt-2 text-base font-semibold text-ink">Prompt 生成逻辑说明</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-ink/62">
          将图像生成 Prompt 拆成可解释模块，方便作品集展示 AI 产品经理如何管理模型输入、创意边界和合规风险。
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {promptSections.map((section) => {
          const Icon = section.icon;

          return (
            <article key={section.title} className="rounded-md border border-line bg-field p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-mint">
                <Icon size={18} />
              </div>
              <h3 className="mt-4 text-sm font-bold text-ink">{section.title}</h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink/40">Why it exists</p>
              <p className="mt-1 text-xs leading-5 text-ink/62">{section.purpose}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink/40">Risk control</p>
              <p className="mt-1 text-xs leading-5 text-ink/72">{section.riskReduction}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
