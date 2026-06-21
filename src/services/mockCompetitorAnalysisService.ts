import type { CompetitorAnalysis } from "../types";

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("无法读取竞品图"));
    image.src = src;
  });

const colorDistance = (
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
) => Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);

const rgbToHsl = (r: number, g: number, b: number) => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { hue: 0, saturation: 0, lightness };
  }

  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;

  if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0);
  if (max === green) hue = (blue - red) / delta + 2;
  if (max === blue) hue = (red - green) / delta + 4;

  return { hue: hue * 60, saturation, lightness };
};

const colorName = (hue: number, saturation: number, lightness: number) => {
  if (lightness > 0.9 && saturation < 0.16) return "高明度白色/浅灰";
  if (lightness < 0.18) return "深色/黑色";
  if (saturation < 0.18) return "中性灰";
  if (hue < 25 || hue >= 345) return "红色系";
  if (hue < 55) return "橙黄暖色系";
  if (hue < 85) return "黄色系";
  if (hue < 165) return "绿色系";
  if (hue < 210) return "青蓝色系";
  if (hue < 260) return "蓝紫色系";
  if (hue < 320) return "粉紫色系";
  return "红粉色系";
};

const dominantInfoZone = (zones: string[]) => zones.slice(0, 2).join("和") || "画面边缘";

function analyzeImagePixels(imageDataUrl: string) {
  return loadImage(imageDataUrl).then((image) => {
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new Error("当前浏览器不支持 Canvas 图片分析");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

    let luminanceTotal = 0;
    let saturationTotal = 0;
    let contrastTotal = 0;
    let warm = 0;
    let cool = 0;
    let green = 0;
    let darkPixels = 0;
    let brightPixels = 0;
    let colorfulPixels = 0;
    let edgeR = 0;
    let edgeG = 0;
    let edgeB = 0;
    let edgeCount = 0;
    let redTotal = 0;
    let greenTotal = 0;
    let blueTotal = 0;
    let strongEdgePixels = 0;
    let textBandEdgePixels = 0;
    let topInfoEdges = 0;
    let bottomInfoEdges = 0;
    let leftInfoEdges = 0;
    let rightInfoEdges = 0;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const index = (y * canvas.width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const hsl = rgbToHsl(r, g, b);

        redTotal += r;
        greenTotal += g;
        blueTotal += b;
        luminanceTotal += luminance;
        saturationTotal += hsl.saturation;
        contrastTotal += Math.abs(luminance - 0.5);

        if (hsl.lightness < 0.23) darkPixels += 1;
        if (hsl.lightness > 0.84) brightPixels += 1;
        if (hsl.saturation > 0.38) colorfulPixels += 1;
        if (hsl.hue >= 25 && hsl.hue <= 75) warm += 1;
        if (hsl.hue >= 170 && hsl.hue <= 260) cool += 1;
        if (hsl.hue >= 80 && hsl.hue <= 165) green += 1;

        if (x < 8 || x > 87 || y < 8 || y > 87) {
          edgeR += r;
          edgeG += g;
          edgeB += b;
          edgeCount += 1;
        }

        if (x > 0 && y > 0) {
          const leftIndex = (y * canvas.width + x - 1) * 4;
          const topIndex = ((y - 1) * canvas.width + x) * 4;
          const leftLuminance =
            (0.2126 * data[leftIndex] + 0.7152 * data[leftIndex + 1] + 0.0722 * data[leftIndex + 2]) / 255;
          const topLuminance =
            (0.2126 * data[topIndex] + 0.7152 * data[topIndex + 1] + 0.0722 * data[topIndex + 2]) / 255;
          const localEdge = Math.max(Math.abs(luminance - leftLuminance), Math.abs(luminance - topLuminance));

          if (localEdge > 0.18) {
            strongEdgePixels += 1;
            if (y < 24 || y > 72 || x < 26 || x > 70) {
              textBandEdgePixels += 1;
            }
            if (y < 28) topInfoEdges += 1;
            if (y > 68) bottomInfoEdges += 1;
            if (x < 30) leftInfoEdges += 1;
            if (x > 66) rightInfoEdges += 1;
          }
        }
      }
    }

    const pixels = canvas.width * canvas.height;
    const edgeColor = {
      r: edgeR / edgeCount,
      g: edgeG / edgeCount,
      b: edgeB / edgeCount
    };

    let foregroundMinX = canvas.width;
    let foregroundMinY = canvas.height;
    let foregroundMaxX = 0;
    let foregroundMaxY = 0;
    let foregroundCount = 0;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const index = (y * canvas.width + x) * 4;
        const distance = colorDistance(data[index], data[index + 1], data[index + 2], edgeColor.r, edgeColor.g, edgeColor.b);
        if (distance < 42) continue;
        foregroundMinX = Math.min(foregroundMinX, x);
        foregroundMinY = Math.min(foregroundMinY, y);
        foregroundMaxX = Math.max(foregroundMaxX, x);
        foregroundMaxY = Math.max(foregroundMaxY, y);
        foregroundCount += 1;
      }
    }

    const averageR = redTotal / pixels;
    const averageG = greenTotal / pixels;
    const averageB = blueTotal / pixels;
    const averageHsl = rgbToHsl(averageR, averageG, averageB);

    return {
      averageLuminance: luminanceTotal / pixels,
      averageSaturation: saturationTotal / pixels,
      averageContrast: contrastTotal / pixels,
      warmRatio: warm / pixels,
      coolRatio: cool / pixels,
      greenRatio: green / pixels,
      darkRatio: darkPixels / pixels,
      brightRatio: brightPixels / pixels,
      colorfulRatio: colorfulPixels / pixels,
      edgeDensity: strongEdgePixels / pixels,
      textBandEdgeDensity: textBandEdgePixels / pixels,
      topInfoDensity: topInfoEdges / pixels,
      bottomInfoDensity: bottomInfoEdges / pixels,
      leftInfoDensity: leftInfoEdges / pixels,
      rightInfoDensity: rightInfoEdges / pixels,
      paletteName: colorName(averageHsl.hue, averageHsl.saturation, averageHsl.lightness),
      foregroundRatio: foregroundCount / pixels,
      foregroundCenterX: foregroundCount ? (foregroundMinX + foregroundMaxX) / 2 / canvas.width : 0.5,
      foregroundCenterY: foregroundCount ? (foregroundMinY + foregroundMaxY) / 2 / canvas.height : 0.5,
      foregroundWidthRatio: foregroundCount ? (foregroundMaxX - foregroundMinX) / canvas.width : 0.6,
      foregroundHeightRatio: foregroundCount ? (foregroundMaxY - foregroundMinY) / canvas.height : 0.6
    };
  });
}

