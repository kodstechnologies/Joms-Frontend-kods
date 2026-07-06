import { SectionHeader } from "@/shared/components/dashboard/section-header";
import { toast } from "sonner";
import { PolicyManagementPanel} from "../components/policy-management-panel";

export function PolicyManagementPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        subtitle="Manage platform policies and legal documents"
        actions={[
          {
            label: "Settings Logs",
            onClick: () => toast.message("Coming soon"),
            variant: "secondary",
          },
        ]}
      />

      <PolicyManagementPanel/>
    </div>
  );
}