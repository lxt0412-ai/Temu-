# Temu 商品图安全生成工具 MVP

React + TypeScript + Vite + Tailwind 的前端 MVP，用于演示：

- 上传用户商品图并 mock 抠图
- 上传竞品图并 mock 视觉分析
- 生成 3 个原创合规商品图 Prompt 方案
- 运行合规风险检查
- 对每个方案单独 mock 生成图片

## 运行

```bash
npm install
npm run dev
```

默认地址：

```text
http://127.0.0.1:5173/
```

## 当前 AI Provider 模式

项目默认使用 mock，不需要 API Key。

复制环境变量示例：

```bash
cp .env.example .env
```

`.env.example`：

```env
VITE_AI_PROVIDER=mock
VITE_IMAGE_GENERATION_PROVIDER=mock
VITE_SEGMENTATION_PROVIDER=mock
VITE_VISION_PROVIDER=mock
```

页面顶部会显示：

- 当前模式：Mock / Real API
- 抠图 provider
- 视觉分析 provider
- 生图 provider

## Provider 接入位置

真实 API 接入已预留在：

```text
src/services/aiProviders/
  imageSegmentationProvider.ts
  visionAnalysisProvider.ts
  imageGenerationProvider.ts
```

### 商品主体抠图

文件：

```text
src/services/aiProviders/imageSegmentationProvider.ts
```

统一接口：

```ts
segmentProductSubject(file: File): Promise<SegmentedProductResult>
```

未来可接入：

- rembg
- Segment Anything
- Clipdrop Background Removal
- remove.bg
- Replicate segmentation model

### 竞品图视觉分析

文件：

```text
src/services/aiProviders/visionAnalysisProvider.ts
```

统一接口：

```ts
analyzeCompetitorImage(file: File): Promise<CompetitorAnalysis>
```

未来可接入：

- OpenAI vision model
- Gemini vision
- Claude vision
- Qwen-VL

### 商品图生成

文件：

```text
src/services/aiProviders/imageGenerationProvider.ts
```

统一接口：

```ts
generateProductImage({
  productCutout,
  positivePrompt,
  negativePrompt,
  aspectRatio
}): Promise<GeneratedImageResult>
```

未来可接入：

- OpenAI Images API
- Replicate
- ComfyUI
- Stable Diffusion
- Flux
- Midjourney API if available

## 从 Mock 切换到真实 API

1. 在 `.env` 中修改 provider：

```env
VITE_AI_PROVIDER=real
VITE_IMAGE_GENERATION_PROVIDER=openai
VITE_SEGMENTATION_PROVIDER=replicate
VITE_VISION_PROVIDER=openai
```

2. 在对应 provider 文件中替换 mock fallback 实现。

3. 保持页面和业务组件不变，只让 provider 返回现有统一类型。

当前项目不会在前端保存真实 API Key。接入真实商业 API 时，建议新增后端 API route 或 serverless function，由后端读取密钥并调用模型服务。
test deploy
