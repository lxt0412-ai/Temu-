import { BarChart3, CheckCircle2, Gauge, ShieldCheck, TrendingUp } from "lucide-react";

const metricGroups = [
  {
    title: "效率指标",
    icon: Gauge,
    metrics: [
      { name: "单张商品图制作时间", value: "8 min", note: "目标：缩短从构思到出图时间" },
      { name: "批量生成图片数量", value: "30 / batch", note: "目标：支持多商品、多方案扩展" },
      { name: "设计师返工次数", value: "-35%", note: "目标：减少重复修图和改版" },
      { name: "从上传到生成的平均耗时", value: "90 s", note: "目标：提升端到端效率" }
    ]
  },
  {
    title: "质量指标",
    icon: CheckCircle2,
    metrics: [
      { name: "商品主体一致性", value: "96 / 100", note: "目标：确保使用用户自有商品主体" },
      { name: "图片清晰度", value: "92 / 100", note: "目标：减少模糊、变形和低质图" },
      { name: "构图评分", value: "88 / 100", note: "目标：提升视觉稳定性和可读性" },
      { name: "Prompt 通过率", value: "94%", note: "目标：降低违规 Prompt 占比" },
      { name: "用户采纳率", value: "42%", note: "目标：衡量方案是否可用" }
    ]
  },
  {
    title: "转化指标",
    icon: TrendingUp,
    metrics: [
      { name: "CTR 点击率变化", value: "+12%", note: "目标：评估列表页主图吸引力" },
      { name: "商品收藏率", value: "+8%", note: "目标：观察用户兴趣提升" },
      { name: "加购率", value: "+6%", note: "目标：衡量素材对购买意向的影响" },
      { name: "详情页停留时长", value: "+18%", note: "目标：验证场景图和卖点图的信息价值" },
      { name: "A/B 测试胜率", value: "61%", note: "目标：比较 AI 图与原素材表现" }
    ]
  },
  {
    title: "合规指标",
    icon: ShieldCheck,
    metrics: [
      { name: "高风险元素拦截率", value: "98%", note: "目标：前置拦截 logo、商标、IP、肖像" },
      { name: "Prompt 合规通过率", value: "93%", note: "目标：提升生成前安全性" },
      { name: "侵权风险命中率", value: "89%", note: "目标：识别竞品图中的复用风险" },
      { name: "人工审核通过率", value: "91%", note: "目标：衡量上线前素材审核质量" }
    ]
  }
];

export function ProductMetricsSection() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mint">Product Metrics</p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal text-ink">产品指标与商业价值设计</h2>
          </div>
          <div className="rounded-md border border-amber/35 bg-amber/15 px-3 py-2 text-sm font-semibold text-[#8a5a08]">
            Demo mock 指标，用于展示产品评估思路，不代表真实业务数据
          </div>
        </div>

        <p className="mt-4 max-w-4xl text-sm leading-6 text-ink/62">
          这些指标用于说明 AI 产品经理如何评估“效率、质量、转化、合规”四条主线。真实上线时需要通过埋点、A/B 测试、审核数据和商家反馈验证。
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {metricGroups.map((group) => {
            const Icon = group.icon;

            return (
              <article key={group.title} className="rounded-md border border-line bg-field p-5">
                <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-mint">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-bold text-ink">{group.title}</h3>
                  </div>
                  <BarChart3 size={18} className="text-ink/32" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {group.metrics.map((metric) => (
                    <div key={metric.name} className="rounded-md border border-line bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/42">{metric.name}</div>
                      <div className="mt-2 text-xl font-bold text-ink">{metric.value}</div>
                      <p className="mt-1 text-xs leading-5 text-ink/58">{metric.note}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
