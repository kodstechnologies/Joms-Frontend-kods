import { Hourglass, Trash2 } from "lucide-react";

type SummaryCardProps = {
  title: string;
  value: string;
  color: "yellow" | "red";
  onClick?: () => void;
};

export function SummaryCard({
  title,
  value,
  color,
  onClick,
}: SummaryCardProps) {
  return (
    <div
    onClick={onClick}
      className={`flex h-11 items-center justify-center rounded-xl border ${
        color === "yellow"
          ? "border-[#E0B43A] bg-[#8B6811]"
          : "border-[#A71A1A] bg-[#861313]"
      }`}
    >
      <div className="flex items-center gap-2">
        {color === "yellow" ? (
          <Hourglass className="h-4 w-4 text-white" />
        ) : (
          <Trash2 className="h-4 w-4 text-white" />
        )}

        <span className="text-[13px] text-white">
          {title}
        </span>

        <span className="text-[13px] font-semibold text-white">
          {value}
        </span>
      </div>
    </div>
  );
}