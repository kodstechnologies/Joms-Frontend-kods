import { Button } from '@/shared/components/ui/button'

type TicketFilterPanelProps = {
  onApply: () => void
  onClear: () => void
}

export function TicketFilterPanel({ onApply, onClear }: TicketFilterPanelProps) {
  return (
    <div className="space-y-4 border-b border-white/5 px-4 py-4">
      <FilterField label="Ticket Status" value="In-Progress" badge="warning" />
      <FilterField label="Module" value="Events" />
      <FilterField label="Priority" value="Medium" badge="warning" />
      <div className="flex gap-2 pt-1">
        <Button className="flex-1" onClick={onApply}>
          Apply Filters
        </Button>
        <Button variant="secondary" className="flex-1" onClick={onClear}>
          Clear All
        </Button>
      </div>
    </div>
  )
}

function FilterField({ label, value, badge }: { label: string; value: string; badge?: 'warning' }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-body-sm-semibold text-muted tracking-wide uppercase">{label}</span>
      <div className="radius-md bg-brand-surface flex h-10 items-center justify-between border border-white/10 px-3">
        <span
          className={
            badge === 'warning'
              ? 'text-body-sm-semibold border-brand-accent/30 bg-brand-accent/10 text-brand-accent rounded-full border px-2 py-0.5'
              : 'text-body-md text-brand-text'
          }
        >
          {value}
        </span>
        <span className="text-muted">▾</span>
      </div>
    </label>
  )
}
