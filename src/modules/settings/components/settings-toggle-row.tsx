import { cn } from '@/shared/lib/cn'

type SettingsToggleRowProps = {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  indented?: boolean
  boxed?: boolean
  showCaption?: boolean
  className?: string
}

export function SettingsToggle({
  checked,
  onChange,
  ariaLabel,
  showCaption = true,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  ariaLabel: string
  showCaption?: boolean
}) {
  return (
    <div className="settings-switch-wrap">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        onClick={() => onChange(!checked)}
        className={cn('settings-switch', checked && 'is-on')}
      >
        <span className="settings-switch-knob" />
      </button>
      {showCaption ? (
        <span className="settings-switch-caption">{checked ? 'ON' : 'OFF'}</span>
      ) : null}
    </div>
  )
}

export function SettingsToggleRow({
  label,
  description,
  checked,
  onChange,
  indented = false,
  boxed = false,
  showCaption = true,
  className,
}: SettingsToggleRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 sm:gap-4',
        boxed ? 'settings-maintenance-row' : 'border-b border-white/5 py-3.5 last:border-b-0',
        indented && 'ml-3 border-l border-white/10 pl-3 sm:ml-4 sm:pl-4',
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="settings-toggle-title">{label}</p>
        {description ? <p className="settings-toggle-description">{description}</p> : null}
      </div>
      <SettingsToggle
        checked={checked}
        onChange={onChange}
        ariaLabel={label}
        showCaption={showCaption}
      />
    </div>
  )
}
