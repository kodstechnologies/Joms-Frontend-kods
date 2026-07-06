import { SettingsSectionCard } from "./settings-section-card";

export function DisplayPreferencesCard() {
    return (
        <SettingsSectionCard
            title="Display Preferences"
            description="Customize display and localization settings"
        >
            <div className="grid grid-cols-2 gap-6">

                {/* Timezone */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                        Timezone
                    </label>

                    <select className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white">
                        <option>IST, +5:30, Kolkata, India</option>
                    </select>
                </div>

                {/* Date & Time Format */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                        Date & Time Format
                    </label>

                    <select className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white">
                        <option>DD/MM/YY</option>
                    </select>
                </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">

                {/* Default Currency */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                        Default Currency
                    </label>

                    <select className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white">
                        <option>$ USD</option>
                    </select>
                </div>

                {/* Language Settings */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                        Language Settings
                    </label>

                    <select className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white">
                        <option>English</option>
                    </select>
                </div>

            </div>
        </SettingsSectionCard>
    );
}