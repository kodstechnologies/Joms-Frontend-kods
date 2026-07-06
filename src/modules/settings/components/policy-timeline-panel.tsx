import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { TimelineRow } from "./timeline-row";

type PolicyTimelinePanelProps = {
    onBack: () => void;
    onOpenPolicyDetails: () => void;
};

const timelineData = [
    {
        id: 1,
        title: "Terms & Condition",
        effectiveDate: "01/01/2026",
        lastUpdated: "01/01/2026",
        author: "John Deo (Super Admin)",
        version: "V2.2",
        changes:
            "Added GDPR compliance clauses, updated data retention policy from 12 months to 24 months, and clarified third-party data sharing rules.",
    },
    {
        id: 2,
        title: "Terms & Condition",
        effectiveDate: "01/01/2026",
        lastUpdated: "01/01/2026",
        author: "John Deo (Super Admin)",
        version: "V2.2",
        changes:
            "Updated refund clauses and cancellation policy.",
    },
    {
        id: 3,
        title: "Terms & Condition",
        effectiveDate: "01/01/2026",
        lastUpdated: "01/01/2026",
        author: "John Deo (Super Admin)",
        version: "V2.2",
        changes:
            "Minor formatting and legal wording changes.",
    },
];

export function PolicyTimelinePanel({
  
    onOpenPolicyDetails,
}: PolicyTimelinePanelProps) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    return (
        <div className="space-y-8 px-8 py-6">
            {/* Banner */}
            <div className="mx-10 rounded-xl border border-[#EAB96F]/20 bg-[#1F1F1F] px-6 py-5">
                <div className="flex items-center">
                    <div className="mr-4 h-12 w-1 rounded-full bg-[#EAB96F]" />

                    <p className="text-sm text-white">
                        <span className="font-semibold">Super Admin View:</span> This
                        timeline shows the complete evolution of this policy, including all
                        versions, changes and user impact data.
                    </p>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-24 pt-4">
                <div className="absolute left-10 top-2 bottom-8 w-[2px] bg-white/20" />

                <div className="space-y-12">
                    {timelineData.map((item, index) => (
                        <TimelineRow
                            key={item.id}
                            number={index + 1}
                            title={item.title}
                            effectiveDate={item.effectiveDate}
                            lastUpdated={item.lastUpdated}
                            author={item.author}
                            version={item.version}
                            changes={item.changes}
                            expanded={expandedRow === index}
                            onToggle={() =>
                                setExpandedRow(expandedRow === index ? null : index)
                            }
                            onViewFullVersion={onOpenPolicyDetails}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
}