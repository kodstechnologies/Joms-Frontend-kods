import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
} from "lucide-react";

type TimelineRowProps = {
  number: number;
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  author: string;
  version: string;
  changes: string;

  expanded: boolean;

  onToggle: () => void;

  onViewFullVersion: () => void;
};

export function TimelineRow({
  number,
  title,
  effectiveDate,
  lastUpdated,
  author,
  version,
  changes,
  expanded,
  onToggle,
  onViewFullVersion,
}: TimelineRowProps) {
  return (
    <div className="relative">
      {/* Timeline Number */}
      <div className="absolute -left-[72px] top-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#EAB96F] bg-[#1A1A1A] font-semibold text-white">
        {String(number).padStart(2, "0")}
      </div>

      {/* Card */}
      <div className="rounded-xl border border-white/10 bg-[#1A1A1A]">
        {/* Header */}
        <div className="flex items-start justify-between px-8 py-7">
          {/* Left */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-white" />

              <h3 className="font-semibold text-white">
                {title}
              </h3>

              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
                Active
              </span>

              <span className="rounded-full bg-[#EAB96F] px-3 py-1 text-xs font-semibold text-black">
                {version}
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-400">

              <div className="flex gap-10">

                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  Effective: {effectiveDate}
                </div>

                <div>
                  Last Updated: {lastUpdated}
                </div>

              </div>

              <div className="flex items-center gap-2">

                <User size={14} />

                {author}

              </div>

            </div>
          </div>

          {/* Right */}
          <button
            onClick={onToggle}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            {expanded ? "Collapse" : "Expand"}

            {expanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <>
            <div className="border-t border-white/10" />

           <div className="space-y-8 px-8 py-7">
              <div>
                <h4 className="mb-3 text-sm font-semibold text-white">
                  What was changed
                </h4>

                <div className="rounded-xl border border-white/10 bg-[#121212] p-4 text-sm text-slate-300">
                  {changes}
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  onClick={onViewFullVersion}
                  className="rounded-lg bg-[#EAB96F] px-6 py-3 text-sm font-semibold text-black"
                >
                  View Full Version
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}