import type { SegmentationResult } from "../types";

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("无法读取商品图"));
    image.src = src;
  });

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const colorDistance = (
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
) => Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
};

function getPixelIndex(x: number, y: number, width: number) {
  return (y * width + x) * 4;
}

function estimateBackgroundColor(data: Uint8ClampedArray, width: number, height: number) {
  const reds: number[] = [];
  const greens: number[] = [];
  const blues: number[] = [];
  const distances: number[] = [];

  const sample = (x: number, y: number) => {
    const index = getPixelIndex(x, y, width);
    if (data[index + 3] < 20) return;
    reds.push(data[index]);
    greens.push(data[index + 1]);
    blues.push(data[index + 2]);
  };

  const step = Math.max(1, Math.floor(Math.min(width, height) / 80));
  for (let x = 0; x < width; x += step) {
    sample(x, 0);
    sample(x, height - 1);
  }
  for (let y = 0; y < height; y += step) {
    sample(0, y);
    sample(width - 1, y);
  }

  const background = {
    r: median(reds),
    g: median(greens),
    b: median(blues)
  };

  for (let index = 0; index < reds.length; index += 1) {
    distances.push(colorDistance(reds[index], greens[index], blues[index], background.r, background.g, background.b));
  }

  const edgeSpread = median(distances);
  const threshold = clamp(28 + edgeSpread * 1.25, 30, 78);

  return { ...background, threshold };
}

function getLuminance(data: Uint8ClampedArray, x: number, y: number, width: number) {
  const index = getPixelIndex(x, y, width);
  return data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
}

function computeEdgeStrength(data: Uint8ClampedArray, width: number, height: number) {
  const edgeStrength = new Uint8Array(width * height);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const horizontal = getLuminance(data, x + 1, y, width) - getLuminance(data, x - 1, y, width);
      const vertical = getLuminance(data, x, y + 1, width) - getLuminance(data, x, y - 1, width);
      edgeStrength[y * width + x] = clamp(Math.round(Math.sqrt(horizontal ** 2 + vertical ** 2)), 0, 255);
    }
  }

  return edgeStrength;
}

function createEdgeBarrier(edgeStrength: Uint8Array, width: number, height: number) {
  const barrier = new Uint8Array(width * height);
  const minSide = Math.min(width, height);
  const borderMargin = Math.max(2, Math.floor(minSide * 0.015));

  for (let y = borderMargin; y < height - borderMargin; y += 1) {
    for (let x = borderMargin; x < width - borderMargin; x += 1) {
      const index = y * width + x;
      if (edgeStrength[index] < 16) continue;

      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          barrier[ny * width + nx] = 1;
        }
      }
    }
  }

  return barrier;
}

