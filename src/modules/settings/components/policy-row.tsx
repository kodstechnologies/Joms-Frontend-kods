import { CalendarDays, Eye, FileText, History } from "lucide-react";

type PolicyRowProps = {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  version: string;
  onOpenTimeline: () => void;
};

export function PolicyRow({
  title,
  effectiveDate,
  lastUpdated,
  version,
  onOpenTimeline,
}: PolicyRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-black px-6 py-5">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-white" />

          <h3 className="text-sm font-semibold text-white">
            {title}
          </h3>

          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] text-green-400">
            Active
          </span>

          <span className="rounded-full bg-[#EAB96F] px-2 py-0.5 text-[10px] font-semibold text-black">
            {version}
          </span>
        </div>

        <div className="flex items-center gap-8 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} />
            Effective: {effectiveDate}
          </div>

          <div>
            Last Updated: {lastUpdated}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-lg bg-[#232323] px-4 py-2 text-xs text-white transition hover:bg-[#2D2D2D]">
          View
          <Eye size={15} />
        </button>

        <button
          onClick={onOpenTimeline}
          className="flex items-center gap-2 rounded-lg bg-[#232323] px-4 py-2 text-xs text-white transition hover:bg-[#2D2D2D]"
        >
          View Timeline
          <Eye size={15} />
        </button>

        <button className="flex items-center gap-2 rounded-lg bg-[#232323] px-4 py-2 text-xs text-white transition hover:bg-[#2D2D2D]">
          Update
          <History size={15} />
        </button>
      </div>
    </div>
  );
}