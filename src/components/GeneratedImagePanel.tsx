import { ImageIcon } from "lucide-react";
import type { GenerationResult } from "../types";

interface GeneratedImagePanelProps {
  result?: GenerationResult;
}

export function GeneratedImagePanel({ result }: GeneratedImagePanelProps) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2">
        <ImageIcon className="text-coral" size={20} />
        <h2 className="text-base font-semibold text-ink">生成图片预览</h2>
      </div>

      <div className="mt-4 flex aspect-square max-h-[520px] items-center justify-center overflow-hidden rounded-lg border border-line bg-[radial-gradient(circle_at_20%_20%,rgba(15,143,111,0.16),transparent_30%),linear-gradient(135deg,#fff,#f7f8f4_52%,#fff3ec)] p-6">
        {result ? (
          <img src={result.imageUrl} alt="Mock 生成商品图" className="max-h-full max-w-full object-contain" />
        ) : (
          <p className="max-w-[260px] text-center text-sm leading-6 text-ink/55">
            这里会展示 mock 生成结果。真实生图服务接入后会返回最终商品图。
          </p>
        )}
      </div>

      {result ? (
        <p className="mt-3 rounded-md bg-field p-3 text-sm leading-6 text-ink/70">
          服务：{result.provider}。{result.notes}
        </p>
      ) : null}
    </div>
  );
}