function createFallbackSubjectMask(
  data: Uint8ClampedArray,
  edgeStrength: Uint8Array,
  width: number,
  height: number,
  background: { r: number; g: number; b: number; threshold: number }
) {
  const candidate = new Uint8Array(width * height);
  const visited = new Uint8Array(width * height);
  const keep = new Uint8Array(width * height);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistanceFromCenter = Math.sqrt(centerX ** 2 + centerY ** 2);
  const borderX = width * 0.08;
  const borderY = height * 0.08;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x < borderX || x > width - borderX || y < borderY || y > height - borderY) continue;

      const pixelIndex = getPixelIndex(x, y, width);
      const distance = colorDistance(
        data[pixelIndex],
        data[pixelIndex + 1],
        data[pixelIndex + 2],
        background.r,
        background.g,
        background.b
      );

      const centerDistance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / maxDistanceFromCenter;
      const centralBoost = centerDistance < 0.42 ? 10 : 0;
      const colorSignal = distance > Math.max(18, background.threshold * 0.48);
      const edgeSignal = edgeStrength[y * width + x] + centralBoost > 18;

      if (colorSignal || edgeSignal) {
        candidate[y * width + x] = 1;
      }
    }
  }

  const components: Array<{
    pixels: number[];
    area: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    centerScore: number;
    score: number;
  }> = [];

  const queue: number[] = [];
  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const index = y * width + x;
    if (visited[index] || !candidate[index]) return false;
    visited[index] = 1;
    queue.push(index);
    return true;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const startIndex = y * width + x;
      if (visited[startIndex] || !candidate[startIndex]) continue;

      queue.length = 0;
      enqueue(x, y);
      let cursor = 0;
      const pixels: number[] = [];
      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;
      let sumX = 0;
      let sumY = 0;

      while (cursor < queue.length) {
        const index = queue[cursor];
        cursor += 1;
        pixels.push(index);
        const px = index % width;
        const py = Math.floor(index / width);
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
        sumX += px;
        sumY += py;

        enqueue(px + 1, py);
        enqueue(px - 1, py);
        enqueue(px, py + 1);
        enqueue(px, py - 1);
      }

      const area = pixels.length;
      if (area < 14) continue;

      const componentCenterX = sumX / area;
      const componentCenterY = sumY / area;
      const centerDistance =
        Math.sqrt((componentCenterX - centerX) ** 2 + (componentCenterY - centerY) ** 2) / maxDistanceFromCenter;
      const centerScore = 1 - centerDistance;
      const componentWidth = maxX - minX + 1;
      const componentHeight = maxY - minY + 1;
      const thinPenalty = componentWidth > componentHeight * 6 || componentHeight > componentWidth * 10 ? 0.35 : 1;
      const score = area * Math.max(0.15, centerScore) * thinPenalty;

      components.push({ pixels, area, minX, minY, maxX, maxY, centerScore, score });
    }
  }

  components.sort((a, b) => b.score - a.score);
  const selected = components.filter((component, index) => {
    const touchesCenter =
      component.minX < centerX && component.maxX > centerX && component.minY < centerY * 1.3 && component.maxY > centerY * 0.55;
    return index < 8 && (component.centerScore > 0.58 || touchesCenter || component.area > width * height * 0.018);
  });

  const selectedComponents = selected.length > 0 ? selected : components.slice(0, 4);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let selectedPixelCount = 0;

  for (const component of selectedComponents) {
    selectedPixelCount += component.area;
    minX = Math.min(minX, component.minX);
    minY = Math.min(minY, component.minY);
    maxX = Math.max(maxX, component.maxX);
    maxY = Math.max(maxY, component.maxY);
    for (const pixel of component.pixels) {
      keep[pixel] = 1;
    }
  }

  if (selectedPixelCount === 0) {
    const fallbackMarginX = width * 0.28;
    const fallbackMarginY = height * 0.18;
    minX = fallbackMarginX;
    maxX = width - fallbackMarginX;
    minY = fallbackMarginY;
    maxY = height - fallbackMarginY;
  }

  const padX = Math.max(18, (maxX - minX) * 0.22);
  const padY = Math.max(18, (maxY - minY) * 0.22);
  minX = clamp(Math.floor(minX - padX), borderX, width - borderX);
  maxX = clamp(Math.ceil(maxX + padX), borderX, width - borderX);
  minY = clamp(Math.floor(minY - padY), borderY, height - borderY);
  maxY = clamp(Math.ceil(maxY + padY), borderY, height - borderY);

  const dilated = new Uint8Array(width * height);
  for (let pass = 0; pass < 8; pass += 1) {
    const source = pass === 0 ? keep : dilated.slice();
    for (let y = Math.floor(minY); y <= maxY; y += 1) {
      for (let x = Math.floor(minX); x <= maxX; x += 1) {
        const index = y * width + x;
        if (source[index]) {
          dilated[index] = 1;
          continue;
        }

        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            neighbors += source[ny * width + nx];
          }
        }
        if (neighbors >= 2) dilated[index] = 1;
      }
    }
  }

  const boxWidth = Math.max(1, maxX - minX);
  const boxHeight = Math.max(1, maxY - minY);
  for (let y = Math.floor(minY); y <= maxY; y += 1) {
    for (let x = Math.floor(minX); x <= maxX; x += 1) {
      const normalizedX = (x - (minX + boxWidth / 2)) / (boxWidth / 2);
      const normalizedY = (y - (minY + boxHeight / 2)) / (boxHeight / 2);
      const ellipticalProductArea = normalizedX ** 2 * 0.72 + normalizedY ** 2 * 0.86 <= 1;
      const index = y * width + x;
      if (ellipticalProductArea && (dilated[index] || candidate[index] || edgeStrength[index] > 10)) {
        keep[index] = 1;
      }
    }
  }

  const isBackground = new Uint8Array(width * height);
  for (let index = 0; index < isBackground.length; index += 1) {
    isBackground[index] = keep[index] ? 0 : 1;
  }

  return isBackground;
}

function createBackgroundMask(data: Uint8ClampedArray, width: number, height: number) {
  const background = estimateBackgroundColor(data, width, height);
  const edgeStrength = computeEdgeStrength(data, width, height);
  const edgeBarrier = createEdgeBarrier(edgeStrength, width, height);
  const visited = new Uint8Array(width * height);
  const isBackground = new Uint8Array(width * height);
  const queue: number[] = [];
  let queueCursor = 0;

  const canBeBackground = (x: number, y: number) => {
    const maskIndex = y * width + x;
    const pixelIndex = getPixelIndex(x, y, width);
    if (data[pixelIndex + 3] < 20) return true;
    const distance = colorDistance(
      data[pixelIndex],
      data[pixelIndex + 1],
      data[pixelIndex + 2],
      background.r,
      background.g,
      background.b
    );

    if (distance <= background.threshold * 0.62) return true;
    if (edgeBarrier[maskIndex] && distance > background.threshold * 0.62) return false;

    return distance <= background.threshold;
  };

  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const maskIndex = y * width + x;
    if (visited[maskIndex] || !canBeBackground(x, y)) return;
    visited[maskIndex] = 1;
    isBackground[maskIndex] = 1;
    queue.push(maskIndex);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queueCursor < queue.length) {
    const maskIndex = queue[queueCursor];
    queueCursor += 1;
    const x = maskIndex % width;
    const y = Math.floor(maskIndex / width);

    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  return { isBackground, background, edgeStrength };
}

