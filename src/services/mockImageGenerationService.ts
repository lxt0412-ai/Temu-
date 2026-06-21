import type { GenerationResult } from "../types";

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("无法读取商品主体图"));
    image.src = src;
  });

type MockPlanType = "main" | "scene" | "selling";
type MockCategory = "kitchen" | "beauty" | "pet" | "home" | "electronics" | "fashion" | "general";

const includesAny = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickHue(prompt: string, category: MockCategory) {
  const normalized = prompt.toLowerCase();
  const categoryHue: Record<MockCategory, number> = {
    kitchen: 132,
    beauty: 350,
    pet: 34,
    home: 92,
    electronics: 216,
    fashion: 24,
    general: 162
  };
  const sceneHue =
    includesAny(normalized, ["green", "绿色", "自然", "户外", "植物"]) ? 132 :
    includesAny(normalized, ["blue", "蓝", "科技", "清洁", "水滴", "浴室"]) ? 210 :
    includesAny(normalized, ["warm", "暖", "木质", "家居", "厨房"]) ? 38 :
    includesAny(normalized, ["pink", "粉", "美妆", "高级"]) ? 348 :
    includesAny(normalized, ["dark", "黑", "深色", "高对比"]) ? 228 :
    categoryHue[category];

  return (sceneHue + (hashString(prompt) % 35) - 17 + 360) % 360;
}

function makePalette(prompt: string, category: MockCategory) {
  const hue = pickHue(prompt, category);
  const seed = hashString(prompt);
  const saturation = 24 + (seed % 18);
  const lightness = 94 - (seed % 7);

  return {
    base: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    soft: `hsl(${hue}, ${Math.min(58, saturation + 14)}%, ${Math.max(82, lightness - 9)}%)`,
    accent: `hsl(${hue}, ${Math.min(64, saturation + 24)}%, ${Math.max(50, lightness - 35)}%)`,
    deep: `hsl(${hue}, ${Math.min(54, saturation + 18)}%, ${Math.max(22, lightness - 62)}%)`,
    accentSoft: `hsla(${hue}, ${Math.min(64, saturation + 24)}%, ${Math.max(50, lightness - 35)}%, 0.2)`,
    accentWash: `hsla(${hue}, ${Math.min(64, saturation + 24)}%, ${Math.max(50, lightness - 35)}%, 0.14)`,
    deepWash: `hsla(${hue}, ${Math.min(54, saturation + 18)}%, ${Math.max(22, lightness - 62)}%, 0.12)`
  };
}

function detectPlan(prompt: string): MockPlanType {
  const normalized = prompt.toLowerCase();
  if (includesAny(normalized, ["creative option: 方案 c", "方案 c", "selling point image", "core selling points", "卖点图风格"])) {
    return "selling";
  }
  if (includesAny(normalized, ["creative option: 方案 b", "方案 b", "lifestyle scene image", "original lifestyle scene", "场景图风格"])) {
    return "scene";
  }
  return "main";
}

function detectCategory(prompt: string): MockCategory {
  const normalized = prompt.toLowerCase();
  if (includesAny(normalized, ["kitchen", "厨房", "厨具", "餐具"])) return "kitchen";
  if (includesAny(normalized, ["beauty", "美妆", "个护", "护理", "清洁护理"])) return "beauty";
  if (includesAny(normalized, ["pet", "宠物"])) return "pet";
  if (includesAny(normalized, ["home", "家居", "收纳", "居家"])) return "home";
  if (includesAny(normalized, ["electronics", "3c", "数码", "科技", "电子"])) return "electronics";
  if (includesAny(normalized, ["fashion", "服饰", "配件", "穿搭", "鞋", "包"])) return "fashion";
  return "general";
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function getProductBounds(product: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = product.width;
  canvas.height = product.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return { x: 0, y: 0, width: product.width, height: product.height };
  }

  context.drawImage(product, 0, 0);
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;
  let count = 0;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha < 18) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      count += 1;
    }
  }

  if (count === 0) {
    return { x: 0, y: 0, width: product.width, height: product.height };
  }

  const padding = Math.max(8, Math.round(Math.min(canvas.width, canvas.height) * 0.015));
  const x = Math.max(0, minX - padding);
  const y = Math.max(0, minY - padding);
  const width = Math.min(canvas.width - x, maxX - minX + 1 + padding * 2);
  const height = Math.min(canvas.height - y, maxY - minY + 1 + padding * 2);

  return { x, y, width, height };
}

