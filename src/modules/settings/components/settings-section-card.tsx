import type { PropsWithChildren } from 'react'

import { cn } from '@/shared/lib/cn'

type SettingsSectionCardProps = PropsWithChildren<{
  title: string
  description?: string
  className?: string
}>

export function SettingsSectionCard({
  title,
  description,
  className,
  children,
}: SettingsSectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-white/10 bg-[#111111] p-5 sm:p-6',
        className,
      )}
    >
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description ? <p className="text-sm text-slate-400">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
