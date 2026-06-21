import { ImagePlus, RotateCcw, UploadCloud } from "lucide-react";
import type { ChangeEvent } from "react";
import type { UploadedImage } from "../types";

interface ImageUploaderProps {
  title: string;
  description: string;
  image?: UploadedImage;
  onImageSelected: (image: UploadedImage) => void;
  onReset: () => void;
}

export function ImageUploader({ title, description, image, onImageSelected, onReset }: ImageUploaderProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onImageSelected({
        file,
        dataUrl: String(reader.result)
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-ink/65">{description}</p>
        </div>
        {image ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-field text-ink transition hover:border-coral hover:text-coral"
            title="重新上传"
            aria-label="重新上传"
          >
            <RotateCcw size={17} />
          </button>
        ) : null}
      </div>

      <label className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line bg-field p-4 text-center transition hover:border-mint hover:bg-white">
        {image ? (
          <img
            src={image.dataUrl}
            alt={title}
            className="max-h-[280px] w-full rounded-md object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-ink/70">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-mint shadow-sm">
              <ImagePlus size={24} />
            </span>
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-medium text-white">
                <UploadCloud size={16} />
                选择图片
              </div>
              <p className="mt-3 text-xs text-ink/55">支持 PNG、JPG、WebP，本地预览不上传服务器</p>
            </div>
          </div>
        )}
        <input className="sr-only" type="file" accept="image/*" onChange={handleFileChange} />
      </label>
    </div>
  );
}
