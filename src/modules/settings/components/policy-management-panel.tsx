import { Button } from "@/shared/components/ui/button";
import { Upload } from "lucide-react";
import { PolicyRow } from "./policy-row";
import { SettingsSectionCard } from "./settings-section-card";

type PolicyManagementPanelProps = {
  onBack: () => void;
  onOpenTimeline: () => void;
};

const policies = [
  {
    id: 1,
    title: "Terms & Condition",
    effectiveDate: "01/01/2026",
    lastUpdated: "01/01/2026",
    version: "V2.2",
  },
  {
    id: 2,
    title: "Privacy Policy",
    effectiveDate: "01/01/2026",
    lastUpdated: "01/01/2026",
    version: "V2.2",
  },
  {
    id: 3,
    title: "Refund Policy",
    effectiveDate: "01/01/2026",
    lastUpdated: "01/01/2026",
    version: "V2.2",
  },
  {
    id: 4,
    title: "Non Disclosure Agreement",
    effectiveDate: "01/01/2026",
    lastUpdated: "01/01/2026",
    version: "V2.2",
  },
  {
    id: 5,
    title: "Cookie Policy",
    effectiveDate: "01/01/2026",
    lastUpdated: "01/01/2026",
    version: "V2.2",
  },
];

export function PolicyManagementPanel({
  onBack,
  onOpenTimeline,
}: PolicyManagementPanelProps) {
  return (
    <SettingsSectionCard
      title="Policy Management"
      description="Manage platform policies, terms, and legal documents"
    >
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={onBack}
        >
          Back
        </Button>

        <Button className="bg-[#EAB96F] text-black hover:bg-[#EAB96F]">
          <Upload className="mr-2 h-4 w-4" />
          Create New Policy
        </Button>
      </div>

      <div className="space-y-5">
        {policies.map((policy) => (
          <PolicyRow
            key={policy.id}
            title={policy.title}
            effectiveDate={policy.effectiveDate}
            lastUpdated={policy.lastUpdated}
            version={policy.version}
            onOpenTimeline={onOpenTimeline}
          />
        ))}
      </div>
    </SettingsSectionCard>
  );
}