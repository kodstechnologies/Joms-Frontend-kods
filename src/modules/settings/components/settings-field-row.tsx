import type { ReactNode } from 'react'

type SettingsFieldRowProps = {
  label: string
  description?: string
  children: ReactNode
}

export function SettingsFieldRow({ label, description, children }: SettingsFieldRowProps) {
  return (
    <div className="grid gap-2 border-b border-white/5 py-3 last:border-b-0 sm:grid-cols-[1fr_220px] sm:items-center sm:gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      </div>
      <div className="w-full">{children}</div>
    </div>
  )
}

export const settingsControlClass =
  'h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/20'