export async function analyzeCompetitorImage(imageDataUrl: string): Promise<CompetitorAnalysis> {
  await delay(500);
  const metrics = await analyzeImagePixels(imageDataUrl);

  const sceneType =
    metrics.brightRatio > 0.45 && metrics.averageSaturation < 0.24
      ? "纯色/浅色背景电商主图"
      : metrics.greenRatio > 0.18
        ? "自然生活化或户外感场景"
        : metrics.warmRatio > 0.2
          ? "家居、桌面或暖色生活场景"
          : metrics.colorfulRatio > 0.32
            ? "促销感或节日感功能展示场景"
            : "功能展示场景 + 简洁电商主图";

  const categoryGuess =
    metrics.coolRatio > 0.2 && metrics.brightRatio > 0.32
      ? "美妆个护 / 清洁护理"
      : metrics.greenRatio > 0.18
        ? "家居园艺 / 宠物 / 户外生活"
        : metrics.warmRatio > 0.22 && metrics.averageSaturation < 0.34
          ? "家居收纳 / 厨房用品"
          : metrics.darkRatio > 0.18 && metrics.averageContrast > 0.24
            ? "3C 数码 / 汽车配件 / 工具类"
            : metrics.colorfulRatio > 0.34
              ? "节日礼品 / 玩具 / 服饰配件"
              : "跨境通用消费品";

  const imageType =
    metrics.textBandEdgeDensity > 0.075 && metrics.foregroundRatio > 0.36
      ? "卖点图 / 功能图"
      : metrics.textBandEdgeDensity > 0.075
        ? "参数图 / 尺寸图 / 信息说明图"
        : metrics.foregroundWidthRatio > 0.72
          ? "主图 / 近景展示图"
          : metrics.foregroundRatio < 0.28 && (metrics.greenRatio > 0.12 || metrics.warmRatio > 0.16)
            ? "场景图 / 生活方式图"
            : metrics.colorfulRatio > 0.32
              ? "促销图 / 节日氛围图"
              : "主图 / 功能展示图";

  const backgroundStyle =
    metrics.brightRatio > 0.4
      ? "高明度浅色背景，适合突出商品轮廓，可改写为原创浅色渐变或干净台面"
      : metrics.darkRatio > 0.22
        ? "深色或高对比背景，适合营造质感；生成时应换成原创光影和不同材质"
        : "中性背景搭配局部生活化材质，可改写为原创桌面、浴室、厨房或收纳场景";

  const composition =
    metrics.foregroundWidthRatio > 0.72
      ? "主体占比较大，强调近景冲击力；生成时改用不同裁切比例、留白和信息区位置"
      : metrics.foregroundCenterX < 0.42 || metrics.foregroundCenterX > 0.58
        ? "偏侧构图或三分法倾向；生成时可保留“突出主体+留出卖点区”的抽象意图，但重做排列"
        : "主体清晰居中，辅以少量功能提示区域；生成时应改用不同角度、不同留白比例和原创布局";

  const cameraAngle =
    metrics.foregroundHeightRatio > 0.74 && metrics.foregroundWidthRatio < 0.58
      ? "正面或轻微 45 度角展示"
      : metrics.foregroundWidthRatio > 0.76 && metrics.foregroundHeightRatio < 0.52
        ? "俯拍或横向铺陈展示"
        : metrics.foregroundRatio > 0.46
          ? "局部特写或近景主图"
          : metrics.foregroundCenterY > 0.58
            ? "略俯拍的桌面/台面场景"
            : "正面、45 度角或使用场景视角";

  const lighting =
    metrics.averageContrast > 0.28
      ? "高对比或强阴影光线，适合强化质感；生成时使用原创布光方向"
      : metrics.averageLuminance > 0.68
        ? "明亮柔光风格，阴影克制，适合跨境平台主图"
        : "柔和棚拍光或自然光，建议保持商品清晰但避免复刻竞品光影";

  const colorPalette =
    `主视觉倾向为${metrics.paletteName}，色彩饱和度${metrics.averageSaturation > 0.3 ? "偏高" : "偏低"}；生成时只借鉴“主色+强调色”的策略，使用原创配色。`;

  const infoZones = [
    { label: "顶部", density: metrics.topInfoDensity },
    { label: "底部", density: metrics.bottomInfoDensity },
    { label: "左侧", density: metrics.leftInfoDensity },
    { label: "右侧", density: metrics.rightInfoDensity }
  ]
    .filter((zone) => zone.density > 0.018)
    .sort((a, b) => b.density - a.density)
    .map((zone) => zone.label);

  const visualHierarchy =
    metrics.textBandEdgeDensity > 0.055
      ? `商品主体作为第一视觉层级，${dominantInfoZone(infoZones)}的信息标签作为第二层级，道具和背景弱化为辅助氛围。`
      : metrics.foregroundRatio > 0.42
        ? "商品主体占据最大视觉权重，背景只承担衬托作用，适合平台快速浏览。"
        : "使用场景和商品共同建立第一印象，商品仍需保持清晰可辨，道具仅服务卖点表达。";

  const sellingPoints =
    metrics.foregroundRatio > 0.4
      ? ["商品外观清晰", "材质或质感突出", "核心功能快速识别", "适合主图点击转化"]
      : metrics.textBandEdgeDensity > 0.055
        ? ["功能卖点可视化", "参数或特性说明", "降低用户理解成本", "适合详情页或广告图"]
        : ["生活化使用场景", "便捷性或省空间", "使用氛围营造", "提升购买想象"];

  const emotionOrLifestyle =
    metrics.coolRatio > 0.18
      ? "清洁感、科技感、清爽高效，适合强调护理、功能或精准解决问题。"
      : metrics.greenRatio > 0.18
        ? "自然、放松、生活方式感，适合传达居家、宠物、户外或健康氛围。"
        : metrics.warmRatio > 0.2
          ? "温暖、舒适、居家感，适合强调收纳、省空间、日常便利。"
          : metrics.colorfulRatio > 0.32
            ? "活泼、促销感或节日氛围，适合强调礼品属性和点击吸引。"
            : "专业、简洁、平台主图友好，适合突出商品本身和高效转化。";

  const textLayout =
    metrics.textBandEdgeDensity > 0.055
      ? `检测到较高密度的边缘信息，疑似文字标签、角标、logo 或参数区集中在${dominantInfoZone(infoZones)}；生成时只保留“有信息层级”的抽象意图，必须重写文案与排版。`
      : metrics.foregroundCenterX < 0.44
      ? "可能存在右侧卖点区或信息留白；生成时不要复制位置，可改为底部或角落原创标签"
      : metrics.foregroundCenterX > 0.56
        ? "可能存在左侧卖点区或信息留白；生成时不要复制位置，可改为顶部或分散式原创标签"
        : "可以设置少量卖点标签或图标化信息区，但需使用原创文案层级、不同位置和不同排版结构";

  const props =
    metrics.greenRatio > 0.18
      ? ["植物", "自然材质", "户外光感", "简洁自然背景"]
      : metrics.coolRatio > 0.18
        ? ["水滴", "浴室元素", "金属或玻璃质感", "冷色功能道具"]
        : metrics.warmRatio > 0.2
          ? ["木质桌面", "家居台面", "暖光生活道具", "简洁几何底座"]
          : ["普通桌面", "收纳容器", "简洁几何底座", "无品牌功能图标"];

  const conversionDesign =
    metrics.textBandEdgeDensity > 0.055
      ? "通过主体大图 + 少量卖点标签降低理解成本，但生成时必须改变标签位置、图标样式和信息层级，避免复刻竞品排版。"
      : metrics.foregroundWidthRatio > 0.72
        ? "通过大主体、高留白和清晰边缘提升搜索流点击率，生成时应使用原创角度和不同留白比例。"
        : "通过场景化氛围让用户理解使用价值，生成时应保留抽象使用意图，但替换为原创背景、原创道具和原创构图。";

  const riskHints = [
    "品牌 logo",
    "商标",
    "人物肖像",
    "IP 角色",
    "竞品商品主体",
    "独特包装",
    "版权图案",
    "高度相似版式"
  ];

  if (metrics.textBandEdgeDensity > 0.055) {
    riskHints.push(`${dominantInfoZone(infoZones)}高密度文字标签或疑似 logo 区域`);
  }
  if (metrics.edgeDensity > 0.16) {
    riskHints.push("复杂贴纸、参数区或装饰素材");
  }

  return {
    category_guess: categoryGuess,
    image_type: imageType,
    scene_type: sceneType,
    background_style: backgroundStyle,
    composition,
    camera_angle: cameraAngle,
    lighting,
    color_palette: colorPalette,
    visual_hierarchy: visualHierarchy,
    selling_points: sellingPoints,
    emotion_or_lifestyle: emotionOrLifestyle,
    props,
    text_layout: textLayout,
    conversion_design: conversionDesign,
    risk_elements: riskHints,
    safe_generation_strategy:
      `仅提取“${imageType}”的抽象营销意图，重新设计原创背景、原创构图、原创道具组合和原创文字布局；只使用用户商品主体。避开竞品 logo、品牌名、人物肖像、IP、独特包装、版权图案和任何可识别版式，改用不同视角、不同留白和不同卖点信息结构。`
  };
}
