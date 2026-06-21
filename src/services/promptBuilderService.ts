import type { CompetitorAnalysis, PromptBuildResult, PromptPlan, PromptPlanId } from "../types";

const baseNegativePrompt = [
  "competitor logo",
  "brand name",
  "trademark",
  "copyrighted character",
  "copied layout",
  "copied background",
  "exact replica",
  "watermark",
  "low quality",
  "blurry",
  "distorted product",
  "wrong product shape",
  "extra text",
  "fake discount badge",
  "misleading medical claim"
];

const includesAny = (value: string, keywords: string[]) => {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
};

function getCategoryStyle(analysis: CompetitorAnalysis) {
  const category = `${analysis.category_guess} ${analysis.scene_type} ${analysis.props.join(" ")}`.toLowerCase();

  if (includesAny(category, ["kitchen", "厨房", "厨具", "餐具"])) {
    return {
      direction:
        "Use a clean kitchen-inspired setting with practical organization cues, tidy surfaces, subtle everyday lifestyle details, and a fresh usable feeling.",
      summary: "根据类目倾向，创意方向会偏干净厨房、实用收纳和日常生活感。"
    };
  }

  if (includesAny(category, ["beauty", "美妆", "个护", "护理", "香水", "清洁护理"])) {
    return {
      direction:
        "Use a premium beauty-product mood with a refined clean background, soft diffused lighting, elegant material texture, and a polished high-end feel.",
      summary: "根据类目倾向，创意方向会偏高级美妆质感、干净背景和柔光氛围。"
    };
  }

  if (includesAny(category, ["pet", "宠物"])) {
    return {
      direction:
        "Use a warm, safe, pet-friendly lifestyle mood with gentle colors, soft domestic details, and a trustworthy practical feeling.",
      summary: "根据类目倾向，创意方向会偏温馨、安全和宠物友好。"
    };
  }

  if (includesAny(category, ["home", "家居", "收纳", "居家"])) {
    return {
      direction:
        "Use a comfortable home setting with a neat room atmosphere, organized space, calm surfaces, and a cozy but commercial visual tone.",
      summary: "根据类目倾向，创意方向会偏家居场景、舒适整洁和空间秩序。"
    };
  }

  if (includesAny(category, ["electronics", "3c", "数码", "科技", "电子", "工具"])) {
    return {
      direction:
        "Use a sleek technology-oriented style with minimalist surfaces, premium black-white-gray or blue accents, crisp reflections, and a precise modern mood.",
      summary: "根据类目倾向，创意方向会偏科技感、极简质感和黑白灰或蓝色调。"
    };
  }

  if (includesAny(category, ["fashion", "服饰", "配件", "穿搭", "鞋", "包"])) {
    return {
      direction:
        "Use a fashion lifestyle direction with tasteful styling cues, refined material texture, wearable context, and a clean editorial e-commerce feel.",
      summary: "根据类目倾向，创意方向会偏穿搭生活方式、材质质感和编辑感电商图。"
    };
  }

  return {
    direction:
      "Use a clean cross-border marketplace style with clear product recognition, practical visual context, commercial polish, and broad consumer appeal.",
    summary: "未命中特定类目模板，因此使用通用跨境电商风格，重点突出清晰、专业和转化。"
  };
}