function softenCutoutEdges(
  data: Uint8ClampedArray,
  isBackground: Uint8Array,
  edgeStrength: Uint8Array,
  width: number,
  height: number
) {
  const alpha = new Uint8ClampedArray(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const maskIndex = y * width + x;
      if (isBackground[maskIndex]) {
        alpha[maskIndex] = 0;
        continue;
      }

      let neighboringBackground = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          neighboringBackground += isBackground[ny * width + nx];
        }
      }

      if (neighboringBackground > 0) {
        alpha[maskIndex] = edgeStrength[maskIndex] > 10 ? 255 : 246;
      } else {
        alpha[maskIndex] = 255;
      }
    }
  }

  for (let index = 0; index < alpha.length; index += 1) {
    data[index * 4 + 3] = alpha[index];
  }
}

function removeTextLikeForegroundComponents(
  isBackground: Uint8Array,
  edgeStrength: Uint8Array,
  width: number,
  height: number
) {
  const refinedMask = new Uint8Array(isBackground);
  const visited = new Uint8Array(width * height);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxCenterDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
  const totalPixels = width * height;

  const components: Array<{
    pixels: number[];
    area: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    fillRatio: number;
    centerScore: number;
    edgeAverage: number;
  }> = [];

  const queue: number[] = [];
  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const index = y * width + x;
    if (visited[index] || isBackground[index]) return false;
    visited[index] = 1;
    queue.push(index);
    return true;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const startIndex = y * width + x;
      if (visited[startIndex] || isBackground[startIndex]) continue;

      queue.length = 0;
      enqueue(x, y);
      let cursor = 0;
      const pixels: number[] = [];
      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;
      let sumX = 0;
      let sumY = 0;
      let edgeTotal = 0;

      while (cursor < queue.length) {
        const index = queue[cursor];
        cursor += 1;
        pixels.push(index);
        const px = index % width;
        const py = Math.floor(index / width);
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
        sumX += px;
        sumY += py;
        edgeTotal += edgeStrength[index];

        enqueue(px + 1, py);
        enqueue(px - 1, py);
        enqueue(px, py + 1);
        enqueue(px, py - 1);
      }

      const area = pixels.length;
      const boxWidth = maxX - minX + 1;
      const boxHeight = maxY - minY + 1;
      const fillRatio = area / Math.max(1, boxWidth * boxHeight);
      const componentCenterX = sumX / area;
      const componentCenterY = sumY / area;
      const centerDistance =
        Math.sqrt((componentCenterX - centerX) ** 2 + (componentCenterY - centerY) ** 2) / maxCenterDistance;
      const centerScore = 1 - centerDistance;
      const edgeAverage = edgeTotal / area;

      components.push({ pixels, area, minX, minY, maxX, maxY, fillRatio, centerScore, edgeAverage });
    }
  }

  if (components.length <= 1) return refinedMask;

  const primary = [...components].sort((a, b) => {
    const aScore = a.area * Math.max(0.35, a.centerScore);
    const bScore = b.area * Math.max(0.35, b.centerScore);
    return bScore - aScore;
  })[0];

  const primaryPaddingX = Math.max(24, (primary.maxX - primary.minX) * 0.18);
  const primaryPaddingY = Math.max(24, (primary.maxY - primary.minY) * 0.18);
  const primaryRegion = {
    minX: primary.minX - primaryPaddingX,
    minY: primary.minY - primaryPaddingY,
    maxX: primary.maxX + primaryPaddingX,
    maxY: primary.maxY + primaryPaddingY
  };

  for (const component of components) {
    if (component === primary) continue;

    const boxWidth = component.maxX - component.minX + 1;
    const boxHeight = component.maxY - component.minY + 1;
    const aspect = boxWidth / Math.max(1, boxHeight);
    const areaRatio = component.area / totalPixels;
    const overlapsPrimary =
      component.maxX >= primaryRegion.minX &&
      component.minX <= primaryRegion.maxX &&
      component.maxY >= primaryRegion.minY &&
      component.minY <= primaryRegion.maxY;
    const thinOrSparse = aspect > 3.2 || aspect < 0.32 || component.fillRatio < 0.42;
    const smallTextStroke = component.area < Math.max(160, totalPixels * 0.006) && component.edgeAverage > 12;
    const labelLikeBlock =
      component.area < totalPixels * 0.025 &&
      boxWidth < width * 0.42 &&
      boxHeight < height * 0.16 &&
      (thinOrSparse || component.edgeAverage > 18);
    const farDecorativeText =
      !overlapsPrimary && component.area < totalPixels * 0.055 && (thinOrSparse || component.centerScore < 0.74);

    if (smallTextStroke || labelLikeBlock || farDecorativeText || (areaRatio < 0.0035 && !overlapsPrimary)) {
      for (const pixel of component.pixels) {
        refinedMask[pixel] = 1;
      }
    }
  }

  return refinedMask;
}

