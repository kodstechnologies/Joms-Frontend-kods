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

function FilterField({
  label,
  value,
  badge,
}: {
  label: string
  value: string
  badge?: 'warning'
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <div className="flex h-10 items-center justify-between rounded-lg border border-white/10 bg-[#1a1a1a] px-3">
        <span
          className={
            badge === 'warning'
              ? 'rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300'
              : 'text-sm text-white'
          }
        >
          {value}
        </span>
        <span className="text-slate-500">▾</span>
      </div>
    </label>
  )
}
