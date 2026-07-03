import { useRef } from "react";
import { UploadCloud, X } from "lucide-react";

import InfoTooltip from "./InfoTooltip";
import { categoryFormTheme } from "./category-form.theme";

interface UploadBoxProps {
  preview?: string;
  onChange: (file: File | null) => void;
  label?: string;
  helperText?: string;
  placeholderText?: string;
  variant?: "default" | "compact";
  disabled?: boolean;
}

const UploadBox = ({
  label,
  helperText,
  placeholderText = "Upload here",
  preview,
  onChange,
  variant = "default",
  disabled = false,
}: UploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onChange(null);
  };

  const isCompact = variant === "compact";

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-white">{label}</label>
          {helperText ? <InfoTooltip text={helperText} /> : null}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        disabled={disabled}
        onChange={handleFile}
      />

      <div
        onClick={() => {
          if (!disabled) {
            inputRef.current?.click();
          }
        }}
        className={`relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors ${
          isCompact ? "h-11" : "h-[72px]"
        } ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-[#FFC16B]"
        } ${preview ? "border-[#FFC16B]/60" : "border-[#333333]"}`}
        style={{ backgroundColor: categoryFormTheme.uploadBg }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="h-full w-full object-cover"
            />

            {!disabled ? (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-1.5 top-1.5 z-10 grid size-6 place-items-center rounded-full bg-white shadow-md"
              >
                <X size={14} strokeWidth={3} className="text-red-600" />
              </button>
            ) : null}
          </>
        ) : (
          <div
            className={`flex items-center justify-center gap-2 text-[#888888] ${
              isCompact ? "px-2" : "flex-col gap-1"
            }`}
          >
            <UploadCloud
              size={isCompact ? 16 : 18}
              className="shrink-0"
              aria-hidden="true"
            />
            {!isCompact ? (
              <span className="text-[11px]">{placeholderText}</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadBox;
