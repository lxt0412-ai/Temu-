import { CheckCircle2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import type { ComplianceCheckResult } from "../types";

interface ComplianceRiskPanelProps {
  risks: ComplianceCheckResult[];
  warning?: string;
}

const riskStyles = {
  low: "border-mint/25 bg-mint/10 text-mint",
  medium: "border-amber/35 bg-amber/15 text-[#8a5a08]",
  high: "border-coral/40 bg-coral/10 text-coral"
};

const cardStyles = {
  low: "border-line bg-field",
  medium: "border-amber/40 bg-[#fff8e8]",
  high: "border-coral/45 bg-[#fff1ed]"
};

const riskPriority = {
  low: 1,
  medium: 2,
  high: 3
};

const riskLabel = {
  low: "低风险",
  medium: "中风险",
  high: "高风险"
};

const riskGroups = [
  {
    title: "商标 / Logo 风险",
    ids: ["logo_brand_reuse", "trademark_infringement"],
    fallback: "检查竞品 logo、品牌名、商标和 Prompt 中的品牌复用倾向。"
  },
  {
    title: "IP / 版权图案风险",
    ids: ["ip_character_copyright"],
    fallback: "检查 IP 角色、版权图案、插画贴纸和受保护视觉素材。"
  },
  {
    title: "人物肖像风险",
    ids: ["portrait_right"],
    fallback: "检查人物肖像、名人、人脸和可识别人物风险。"
  },
  {
    title: "独特包装风险",
    ids: ["unique_packaging", "competitor_subject_misuse"],
    fallback: "检查竞品包装结构、包装图案和竞品商品主体误用风险。"
  },
  {
    title: "构图过度相似风险",
    ids: ["composition_similarity", "background_similarity"],
    fallback: "检查背景、构图、版式和整体视觉是否过度接近竞品。"
  },
  {
    title: "文案夸大风险",
    ids: ["text_layout_clone", "platform_policy"],
    fallback: "检查文字排版复刻、夸大卖点、医疗功效和虚假前后对比。"
  },
  {
    title: "平台合规风险",
    ids: ["platform_policy"],
    fallback: "检查跨境平台审核中常见的绝对化、虚假承诺和敏感功效风险。"
  }
];

function normalizeRiskId(id: string) {
  return id.replace(/^[A-C]_/, "");
}

function getWorstRisk(risks: ComplianceCheckResult[], ids: string[]) {
  const matches = risks.filter((risk) => ids.includes(normalizeRiskId(risk.id)));

  if (matches.length === 0) return undefined;

  return matches.reduce((current, risk) => {
    const currentScore = riskPriority[current.risk_level] + (current.passed ? 0 : 0.5);
    const riskScore = riskPriority[risk.risk_level] + (risk.passed ? 0 : 0.5);
    return riskScore > currentScore ? risk : current;
  }, matches[0]);
}

function getComplianceScore(risks: ComplianceCheckResult[]) {
  if (risks.length === 0) return 100;

  const penalty = risks.reduce((total, risk) => {
    if (risk.risk_level === "high") return total + (risk.passed ? 6 : 22);
    if (risk.risk_level === "medium") return total + (risk.passed ? 3 : 10);
    return total + (risk.passed ? 0 : 4);
  }, 0);

  return Math.max(0, Math.min(100, 100 - penalty));
}

function getOverallRisk(score: number, risks: ComplianceCheckResult[]) {
  if (risks.some((risk) => risk.risk_level === "high" && !risk.passed)) return "high";
  if (score < 86 || risks.some((risk) => risk.risk_level === "medium" && !risk.passed)) return "medium";
  return "low";
}

export function ComplianceRiskPanel({ risks, warning }: ComplianceRiskPanelProps) {
  const failedHighCount = risks.filter((risk) => risk.risk_level === "high" && !risk.passed).length;
  const score = getComplianceScore(risks);
  const overallRisk = getOverallRisk(score, risks);

  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {failedHighCount > 0 ? <ShieldAlert className="text-coral" size={20} /> : <ShieldCheck className="text-mint" size={20} />}
          <div>
            <h2 className="text-base font-semibold text-ink">生成前合规风控系统</h2>
            <p className="mt-1 text-sm text-ink/60">在生成图片前评估品牌、版权、肖像、包装、构图和平台审核风险。</p>
          </div>
        </div>
        {risks.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-line bg-field px-3 py-1 text-sm font-semibold text-ink">
              总体合规评分：{score} / 100
            </span>
            <span className={`rounded-md border px-3 py-1 text-sm font-semibold ${riskStyles[overallRisk]}`}>
              风险等级：{riskLabel[overallRisk]}
            </span>
          </div>
        ) : null}
      </div>

      {warning ? (
        <div className="mt-4 rounded-md border border-coral/35 bg-coral/10 p-3 text-sm leading-6 text-coral">
          {warning}
        </div>
      ) : null}

      {risks.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {riskGroups.map((group) => {
            const risk = getWorstRisk(risks, group.ids);
            const level = risk?.risk_level ?? "low";
            const passed = risk?.passed ?? true;

            return (
              <div key={group.title} className={`rounded-md border p-4 ${cardStyles[level]}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-ink">{group.title}</h3>
                  <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${riskStyles[level]}`}>
                    {riskLabel[level]}
                  </span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ink/65">
                  {passed ? <CheckCircle2 className="text-mint" size={14} /> : <XCircle className="text-coral" size={14} />}
                  {passed ? "已通过" : "未通过"}
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/65">{risk?.description ?? group.fallback}</p>
                <p className="mt-2 text-sm leading-6 text-ink/80">
                  规避策略：{risk?.mitigation ?? "保持原创背景、原创构图、无品牌、无版权素材，并使用中性卖点表达。"}
                </p>
              </div>
            );
          })}

          <details className="rounded-md border border-line bg-field p-4 lg:col-span-2">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              查看底层逐项检查结果（{risks.length} 项）
            </summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {risks.map((risk) => (
                <div key={risk.id} className={`rounded-md border p-3 ${cardStyles[risk.risk_level]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-ink">{risk.risk_name}</h3>
                    <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${riskStyles[risk.risk_level]}`}>
                      {risk.risk_level}
                    </span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ink/65">
                    {risk.passed ? <CheckCircle2 className="text-mint" size={14} /> : <XCircle className="text-coral" size={14} />}
                    {risk.passed ? "passed" : "blocked"}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{risk.description}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/80">规避建议：{risk.mitigation}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      ) : (
        <p className="mt-4 rounded-md bg-field p-4 text-sm leading-6 text-ink/55">
          点击生成前，系统会严格检查 logo、品牌名、商标、IP、肖像、独特包装、背景相似、构图相似、文字排版、竞品主体误用和平台合规风险。
        </p>
      )}
    </div>
  );
}
