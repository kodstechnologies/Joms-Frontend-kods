import { useState } from "react";
import { SettingsSectionCard } from "./settings-section-card";
import { SettingsToggleRow } from "./settings-toggle-row";

const selectClass =
  "w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white focus:outline-none";

type GeneralSettingsCardProps = {
  onOpenPolicyManagement: () => void;
};

export function GeneralSettingsCard({
  onOpenPolicyManagement,
}: GeneralSettingsCardProps) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <SettingsSectionCard
      title="General Settings"
      description="Configure system behavior and maintenance options"
    >
      {/* Auto Refresh & Export Format */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Auto-Refresh Interval
          </label>

          <select className={selectClass}>
            <option>30 Seconds</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Default Export Format
          </label>

          <select className={selectClass}>
            <option>CSV</option>
          </select>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="mt-6 rounded-lg border border-white/10 bg-black px-5">
        <SettingsToggleRow
          label="Maintenance Mode"
          description="Enable or disable system maintenance mode"
          checked={maintenanceMode}
          onChange={setMaintenanceMode}
        />
      </div>

      {/* Custom Error Message */}
      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-white">
          Custom Error Messages
        </label>

        <div className="flex gap-6">
          <textarea
            rows={2}
            className="w-[480px] rounded-lg border border-white/10 bg-black px-4 py-3 text-white"
            defaultValue="System maintenance in progress. We'll be back shortly."
          />

          <button className="h-10 rounded-lg bg-[#EAB96F] px-6 text-sm font-medium text-black">
            Choose Template
          </button>
        </div>
      </div>

      {/* Support Details */}
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Support Email
          </label>

          <input
            type="email"
            placeholder="support@joms.com"
            className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Support Phone Number
          </label>

          <input
            type="text"
            placeholder="+91 1234567890"
            className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Policy Management */}
      <div className="mt-6">
        <label className="mb-3 block text-sm font-medium text-white">
          Policy Management
        </label>

        <div className="flex gap-6">
          {/* User Policy */}
          <div className="flex w-[420px] items-center justify-between rounded-lg border border-white/10 bg-black px-4 py-3">
            <span className="flex-1 whitespace-nowrap text-sm font-medium text-white">
              User Application Policy
            </span>

            <button
              className="rounded-md bg-[#EAB96F] px-5 py-2 text-black"
              onClick={onOpenPolicyManagement}
            >
              View
            </button>
          </div>

          {/* Expert Policy */}
          <div className="flex w-[420px] items-center justify-between rounded-lg border border-white/10 bg-black px-4 py-3">
            <span className="flex-1 whitespace-nowrap text-sm font-medium text-white">
              Expert Application Policy
            </span>

            <button
              className="rounded-md bg-[#EAB96F] px-5 py-2 text-black"
              onClick={onOpenPolicyManagement}
            >
              View
            </button>
          </div>
        </div>
      </div>
    </SettingsSectionCard>
  );
}