import { Upload } from "lucide-react";

type UploadBoxProps = {
  label?: string;
  onClick?: () => void;
};

export function UploadBox({
  label = "Upload",
  onClick,
}: UploadBoxProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-20 w-24 flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-[#0F0F0F] transition-colors hover:border-[#EAB96F] hover:bg-[#161616]"
    >
      <Upload className="mb-2 h-5 w-5 text-white" />
      <span className="text-xs text-white">{label}</span>
    </button>
  );
}