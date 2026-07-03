import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import { cn } from "@/shared/lib/cn";

const REASON_OPTIONS = [
  { label: "[Reason]", value: "reason-1" },
  { label: "[Reason]", value: "reason-2" },
  { label: "[Reason]", value: "reason-3" },
  { label: "[Reason]", value: "reason-4" },
] as const;

export type PauseCategoryModalPayload = {
  reasons: string[];
  adminNotes: string;
};

type PauseCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: PauseCategoryModalPayload) => void;
  isSubmitting?: boolean;
};

export function PauseCategoryModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
}: PauseCategoryModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([
    "reason-1",
    "reason-2",
  ]);
  const [confirmed, setConfirmed] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (!open) return;

    setSelectedReasons(["reason-1", "reason-2"]);
    setConfirmed(false);
    setAdminNotes("");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const toggleReason = (value: string) => {
    setSelectedReasons((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const canSubmit =
    confirmed && adminNotes.trim().length > 0 && selectedReasons.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 px-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-category-modal-title"
        className="w-full max-w-[470px] overflow-hidden rounded-xl border border-[#242424] bg-[#181818] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0">
          <div className="flex items-center justify-between px-6 pb-4 pt-5">
            <h2
              id="pause-category-modal-title"
              className="font-sans text-[16px] font-semibold leading-5 tracking-normal text-white"
            >
              Pause Category
            </h2>
            <button
              type="button"
              aria-label="Close modal"
              onClick={onClose}
              className="text-white transition-opacity hover:opacity-70"
            >
              <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
          <div className="h-px w-full bg-[#2A2A2A]" />
        </div>

        <div className="px-6 pb-6 pt-5">
          <div className="flex flex-col items-center text-center">
            <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#3D2E14]">
              <AlertTriangle
                className="size-5 text-[#E8AC73]"
                aria-hidden="true"
              />
            </span>

            <p className="font-sans text-[14px] font-normal leading-5 tracking-normal text-white">
              Are you sure you want&nbsp;&nbsp;Pause this Category.
            </p>
            <p className="mt-1.5 font-sans text-[12px] font-normal leading-[17px] tracking-normal text-[#888888]">
              This will result in hiding this category from users.
            </p>
          </div>

          <div className="mt-5">
            <span className="mb-3 block font-sans text-[12px] font-normal leading-[17px] tracking-normal text-[#888888]">
              Reasons
            </span>

            <div className="flex flex-wrap gap-3">
              {REASON_OPTIONS.map((option) => {
                const isSelected = selectedReasons.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleReason(option.value)}
                    className={cn(
                      "rounded-lg px-4 py-2 font-sans text-[12px] font-normal leading-[17px] tracking-normal transition-colors",
                      isSelected
                        ? "bg-[#E8AC73] text-black"
                        : "border border-[#444444] bg-black text-white hover:border-[#666666]",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded-sm border border-white/80 bg-transparent accent-[#E8AC73]"
            />
            <span className="font-sans text-[12px] font-normal leading-[17px] tracking-normal text-white">
              I confirm the documents are not approved due to above reasons.
            </span>
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block font-sans text-[12px] font-normal leading-[17px] tracking-normal text-white">
              Admin notes <span className="text-red-500">*</span>
            </span>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              className="h-[72px] w-full resize-none overflow-hidden rounded-lg border border-[#2A2A2A] bg-black px-4 py-3 font-sans text-[12px] font-normal leading-[17px] tracking-normal text-white outline-none placeholder:text-[#666666] focus:border-[#444444]"
            />
          </label>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-[34px] w-full items-center justify-center rounded-lg border border-white/25 bg-transparent font-sans text-[12px] font-normal leading-[17px] tracking-normal text-white transition-colors hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit || isSubmitting}
              onClick={() =>
                onConfirm({
                  reasons: selectedReasons,
                  adminNotes: adminNotes.trim(),
                })
              }
              className="flex h-[34px] w-full items-center justify-center rounded-lg bg-[#E8AC73] font-sans text-[12px] font-normal leading-[17px] tracking-normal text-black transition-colors hover:bg-[#F0B87E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Disable Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