function findForegroundBounds(data: Uint8ClampedArray, width: number, height: number) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let count = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[getPixelIndex(x, y, width) + 3];
      if (alpha < 32) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      count += 1;
    }
  }

  if (count === 0) {
    return { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1, count };
  }

  return { minX, minY, maxX, maxY, count };
}

export async function segmentProductSubject(imageDataUrl: string): Promise<SegmentationResult> {
  await delay(500);

  const image = await loadImage(imageDataUrl);
  const sourceCanvas = document.createElement("canvas");
  const maxSide = 900;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  sourceCanvas.width = Math.max(1, Math.round(image.width * scale));
  sourceCanvas.height = Math.max(1, Math.round(image.height * scale));

  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) {
    throw new Error("当前浏览器不支持 Canvas 抠图预览");
  }

  sourceContext.drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);

  const imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const { isBackground, background, edgeStrength } = createBackgroundMask(
    imageData.data,
    sourceCanvas.width,
    sourceCanvas.height
  );

  const initialForeground = isBackground.reduce((total, value) => total + (value ? 0 : 1), 0);
  const initialForegroundRatio = initialForeground / (sourceCanvas.width * sourceCanvas.height);
  const workingBackgroundMask =
    initialForegroundRatio > 0.58
      ? createFallbackSubjectMask(imageData.data, edgeStrength, sourceCanvas.width, sourceCanvas.height, background)
      : isBackground;
  const textCleanedBackgroundMask = removeTextLikeForegroundComponents(
    workingBackgroundMask,
    edgeStrength,
    sourceCanvas.width,
    sourceCanvas.height
  );

  softenCutoutEdges(imageData.data, textCleanedBackgroundMask, edgeStrength, sourceCanvas.width, sourceCanvas.height);
  sourceContext.putImageData(imageData, 0, 0);

  const bounds = findForegroundBounds(imageData.data, sourceCanvas.width, sourceCanvas.height);
  const outputCanvas = document.createElement("canvas");
  const outputSize = 1024;
  outputCanvas.width = outputSize;
  outputCanvas.height = outputSize;
  const outputContext = outputCanvas.getContext("2d");

  if (!outputContext) {
    throw new Error("当前浏览器不支持 Canvas 抠图输出");
  }

  outputContext.clearRect(0, 0, outputSize, outputSize);

  const padding = 28;
  const cropX = Math.max(0, bounds.minX - padding);
  const cropY = Math.max(0, bounds.minY - padding);
  const cropWidth = Math.min(sourceCanvas.width - cropX, bounds.maxX - bounds.minX + padding * 2);
  const cropHeight = Math.min(sourceCanvas.height - cropY, bounds.maxY - bounds.minY + padding * 2);
  const drawScale = Math.min((outputSize * 0.82) / cropWidth, (outputSize * 0.82) / cropHeight);
  const drawWidth = cropWidth * drawScale;
  const drawHeight = cropHeight * drawScale;
  const drawX = (outputSize - drawWidth) / 2;
  const drawY = (outputSize - drawHeight) / 2;

  outputContext.drawImage(sourceCanvas, cropX, cropY, cropWidth, cropHeight, drawX, drawY, drawWidth, drawHeight);

  const totalPixels = sourceCanvas.width * sourceCanvas.height;
  const foregroundRatio = bounds.count / totalPixels;
  const confidence = clamp(0.64 + (1 - Math.abs(foregroundRatio - 0.34)) * 0.22, 0.62, 0.91);

  return {
    cutoutDataUrl: outputCanvas.toDataURL("image/png"),
    confidence,
    notes:
      initialForegroundRatio > 0.58
        ? "检测到普通背景移除会保留过多原图内容，已切换为中心主体显著性兜底模式，并过滤疑似广告文字、标签和边缘装饰。复杂背景或主体贴边时建议后续替换为真实主体分割 API。"
        : "已使用浏览器端 mock 抠图移除与图片边缘相连的近似背景，并过滤疑似文字标签，仅保留商品主体。复杂背景、白色商品或商品贴边时建议后续替换为真实主体分割 API。"
  };
}
