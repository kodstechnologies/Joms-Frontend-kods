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
    <section className={cn('settings-section-card', className)}>
      <div className="settings-section-card-header space-y-1">
        <h2 className="settings-section-card-title">{title}</h2>
        {description ? <p className="settings-section-description">{description}</p> : null}
      </div>
      <div className="settings-section-card-body">{children}</div>
    </section>
  )
}
