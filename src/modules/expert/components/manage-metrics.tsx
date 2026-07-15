import { ArrowLeft, GripVertical, Plus, Search, X } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

type ListItem = {
  label: string
  type: string
}

type AvailableItem = {
  title: string
  description: string
}

export type ManageMetricsProps = {
  moduleName?: string
  onBack?: () => void
  onCancel?: () => void
  onSave?: () => void
  className?: string
}

const ACTIVE_METRICS: ListItem[] = [
  { label: 'Total Users', type: 'Count' },
  { label: 'Active Sessions', type: 'Count' },
  { label: 'Conversion Rate', type: 'Percentage' },
  { label: 'Avg. Response Time', type: 'Average' },
  { label: 'Total Revenue', type: 'Count' },
]

const AVAILABLE_METRICS: AvailableItem[] = [
  { title: 'Customer Satisfaction', description: 'Overall customer satisfaction score' },
  { title: 'Pending Tasks', description: 'Number of pending tasks' },
  { title: 'Avg. Order Value', description: 'Average order value' },
]

const VISIBLE_COLUMNS: ListItem[] = [
  { label: 'User Name', type: 'Text' },
  { label: 'Email', type: 'Text' },
  { label: 'Status', type: 'Status' },
  { label: 'Created Date', type: 'Date' },
  { label: 'Last Login', type: 'Date' },
]

const HIDDEN_COLUMNS: AvailableItem[] = [
  { title: 'Role', description: "User's role" },
  { title: 'Department', description: 'Department that the user belongs to' },
  { title: 'Phone number', description: "User's phone number" },
]

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="bg-brand-accent/10 text-brand-accent rounded px-2 py-0.5 text-[10px] font-semibold">
      {type}
    </span>
  )
}

function DraggableItem({ label, type, removable }: ListItem & { removable?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-3 transition-colors hover:border-white/10 hover:bg-white/[0.05]">
      <GripVertical className="size-4 shrink-0 cursor-grab text-slate-500" aria-hidden="true" />
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <span className="ml-auto flex items-center gap-2">
        <TypeBadge type={type} />
        {removable ? (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            className="grid size-6 place-items-center rounded-md text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </span>
    </div>
  )
}

function AvailableCard({ title, description }: AvailableItem) {
  return (
    <div className="hover:border-brand-accent/30 flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-colors hover:bg-white/[0.05]">
      <GripVertical className="size-4 shrink-0 cursor-grab text-slate-500" aria-hidden="true" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-200">{title}</p>
        <p className="truncate text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        aria-label={`Add ${title}`}
        className="text-brand-accent hover:bg-brand-accent hover:text-brand-text-dark ml-auto grid size-7 shrink-0 place-items-center rounded-md bg-white/5 transition-colors"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function ResetButton() {
  return (
    <button
      type="button"
      className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-white/10"
    >
      Reset to Default
    </button>
  )
}

function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative">
      <Search
        className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      />
      <Input placeholder={placeholder} aria-label={placeholder} className="h-10 pl-9 text-sm" />
    </div>
  )
}

export function ManageMetrics({
  moduleName = 'Module Name',
  onBack,
  onCancel,
  onSave,
  className,
}: ManageMetricsProps) {
  return (
    <div className={cn('flex flex-col gap-6 pb-24', className)}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/20 hover:bg-white/10"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Manage Metrics</h1>
          <p className="text-xs text-slate-500">
            {moduleName} <span className="text-slate-600">/</span> Manage Metrics
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-100">Dashboard</p>
          <ResetButton />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-200">Active Metrics</p>
            <p className="mb-3 text-xs text-slate-500">Showing {ACTIVE_METRICS.length} metrics</p>
            <div className="space-y-2">
              {ACTIVE_METRICS.map((item) => (
                <DraggableItem key={item.label} {...item} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">Available Metrics</p>
            <p className="mb-3 text-xs text-slate-500">Predefined metrics ready to add</p>
            <div className="space-y-3">
              <SearchField placeholder="Search Metrics" />
              <div className="space-y-2">
                {AVAILABLE_METRICS.map((item) => (
                  <AvailableCard key={item.title} {...item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-100">Table Columns</p>
          <ResetButton />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-200">Visible Columns</p>
            <p className="mb-3 text-xs text-slate-500">Currently shown in table</p>
            <div className="space-y-2">
              {VISIBLE_COLUMNS.map((item) => (
                <DraggableItem key={item.label} {...item} removable />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">Hidden Columns</p>
            <p className="mb-3 text-xs text-slate-500">Available to add to table</p>
            <div className="space-y-3">
              <SearchField placeholder="Search Columns" />
              <div className="space-y-2">
                {HIDDEN_COLUMNS.map((item) => (
                  <AvailableCard key={item.title} {...item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-end gap-3 border-t border-white/10 bg-[#0b0e13]/95 px-4 py-3 backdrop-blur sm:px-6">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>Save Changes</Button>
      </div>
    </div>
  )
}
