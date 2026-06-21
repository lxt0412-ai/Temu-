import { ArrowRight, BadgeCheck, Boxes, ImageOff, ShieldAlert } from "lucide-react";

const businessValues = [
  {
    pain: "作图成本高",
    value: "降低作图门槛",
    description: "把商品图制作拆成上传、分析、Prompt 和多方案生成，降低卖家试错成本。",
    icon: BadgeCheck
  },
  {
    pain: "爆款图难复用",
    value: "提取抽象策略而非复制图片",
    description: "只抽取场景、光线、卖点、构图意图等策略，避免复刻竞品视觉资产。",
    icon: ImageOff
  },
  {
    pain: "商品主体不一致",
    value: "保留用户自有商品主体",
    description: "以用户上传并抠出的商品主体为唯一商品来源，避免生成竞品商品。",
    icon: Boxes
  },
  {
    pain: "合规风险不可控",
    value: "生成前进行合规检查",
    description: "在 Prompt 和风险元素层面检查 logo、商标、肖像、IP、包装等风险。",
    icon: ShieldAlert
  }
];

export function BusinessValueSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">Business Value</p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-ink">业务痛点与产品价值</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-ink/62">
          面向 Temu 跨境卖家的真实作图场景，把“借鉴爆款”转化为可控、原创、可解释的 AI 生产流程。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {businessValues.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.pain} className="rounded-md border border-line bg-white p-5 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-field text-mint">
                <Icon size={20} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink">
                <span>{item.pain}</span>
                <ArrowRight size={16} className="text-ink/36" />
                <span className="text-mint">{item.value}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/64">{item.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
