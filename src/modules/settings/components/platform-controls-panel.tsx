import { useState } from "react";

import { ApplicationSettingsCard } from "./application-settings-card";
import { DisplayPreferencesCard } from "./display-preferences-card";
import { GeneralSettingsCard } from "./general-settings-card";
import { PolicyManagementPanel } from "./policy-management-panel";
import { PolicyTimelinePanel } from "./policy-timeline-panel";
import { PolicyDetailsPanel } from "./policy-details-panel";

export function PlatformControlsPanel() {
  const [showPolicyManagement, setShowPolicyManagement] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);

  if (showPolicyDetails) {
    return (
      <PolicyDetailsPanel
        onBack={() => {
          setShowPolicyDetails(false);
          setShowTimeline(true);
        }}
      />
    );
  }

  if (showTimeline) {
    return (
      <PolicyTimelinePanel
        onBack={() => {
          setShowTimeline(false);
          setShowPolicyManagement(true);
        }}
        onOpenPolicyDetails={() => setShowPolicyDetails(true)}
      />
    );
  }

  if (showPolicyManagement) {
    return (
      <PolicyManagementPanel
        onBack={() => setShowPolicyManagement(false)}
        onOpenTimeline={() => {
          setShowPolicyManagement(false);
          setShowTimeline(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <ApplicationSettingsCard />

      <DisplayPreferencesCard />

      <GeneralSettingsCard
        onOpenPolicyManagement={() => setShowPolicyManagement(true)}
      />
    </div>
  );
}