function getCategorySceneDirection(analysis: CompetitorAnalysis) {
  const category = `${analysis.category_guess} ${analysis.scene_type} ${analysis.props.join(" ")}`.toLowerCase();

  if (includesAny(category, ["kitchen", "厨房", "厨具", "餐具"])) {
    return "For the lifestyle scene option, place the product in an original clean kitchen scene, such as a bright countertop, sink area, cabinet shelf, or meal-prep surface. Keep the setting practical, tidy, and everyday.";
  }

  if (includesAny(category, ["beauty", "美妆", "个护", "护理", "香水", "清洁护理"])) {
    return "For the lifestyle scene option, place the product in an original beauty or personal-care scene, such as a bathroom vanity, wash basin, dressing table, spa-like shelf, or clean skincare corner. Keep the mood premium and hygienic.";
  }

  if (includesAny(category, ["pet", "宠物"])) {
    return "For the lifestyle scene option, place the product in an original pet-friendly home scene, such as a cozy living-room floor, pet care corner, sofa-side area, or clean feeding/storage area. Keep the feeling warm, safe, and trustworthy.";
  }

  if (includesAny(category, ["home", "家居", "收纳", "居家"])) {
    return "For the lifestyle scene option, place the product in an original home scene, such as a tidy living room, bedroom shelf, entryway organizer, closet area, or clean storage corner. Emphasize comfort and order.";
  }

  if (includesAny(category, ["electronics", "3c", "数码", "科技", "电子", "工具"])) {
    return "For the lifestyle scene option, place the product in an original electronics usage scene, such as a modern desk, workstation, bedside table, travel setup, or minimal tech surface. Keep the environment sleek and functional.";
  }

  if (includesAny(category, ["fashion", "服饰", "配件", "穿搭", "鞋", "包"])) {
    return "For the lifestyle scene option, place the product in an original fashion lifestyle scene, such as a wardrobe area, entryway, dressing table, mirror-side setup, or clean outfit styling surface. Emphasize texture and daily wear context.";
  }

  return "For the lifestyle scene option, place the product in an original realistic use scene, such as a clean tabletop, home surface, desk, shelf, or daily-life corner that fits the product category. Keep the setting simple and commercially safe.";
}

const planDefinitions: Array<{
  id: PromptPlanId;
  title: string;
  usage: string;
  planDirection: string;
  difference: string;
  complianceNote: string;
  extraNegative: string[];
}> = [
  {
    id: "A",
    title: "方案 A：平台主图方案",
    usage: "适合 Temu 商品主图。",
    planDirection:
      "Use a white or very light background. Make the product subject large, crisp, centered or slightly offset with strong visual priority. Keep information clean. Do not use complex props. Use subtle shadow and clean product photography polish.",
    difference:
      "与竞品图区别：去掉复杂背景、装饰道具和密集信息区，改为原创白底或浅色主图构图，突出用户商品主体。",
    complianceNote: "主图方案仅突出商品主体，不复用竞品场景、文字布局或道具组合。",
    extraNegative: ["busy props", "cluttered background", "crowded layout"]
  },
  {
    id: "B",
    title: "方案 B：生活场景方案",
    usage: "适合商品轮播图 / 详情页。",
    planDirection:
      "Place the product into an original lifestyle scene that communicates how the item is used. Use a different background, different props, different camera framing, and a believable everyday environment. Keep the product clearly visible.",
    difference:
      "与竞品图区别：重新设计原创生活场景，更换背景材质、空间、道具和镜头距离，只保留抽象使用场景意图。",
    complianceNote: "场景图方案使用原创生活场景，不复制竞品背景、地点、道具摆法或人物元素。",
    extraNegative: ["copied scene", "same props as competitor", "recognizable location"]
  },
  {
    id: "C",
    title: "方案 C：卖点表达方案",
    usage: "适合详情页卖点图。",
    planDirection:
      "Express the core selling points in an original way. A simple clean text area or generic icon-like labels may be used, but the wording, layout, hierarchy, position, and rhythm must be newly designed. Avoid exaggerated or unverifiable claims.",
    difference:
      "与竞品图区别：重建卖点信息结构，改变文字区位置、层级、图标样式和视觉节奏，不复制竞品文案或排版。",
    complianceNote: "卖点图方案只做中性功能表达，不使用夸大功效、虚假前后对比或竞品文案。",
    extraNegative: ["exaggerated claim", "false before-after comparison", "medical treatment claim"]
  }
];

function buildComplianceNotes(analysis: CompetitorAnalysis, planNote: string) {
  return [
    "只使用用户上传并抠出的商品主体，不使用竞品商品主体。",
    "竞品图只作为抽象营销策略参考，不复刻背景、构图、道具、文字排版或包装设计。",
    `需避开的风险元素：${analysis.risk_elements.join("、") || "logo、商标、IP、肖像、独特包装和版权素材"}。`,
    "如竞品图存在品牌、人物、版权角色或独特包装，应在生成图中完全避开。",
    planNote
  ];
}

function buildNegativePrompt(extraItems: string[] = []) {
  return [...baseNegativePrompt, ...extraItems].join(", ");
}

