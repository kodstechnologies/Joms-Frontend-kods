import { cn } from '@/shared/lib/cn'

type SettingsToggleRowProps = {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  indented?: boolean
  className?: string
}

export function SettingsToggleRow({
  label,
  description,
  checked,
  onChange,
  indented = false,
  className,
}: SettingsToggleRowProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-white/5 py-3 last:border-b-0',
        indented && 'ml-4 border-l border-white/10 pl-4',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-emerald-500' : 'bg-white/15',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}
