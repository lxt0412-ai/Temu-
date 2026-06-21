import { Scissors } from "lucide-react";
import type { ProcessingStatus, SegmentationResult, UploadedImage } from "../types";

interface ProductPreviewProps {
  productImage?: UploadedImage;
  result?: SegmentationResult;
  status: ProcessingStatus;
  onSegment: () => void;
}

const statusText: Record<ProcessingStatus, string> = {
  idle: "未上传",
  ready: "待处理",
  processing: "处理中",
  done: "已完成",
  error: "处理失败"
};

export function ProductPreview({ productImage, result, status, onSegment }: ProductPreviewProps) {
  const disabled = !productImage || status === "processing";

  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">商品主体抠图结果</h2>
          <p className="mt-1 text-sm text-ink/60">状态：{statusText[status]}</p>
        </div>
        <button
          type="button"
          onClick={onSegment}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white transition hover:bg-mint/90 disabled:cursor-not-allowed disabled:bg-ink/25"
        >
          <Scissors size={17} />
          {status === "processing" ? "抠图中" : "抠出商品主体"}
        </button>
      </div>

      <div className="checkerboard mt-4 flex min-h-[280px] items-center justify-center rounded-lg border border-line p-4">
        {result ? (
          <img
            src={result.cutoutDataUrl}
            alt="商品主体抠图结果"
            className="max-h-[300px] w-full object-contain"
          />
        ) : (
          <p className="max-w-[260px] text-center text-sm leading-6 text-ink/55">
            上传商品图后点击抠图，透明背景主体图会显示在这里。
          </p>
        )}
      </div>

      {result ? (
        <div className="mt-3 rounded-md bg-field p-3 text-sm leading-6 text-ink/70">
          置信度：{Math.round(result.confidence * 100)}%。{result.notes}
        </div>
      ) : null}
    </div>
  );
}
