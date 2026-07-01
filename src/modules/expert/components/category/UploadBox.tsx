import { useRef } from "react";
import { UploadCloud, X } from "lucide-react";

interface UploadBoxProps {
  preview?: string;
  onChange: (file: File | null) => void;
  label?: string;
  helperText?: string;
  showPreview?: boolean;
  disabled?: boolean;
}

const UploadBox = ({
  label,
  helperText,
  preview,
  onChange,
  disabled = false,
}: UploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    onChange(file);
  };

  const handleRemove = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onChange(null);
  };


  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-white">
            {label}
          </label>

          {helperText && (
            <span className="rounded bg-[#F2F2F2] px-2 py-1 text-[9px] text-black shadow">
              {helperText}
            </span>
          )}
        </div>
      )}

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
        className={`relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-[#090909] transition-colors ${disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer"
          } ${preview
            ? "border-[#16C15D]"
            : "border-[#444] hover:border-[#F5C16C]"
          }`}
      >
        {preview ? (
          <>
            <div className="h-full w-full overflow-hidden rounded-md">
              <img
                src={preview}
                alt="preview"
                className="h-full w-full rounded-md object-cover"
              />
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-2 top-2 z-50 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white shadow-lg"
              >
                <X
                  size={18}
                  strokeWidth={3}
                  className="text-red-600"
                />
              </button>
            )}
          </>
        ) : (
          <UploadCloud
            size={18}
            className="text-[#8B8B8B]"
          />
        )}
      </div>
    </div>
  );
};

export default UploadBox;