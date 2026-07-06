import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, CalendarDays, User } from "lucide-react";

type PolicyDetailsPanelProps = {
  onBack: () => void;
};

const policy = {
  title: "Terms & Condition",
  version: "V2.2",
  status: "Active",
  author: "John Deo (Super Admin)",
  effectiveDate: "01/01/2026",
  lastUpdated: "01/01/2026",

  changes:
    "Added GDPR compliance clauses, updated data retention policy from 12 months to 24 months, and clarified third-party data sharing rules.",

  content: `Once a service scope is agreed upon between a user and an expert, all communication and task execution should remain within the approved platform workflow.

Primary communication regarding scope clarification should remain between the user and expert using official platform messaging.

Experts are expected to deliver services only within the mutually accepted scope.

If a user repeatedly requests additional work outside the agreed scope without proper approval, the support team may intervene.

Platform administrators reserve the right to suspend accounts found violating these policies.`,
};

export function PolicyDetailsPanel({
  onBack,
}: PolicyDetailsPanelProps) {
  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <Button
          variant="secondary"
          onClick={onBack}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <div className="flex gap-3">

          <Button variant="secondary">
            Reset
          </Button>

          <Button variant="secondary">
            Save Draft
          </Button>

          <Button className="bg-[#EAB96F] text-black hover:bg-[#EAB96F]">
            Submit Changes
          </Button>

        </div>

      </div>

      {/* Main Card */}

      <div className="rounded-2xl border border-white/10 bg-[#181818] p-8">

        {/* Title */}

        <div className="mb-8 flex items-center gap-3">

          <h2 className="text-2xl font-semibold text-white">
            {policy.title}
          </h2>

          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
            {policy.status}
          </span>

          <span className="rounded-full bg-[#EAB96F] px-3 py-1 text-xs font-semibold text-black">
            {policy.version}
          </span>

        </div>

        {/* Info */}

        <div className="mb-8 grid grid-cols-3 gap-6">

          <div>

            <p className="mb-2 text-xs uppercase text-slate-500">
              Effective Date
            </p>

            <div className="flex items-center gap-2 text-white">

              <CalendarDays size={16} />

              {policy.effectiveDate}

            </div>

          </div>

          <div>

            <p className="mb-2 text-xs uppercase text-slate-500">
              Last Updated
            </p>

            <p className="text-white">
              {policy.lastUpdated}
            </p>

          </div>

          <div>

            <p className="mb-2 text-xs uppercase text-slate-500">
              Author
            </p>

            <div className="flex items-center gap-2 text-white">

              <User size={16} />

              {policy.author}

            </div>

          </div>

        </div>

        {/* What Changed */}

        <div className="mb-8">

          <h3 className="mb-3 text-sm font-semibold text-white">
            What was changed
          </h3>

          <textarea
            rows={4}
            defaultValue={policy.changes}
            className="w-full rounded-xl border border-white/10 bg-[#121212] p-4 text-sm text-white"
          />

        </div>

        {/* Policy */}

        <div>

          <h3 className="mb-3 text-sm font-semibold text-white">
            Policy Content
          </h3>

          <textarea
            rows={18}
            defaultValue={policy.content}
            className="w-full rounded-xl border border-white/10 bg-[#121212] p-5 text-sm leading-7 text-white"
          />

        </div>

      </div>

    </div>
  );
}