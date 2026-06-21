import type { CompetitorAnalysis, ComplianceCheckResult, RiskLevel } from "../types";

const normalize = (value: string) => value.toLowerCase();

const containsAny = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

const hasUnsafePromptIntent = (promptText: string, keywords: string[]) => containsAny(promptText, keywords);

const extractUnsafePromptText = (promptText: string) =>
  promptText
    .split("\n")
    .filter((line) => {
      const normalizedLine = line.trim().toLowerCase();
      if (normalizedLine.startsWith("no ")) return false;
      if (normalizedLine.startsWith("do not ")) return false;
      if (normalizedLine.startsWith("avoid ")) return false;
      if (normalizedLine.includes("negative prompt")) return false;
      return true;
    })
    .join("\n");

const hasSafeRewriteMarker = (promptText: string) =>
  promptText.includes("safe rewrite mode") &&
  promptText.includes("exclude detected restricted elements") &&
  promptText.includes("abstract strategy only");

const makeResult = (
  id: string,
  riskName: string,
  riskLevel: RiskLevel,
  passed: boolean,
  description: string,
  mitigation: string
): ComplianceCheckResult => ({
  id,
  risk_name: riskName,
  risk_level: riskLevel,
  passed,
  description,
  mitigation
});

export function runComplianceCheck(
  competitorAnalysis: CompetitorAnalysis,
  generatedPrompt: string
): ComplianceCheckResult[] {
  const riskText = normalize(competitorAnalysis.risk_elements.join(" "));
  const promptText = normalize(generatedPrompt);
  const unsafePromptText = extractUnsafePromptText(promptText);
  const safeRewriteMode = hasSafeRewriteMarker(promptText);

  const promptCopyRisk = hasUnsafePromptIntent(unsafePromptText, [
    "copy competitor",
    "copy the competitor",
    "identical to competitor",
    "same as competitor",
    "replica of",
    "clone of"
  ]);
  const promptBrandRisk = hasUnsafePromptIntent(unsafePromptText, [
    "use brand logo",
    "include brand logo",
    "use trademark",
    "include trademark"
  ]);

  const logoRisk = containsAny(riskText, ["logo", "brand", "品牌", "品牌名", "品牌标识"]);
  const trademarkRisk = containsAny(riskText, ["trademark", "商标"]);
  const ipRisk = containsAny(riskText, ["copyrighted character", "ip", "版权", "版权图案", "角色"]);
  const faceRisk = containsAny(riskText, ["celebrity", "face", "人物", "肖像", "人脸", "明星"]);
  const packagingRisk = containsAny(riskText, ["unique packaging", "独特包装", "包装设计"]);
  const competitorProductRisk = containsAny(riskText, ["competitor product", "竞品商品主体", "竞品主体"]);
  const backgroundRisk = containsAny(riskText, ["background", "背景", "场景过度相似"]);
  const compositionRisk = containsAny(riskText, ["composition", "构图", "高度相似版式", "版式"]);
  const textLayoutRisk = containsAny(riskText, ["text", "layout", "文字", "排版", "标签", "参数区"]);
  const platformRisk = containsAny(riskText, ["medical", "医疗", "功效", "前后对比", "虚假", "夸大"]);

  return [
    makeResult(
      "logo_brand_reuse",
      "竞品 logo / 品牌名复用风险",
      logoRisk || promptBrandRisk ? "high" : "low",
      safeRewriteMode || (!logoRisk && !promptBrandRisk),
      logoRisk || promptBrandRisk
        ? "竞品分析或 Prompt 中出现 logo、brand、品牌名、品牌标识等高风险信号。"
        : "未发现明确的竞品 logo 或品牌名复用信号。",
      "生成图不得出现竞品品牌标识、店铺名、品牌名或相近视觉标识；使用无品牌原创画面。"
    ),
    makeResult(
      "trademark_infringement",
      "商标侵权风险",
      trademarkRisk || promptBrandRisk ? "high" : "low",
      safeRewriteMode || (!trademarkRisk && !promptBrandRisk),
      trademarkRisk || promptBrandRisk
        ? "检测到 trademark、商标或 Prompt 中的品牌标识相关风险词。"
        : "未发现明确商标复用信号。",
      "移除商标相关描述，改为通用、无品牌、不可识别的原创电商图。"
    ),
    makeResult(
      "ip_character_copyright",
      "IP 角色或版权图案风险",
      ipRisk ? "high" : "low",
      safeRewriteMode || !ipRisk,
      ipRisk ? "竞品分析中存在 IP、版权图案、角色或 copyrighted character 风险。" : "未发现明确 IP 或版权角色风险。",
      "不要使用任何角色、插画、版权贴纸或竞品图中的装饰素材，改用原创几何或通用生活元素。"
    ),
    makeResult(
      "portrait_right",
      "人物肖像权风险",
      faceRisk ? "high" : "low",
      safeRewriteMode || !faceRisk,
      faceRisk ? "竞品分析中存在 celebrity、face、人物、肖像或人脸相关风险。" : "未发现明确人物肖像风险。",
      "避免出现可识别人脸或名人形象；如需人物场景，仅使用不可识别局部姿态。"
    ),
    makeResult(
      "unique_packaging",
      "竞品独特包装设计复用风险",
      packagingRisk ? "high" : "low",
      safeRewriteMode || !packagingRisk,
      packagingRisk ? "竞品分析中存在 unique packaging、独特包装或包装设计风险。" : "未发现明确独特包装复用风险。",
      "只使用用户上传商品主体，不生成竞品包装结构、图案、配色或包装文案。"
    ),
    makeResult(
      "background_similarity",
      "竞品原图背景过度相似风险",
      backgroundRisk || promptCopyRisk ? (promptCopyRisk ? "high" : "medium") : "low",
      safeRewriteMode || (!backgroundRisk && !promptCopyRisk),
      backgroundRisk || promptCopyRisk
        ? "检测到背景复用、过度相似或 Prompt 中存在 copy/identical/replica/clone 等危险词。"
        : "未发现明确背景过度相似风险。",
      "重新设计原创背景材质、空间、色彩和道具，不复用竞品原图背景。"
    ),
    makeResult(
      "composition_similarity",
      "竞品构图过度相似风险",
      compositionRisk || promptCopyRisk ? (promptCopyRisk ? "high" : "medium") : "low",
      safeRewriteMode || (!compositionRisk && !promptCopyRisk),
      compositionRisk || promptCopyRisk
        ? "检测到构图、版式或 Prompt 复刻倾向，可能导致整体视觉近似。"
        : "未发现明确构图复刻风险。",
      "改用不同视角、不同留白比例、不同主体位置和不同道具布局。"
    ),
    makeResult(
      "text_layout_clone",
      "竞品文字排版复刻风险",
      textLayoutRisk || promptCopyRisk ? (promptCopyRisk ? "high" : "medium") : "low",
      safeRewriteMode || (!textLayoutRisk && !promptCopyRisk),
      textLayoutRisk || promptCopyRisk
        ? "竞品分析中存在文字、标签、参数区或排版复刻风险。"
        : "未发现明确文字排版复刻风险。",
      "只保留卖点表达意图，重新写文案、重新设计图标、位置和信息层级。"
    ),
    makeResult(
      "competitor_subject_misuse",
      "竞品商品主体误用风险",
      competitorProductRisk ? "high" : "low",
      safeRewriteMode || !competitorProductRisk,
      competitorProductRisk ? "竞品分析中存在 competitor product 或竞品商品主体误用风险。" : "未发现明确竞品商品主体误用风险。",
      "生成图只能使用用户商品主体，不使用竞品商品、竞品包装或竞品局部结构。"
    ),
    makeResult(
      "platform_policy",
      "平台合规风险",
      platformRisk ? "high" : "medium",
      safeRewriteMode || !platformRisk,
      platformRisk
        ? "竞品分析中存在医疗功效、夸大功效、虚假前后对比等平台审核风险。"
        : "未发现明确医疗、夸大功效或虚假对比风险，但仍需避免绝对化表达。",
      "避免医疗功效、绝对化承诺、虚假前后对比和无法证明的转化承诺，使用中性功能描述。"
    )
  ];
}
