import { AlertCircle, Info } from 'lucide-react'

import { SettingsToggle } from './settings-toggle-row'
import { cn } from '@/shared/lib/cn'

type NotificationItem = {
  key: string
  label: string
  description: string
}

type NotificationGroupCardProps = {
  title: string
  tone: 'general' | 'timeSensitive' | 'critical' | 'adminPanel'
  items: NotificationItem[]
  values: Record<string, boolean>
  onChange: (key: string, checked: boolean) => void
}

export function NotificationGroupCard({
  title,
  tone,
  items,
  values,
  onChange,
}: NotificationGroupCardProps) {
  const enabledCount = items.filter((item) => values[item.key]).length
  const Icon = tone === 'general' ? Info : AlertCircle

  return (
    <section className={cn('notif-group-card', `is-${tone}`)}>
      <div className="notif-group-header">
        <div className="notif-group-header-left">
          <span className="notif-group-icon" aria-hidden="true">
            <Icon className="notif-group-icon-svg" />
          </span>
          <h3 className="notif-group-title">{title}</h3>
        </div>
        <span className="notif-group-count">
          {enabledCount} of {items.length} Enabled
        </span>
      </div>

      <div className="notif-group-body">
        {items.map((item) => (
          <div key={item.key} className="notif-toggle-row">
            <div className="notif-toggle-copy">
              <p className="notif-toggle-label">{item.label}</p>
              <p className="notif-toggle-desc">{item.description}</p>
            </div>
            <SettingsToggle
              checked={values[item.key] ?? false}
              onChange={(checked) => onChange(item.key, checked)}
              ariaLabel={item.label}
              showCaption={false}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