function formatSceneType(sceneType: string) {
  if (sceneType.includes("功能展示场景") && sceneType.includes("简洁电商主图")) {
    return "功能展示场景（比如浴室、洗手台、书桌、海边等） + 简洁电商主图";
  }

  if (sceneType.includes("功能展示场景")) {
    return `${sceneType}（比如浴室、洗手台、书桌、海边等）`;
  }

  return sceneType;
}

function buildPositivePrompt(analysis: CompetitorAnalysis, plan: (typeof planDefinitions)[number]) {
  const categoryStyle = getCategoryStyle(analysis);
  const categorySceneDirection = getCategorySceneDirection(analysis);
  const sceneType = formatSceneType(analysis.scene_type);

  return `1. Task
Create an original cross-border e-commerce product image for Temu marketplace.
Creative option: ${plan.title}.
Usage: ${plan.usage}.
The image must be commercially safe, visually fresh, and designed for marketplace conversion.

2. Main Subject
Use only the uploaded user's product cutout as the main subject.
The original product image as main subject must be preserved accurately.
Do not use the competitor product, competitor packaging, competitor product details, or any product subject from the competitor image.

3. Abstract Inspiration
Use only the abstract marketing strategy inferred from the competitor image:
- Category direction: ${analysis.category_guess}
- Image type: ${analysis.image_type}
- Scene type: ${sceneType}
- Background style direction: ${analysis.background_style}
- Composition intention: ${analysis.composition}
- Camera angle inspiration: ${analysis.camera_angle}
- Lighting direction: ${analysis.lighting}
- Color palette direction: ${analysis.color_palette}
- Visual hierarchy: ${analysis.visual_hierarchy}
- Selling points to communicate: ${analysis.selling_points.join(", ")}
- Lifestyle or emotion: ${analysis.emotion_or_lifestyle}
- Generic prop categories: ${analysis.props.join(", ")}
- Conversion design strategy: ${analysis.conversion_design}
Safe rewrite mode:
Exclude detected restricted elements.
Abstract strategy only.
Transform the reference strategy into a clearly different original visual concept.

4. Original Creative Direction
Create a new original visual solution for the user's product.
${categoryStyle.direction}
Plan-specific direction:
${plan.planDirection}
Category-matched usage scene:
${plan.id === "B" ? categorySceneDirection : "Keep the scene treatment aligned with this option's purpose without turning it into a copied competitor scene."}
Use a different background from the competitor image.
Use a different composition, different product placement, different spacing, and a different camera arrangement.
Use different generic props, only when they support the selling points.
Use a different text layout or avoid text entirely unless simple generic labels are necessary.
Do not use competitor logo, trademark, brand name, IP character, celebrity, recognizable person, copyrighted artwork, or competitor packaging design.
Make the final image feel like a new creative concept, not a reference-image variation.

5. Compliance Guardrails
no competitor product
no logo
no trademark
no copyrighted character
no celebrity or recognizable person
no copied layout
no copied packaging design
no duplicated background
no misleading claims
safe for marketplace use

6. Output Style
high-quality product photography
clean commercial composition
professional studio lighting
marketplace-ready
high conversion e-commerce image
square 1:1 ratio`;
}

function buildPlan(analysis: CompetitorAnalysis, plan: (typeof planDefinitions)[number]): PromptPlan {
  const categoryStyle = getCategoryStyle(analysis);

  return {
    id: plan.id,
    title: plan.title,
    usage: plan.usage,
    positivePrompt: buildPositivePrompt(analysis, plan),
    negativePrompt: buildNegativePrompt(plan.extraNegative),
    complianceNotes: buildComplianceNotes(analysis, plan.complianceNote),
    creativeSummary: `${categoryStyle.summary} ${plan.complianceNote} ${plan.difference}`
  };
}

export function buildGenerationPromptOptions(analysis: CompetitorAnalysis): PromptPlan[] {
  return planDefinitions.map((plan) => buildPlan(analysis, plan));
}

export function buildGenerationPrompt(analysis: CompetitorAnalysis): PromptBuildResult {
  return buildGenerationPromptOptions(analysis)[0];
}

export function buildRewrittenSafePrompt(analysis: CompetitorAnalysis): PromptBuildResult {
  return buildGenerationPromptOptions(analysis)[0];
}
