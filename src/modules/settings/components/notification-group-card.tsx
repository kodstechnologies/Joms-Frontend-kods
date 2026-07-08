import { AlertCircle, Info } from 'lucide-react'

import { SettingsToggleRow } from './settings-toggle-row'
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

const toneStyles = {
  general: {
    header: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    icon: 'text-emerald-400',
  },
  timeSensitive: {
    header: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    icon: 'text-amber-400',
  },
  critical: {
    header: 'bg-orange-500/10 border-orange-500/20 text-orange-300',
    icon: 'text-orange-400',
  },
  adminPanel: {
    header: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
    icon: 'text-rose-400',
  },
}

export function NotificationGroupCard({
  title,
  tone,
  items,
  values,
  onChange,
}: NotificationGroupCardProps) {
  const enabledCount = items.filter((item) => values[item.key]).length
  const styles = toneStyles[tone]
  const Icon = tone === 'general' ? Info : AlertCircle

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
      <div
        className={cn(
          'flex items-center justify-between border-b px-5 py-3',
          styles.header,
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('size-4', styles.icon)} />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <span className="text-xs font-medium">
          {enabledCount} of {items.length} Enabled
        </span>
      </div>
      <div className="px-5 py-2">
        {items.map((item) => (
          <SettingsToggleRow
            key={item.key}
            label={item.label}
            description={item.description}
            checked={values[item.key] ?? false}
            onChange={(checked) => onChange(item.key, checked)}
          />
        ))}
      </div>
    </section>
  )
}
