import { SettingsSectionCard } from './settings-section-card'
import { UploadBox } from "./upload-box";
export function ApplicationSettingsCard() {
  return (
    <SettingsSectionCard
      title="Application Settings"
      description="Configure basic application information"
    >
      <div className="space-y-6">

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Application Name
          </label>

          <input
            type="text"
            value="Web admin Panel"
            readOnly
            className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white"
          />
        </div>

        <div className="grid grid-cols-6 gap-8">

          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              Logo
            </label>

            <UploadBox />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-white">
              Favicon
            </label>

            <UploadBox />
          </div>

        </div>

      </div>
    </SettingsSectionCard>
  )
}