function drawCategoryScene(
  context: CanvasRenderingContext2D,
  category: MockCategory,
  palette: ReturnType<typeof makePalette>,
  variantA: number,
  variantB: number
) {
  if (category === "kitchen") {
    context.fillStyle = "rgba(255,255,255,0.68)";
    roundedRect(context, 108, 668 + variantB * 2, 808, 118, 24);
    context.fill();
    context.fillStyle = palette.deepWash;
    roundedRect(context, 132, 718, 760, 58, 16);
    context.fill();
    context.strokeStyle = palette.accentSoft;
    context.lineWidth = 5;
    for (let index = 0; index < 5; index += 1) {
      context.strokeRect(144 + index * 144, 158, 112, 86);
    }
    context.beginPath();
    context.ellipse(740 + variantA * 6, 690, 86, 28, 0, 0, Math.PI * 2);
    context.stroke();
    return;
  }

  if (category === "beauty") {
    context.fillStyle = "rgba(255,255,255,0.7)";
    roundedRect(context, 146, 694 + variantB * 2, 732, 92, 24);
    context.fill();
    context.strokeStyle = palette.accentSoft;
    context.lineWidth = 8;
    context.beginPath();
    context.ellipse(770 + variantA * 7, 388, 88, 126, 0, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = palette.accentWash;
    context.beginPath();
    context.ellipse(260 - variantB * 8, 660, 122, 46, 0, 0, Math.PI * 2);
    context.fill();
    return;
  }

  if (category === "pet") {
    context.fillStyle = "rgba(255,255,255,0.64)";
    roundedRect(context, 120, 680 + variantB * 2, 784, 118, 32);
    context.fill();
    context.fillStyle = palette.accentWash;
    context.beginPath();
    context.ellipse(258 + variantA * 10, 692, 126, 46, -0.12, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = palette.deepWash;
    for (let index = 0; index < 3; index += 1) {
      context.beginPath();
      context.ellipse(720 + index * 38, 642 - index * 8, 15, 20, 0.2, 0, Math.PI * 2);
      context.fill();
    }
    return;
  }

  if (category === "home") {
    context.fillStyle = "rgba(255,255,255,0.66)";
    roundedRect(context, 112, 650 + variantB * 2, 800, 136, 26);
    context.fill();
    context.fillStyle = palette.deepWash;
    roundedRect(context, 650 + variantA * 8, 420, 170, 220, 24);
    context.fill();
    context.fillStyle = "rgba(255,255,255,0.42)";
    for (let index = 0; index < 3; index += 1) {
      roundedRect(context, 674, 452 + index * 54, 122, 28, 8);
      context.fill();
    }
    return;
  }

  if (category === "electronics") {
    context.fillStyle = "rgba(255,255,255,0.62)";
    roundedRect(context, 122, 706 + variantB * 2, 780, 78, 16);
    context.fill();
    context.strokeStyle = palette.accentSoft;
    context.lineWidth = 6;
    roundedRect(context, 664 + variantA * 8, 388, 192, 126, 18);
    context.stroke();
    context.fillStyle = palette.deepWash;
    for (let index = 0; index < 5; index += 1) {
      context.fillRect(166 + index * 128, 732 - index * (10 + Math.abs(variantA)), 86, 3);
    }
    return;
  }

  if (category === "fashion") {
    context.fillStyle = "rgba(255,255,255,0.66)";
    roundedRect(context, 126, 688 + variantB * 2, 772, 92, 24);
    context.fill();
    context.strokeStyle = palette.accentSoft;
    context.lineWidth = 7;
    roundedRect(context, 708 + variantA * 7, 330, 116, 280, 58);
    context.stroke();
    context.beginPath();
    context.moveTo(190, 332);
    context.lineTo(430, 332);
    context.stroke();
    return;
  }

  context.fillStyle = "rgba(255,255,255,0.62)";
  roundedRect(context, 132, 690, 760, 80, 22);
  context.fill();
}

function fillBackground(
  context: CanvasRenderingContext2D,
  category: MockCategory,
  plan: MockPlanType,
  size: number,
  prompt: string
) {
  const palette = makePalette(prompt, category);
  const seed = hashString(prompt);
  const variantA = (seed % 9) - 4;
  const variantB = ((seed >> 4) % 11) - 5;
  const normalized = prompt.toLowerCase();
  const hasWater = includesAny(normalized, ["水滴", "浴室", "clean", "清洁", "blue"]);
  const hasNature = includesAny(normalized, ["植物", "自然", "户外", "green"]);
  const hasWarmHome = includesAny(normalized, ["木质", "家居", "厨房", "warm", "收纳"]);
  const hasTech = includesAny(normalized, ["科技", "3c", "electronics", "blue", "数码"]);
  const hasBathroom = includesAny(normalized, ["浴室", "洗手台", "bathroom", "sink", "vanity"]);
  const hasDesk = includesAny(normalized, ["书桌", "桌面", "desk", "desktop"]);
  const hasSeaside = includesAny(normalized, ["海边", "海滩", "seaside", "beach", "shore"]);

  const gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, plan === "main" ? "#ffffff" : palette.base);
  gradient.addColorStop(0.58, palette.base);
  gradient.addColorStop(1, palette.soft);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  if (plan === "main") {
    context.fillStyle = "rgba(255, 255, 255, 0.86)";
    roundedRect(context, 70 + variantA * 3, 76 + variantB * 2, size - 146, size - 158, 34);
    context.fill();
    context.strokeStyle = "rgba(23, 33, 27, 0.08)";
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = palette.accentWash;
    context.beginPath();
    context.ellipse(798 + variantA * 10, 210 + variantB * 8, 88 + Math.abs(variantA) * 5, 40, 0.2, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = palette.deepWash;
    if (hasBathroom) {
      roundedRect(context, 164, 718 + variantB * 2, 696, 66, 18);
      context.fill();
      context.strokeStyle = palette.accentSoft;
      context.lineWidth = 8;
      context.beginPath();
      context.ellipse(748 + variantA * 6, 716, 78, 24, 0, 0, Math.PI * 2);
      context.stroke();
    } else if (hasDesk || hasWarmHome) {
      roundedRect(context, 154, 714 + variantB * 2, 716, 72, 14);
      context.fill();
      context.fillStyle = "rgba(255,255,255,0.42)";
      roundedRect(context, 694 + variantA * 5, 638, 116, 54, 12);
      context.fill();
    } else if (hasSeaside) {
      context.strokeStyle = palette.accentSoft;
      context.lineWidth = 9;
      for (let index = 0; index < 3; index += 1) {
        context.beginPath();
        context.arc(354 + index * 124, 736 + index * 10, 72, Math.PI * 0.08, Math.PI * 0.92);
        context.stroke();
      }
    } else if (hasWater) {
      context.fillStyle = palette.accentWash;
      for (let index = 0; index < 3; index += 1) {
        context.beginPath();
        context.ellipse(218 + index * 290 + variantA * 4, 690 + index * 18, 22, 34, 0.15, 0, Math.PI * 2);
        context.fill();
      }
    }
    return;
  }

  if (plan === "scene") {
    context.fillStyle = "rgba(255,255,255,0.58)";
    roundedRect(context, 90, 626 + variantB * 4, 844, 170, 28);
    context.fill();

    context.fillStyle = palette.accentSoft;
    context.beginPath();
    context.ellipse(194 + variantA * 14, 206 + variantB * 10, 92, 64, -0.45, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.ellipse(842 - variantB * 13, 248 + variantA * 8, 118, 82, 0.2, 0, Math.PI * 2);
    context.fill();

    if (["kitchen", "beauty", "pet", "home", "electronics", "fashion"].includes(category)) {
      drawCategoryScene(context, category, palette, variantA, variantB);
    } else if (hasWarmHome) {
      context.fillStyle = palette.deepWash;
      roundedRect(context, 116, 704, 792, 74, 18);
      context.fill();
      context.fillStyle = "rgba(255,255,255,0.62)";
      roundedRect(context, 690 + variantA * 8, 508 + variantB * 8, 142, 92, 18);
      context.fill();
    } else if (hasWater || category === "beauty") {
      context.fillStyle = "rgba(255,255,255,0.68)";
      context.beginPath();
      context.ellipse(770 + variantA * 9, 592 + variantB * 7, 108, 46, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = palette.accentWash;
      context.beginPath();
      context.ellipse(250 - variantB * 10, 646, 130, 52, 0, 0, Math.PI * 2);
      context.fill();
    } else if (hasTech || category === "electronics") {
      context.fillStyle = palette.deepWash;
      for (let index = 0; index < 5; index += 1) {
        context.fillRect(164 + index * 132, 714 - index * (16 + Math.abs(variantA)), 86, 2);
      }
    } else if (hasNature) {
      context.fillStyle = palette.accentWash;
      for (let index = 0; index < 4; index += 1) {
        context.beginPath();
        context.ellipse(142 + index * 58, 624 - index * 24, 28, 54, -0.38, 0, Math.PI * 2);
        context.fill();
      }
    } else {
      context.fillStyle = "rgba(255,255,255,0.62)";
      roundedRect(context, 132, 690, 760, 80, 22);
      context.fill();
    }
    return;
  }

  context.fillStyle = "rgba(255,255,255,0.9)";
  roundedRect(context, 58 + variantA * 2, 70, 908 - variantA * 4, 878, 32);
  context.fill();
  context.strokeStyle = "rgba(23, 33, 27, 0.08)";
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = palette.accentWash;
  roundedRect(context, 618 + variantA * 9, 150 + variantB * 5, 276, 104, 24);
  context.fill();
  roundedRect(context, 646 - variantB * 8, 300, 232, 86, 22);
  context.fill();
  roundedRect(context, 618 + variantB * 6, 436 + variantA * 4, 276, 86, 22);
  context.fill();

  context.strokeStyle = palette.accentSoft;
  context.lineWidth = 4;
  for (let index = 0; index < 3; index += 1) {
    context.beginPath();
    context.arc(642 + index * 12, 178 + index * 142, 18, 0, Math.PI * 2);
    context.stroke();
  }

  context.fillStyle = palette.deep;
  context.globalAlpha = 0.2;
  context.fillRect(684, 186, 152, 8);
  context.fillRect(684, 214, 108, 8);
  context.fillRect(704, 332, 126, 8);
  context.fillRect(704, 360, 92, 8);
  context.fillRect(684, 470, 152, 8);
  context.fillRect(684, 498, 110, 8);
  context.globalAlpha = 1;

  context.strokeStyle = palette.accentSoft;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(580, 244);
  context.lineTo(636, 202);
  context.moveTo(572, 386);
  context.lineTo(658, 344);
  context.moveTo(568, 522);
  context.lineTo(634, 480);
  context.stroke();
}

function drawProduct(
  context: CanvasRenderingContext2D,
  product: HTMLImageElement,
  plan: MockPlanType,
  canvasSize: number
) {
  const bounds = getProductBounds(product);
  const maxWidth = plan === "main" ? 780 : plan === "scene" ? 700 : 620;
  const maxHeight = plan === "main" ? 780 : plan === "scene" ? 720 : 720;
  const fitScale = Math.min(maxWidth / bounds.width, maxHeight / bounds.height);
  const minArea = canvasSize * canvasSize * 0.25;
  const areaScale = Math.sqrt(minArea / (bounds.width * bounds.height));
  const scale = Math.min(Math.max(fitScale, areaScale), fitScale);
  const width = bounds.width * scale;
  const height = bounds.height * scale;
  const x = plan === "selling" ? Math.max(70, 276 - width * 0.5) : (canvasSize - width) / 2;
  const y = plan === "scene" ? Math.max(164, 250 - height * 0.12) : plan === "selling" ? (canvasSize - height) / 2 + 72 : (canvasSize - height) / 2 + 18;

  context.save();
  context.shadowColor = "rgba(23, 33, 27, 0.22)";
  context.shadowBlur = plan === "main" ? 32 : 42;
  context.shadowOffsetY = plan === "main" ? 22 : 30;
  context.drawImage(product, bounds.x, bounds.y, bounds.width, bounds.height, x, y, width, height);
  context.restore();
}

export async function generateMockProductImage(productCutoutUrl: string, prompt: string): Promise<GenerationResult> {
  await delay(700);

  const product = await loadImage(productCutoutUrl);
  const plan = detectPlan(prompt);
  const category = detectCategory(prompt);
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("当前浏览器不支持 Canvas mock 生图");
  }

  fillBackground(context, category, plan, size, prompt);
  drawProduct(context, product, plan, size);

  const planLabel = plan === "main" ? "主图浅色背景" : plan === "scene" ? "原创生活场景背景" : "原创卖点图背景";

  return {
    imageUrl: canvas.toDataURL("image/png"),
    prompt,
    provider: "mock",
    notes: `Mock 生图已根据 Prompt 合成「${planLabel}」，类目倾向：${category}。后续接入真实生图 API 时可替换 provider 实现。`
  };
}
