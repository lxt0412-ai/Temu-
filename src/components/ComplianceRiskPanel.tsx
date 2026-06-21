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

export function ComplianceRiskPanel({ risks, warning }: ComplianceRiskPanelProps) {
  const failedHighCount = risks.filter((risk) => risk.risk_level === "high" && !risk.passed).length;

  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {failedHighCount > 0 ? <ShieldAlert className="text-coral" size={20} /> : <ShieldCheck className="text-mint" size={20} />}
          <h2 className="text-base font-semibold text-ink">合规检查结果</h2>
        </div>
        {risks.length > 0 ? (
          <span className="rounded-md border border-line bg-field px-3 py-1 text-sm text-ink/70">
            高风险未通过：{failedHighCount}
          </span>
        ) : null}
      </div>

      {warning ? (
        <div className="mt-4 rounded-md border border-coral/35 bg-coral/10 p-3 text-sm leading-6 text-coral">
          {warning}
        </div>
      ) : null}

      {risks.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
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
      ) : (
        <p className="mt-4 rounded-md bg-field p-4 text-sm leading-6 text-ink/55">
          点击生成前，系统会严格检查 logo、品牌名、商标、IP、肖像、独特包装、背景相似、构图相似、文字排版、竞品主体误用和平台合规风险。
        </p>
      )}
    </div>
  );
}
