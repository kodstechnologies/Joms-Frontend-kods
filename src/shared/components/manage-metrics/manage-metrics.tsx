import { useMemo, useState } from 'react'
import { ArrowLeft, GripVertical, Plus, Search, X } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

export type ManageMetricsListItem = {
  id: string
  label: string
  type: string
  description?: string
}

export type ManageMetricsAvailableItem = {
  id: string
  title: string
  description: string
  type?: string
}

export type ManageMetricsSavePayload = {
  activeMetricIds?: string[]
  visibleColumnIds?: string[]
}

export type ManageMetricsDashboardConfig = {
  active: ManageMetricsListItem[]
  available: ManageMetricsAvailableItem[]
  onReset?: () => void
}

export type ManageMetricsTableColumnsConfig = {
  visible: ManageMetricsListItem[]
  hidden: ManageMetricsAvailableItem[]
  onReset?: () => void
}

export type ManageMetricsProps = {
  moduleName: string
  onBack?: () => void
  onCancel?: () => void
  onSave?: (payload: ManageMetricsSavePayload) => void
  className?: string
  dashboard?: ManageMetricsDashboardConfig
  tableColumns?: ManageMetricsTableColumnsConfig
  isSaving?: boolean
  isLoading?: boolean
  loadingLabel?: string
}

const EMPTY_LIST_ITEMS: ManageMetricsListItem[] = []
const EMPTY_AVAILABLE_ITEMS: ManageMetricsAvailableItem[] = []

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="bg-brand-accent/10 text-brand-accent text-body-sm-semibold rounded px-2 py-0.5">
      {type}
    </span>
  )
}

function DraggableItem({
  label,
  type,
  removable,
  onRemove,
}: ManageMetricsListItem & { removable?: boolean; onRemove?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-3 transition-colors hover:border-white/10 hover:bg-white/[0.05]">
      <GripVertical className="text-muted size-4 shrink-0 cursor-grab" aria-hidden="true" />
      <span className="text-body-md-medium text-brand-text">{label}</span>
      <span className="ml-auto flex items-center gap-2">
        <TypeBadge type={type} />
        {removable ? (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            onClick={onRemove}
            className="text-muted hover:text-brand-text grid size-6 place-items-center rounded-md transition-colors hover:bg-white/10"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </span>
    </div>
  )
}

function AvailableCard({
  title,
  description,
  onAdd,
}: ManageMetricsAvailableItem & { onAdd?: () => void }) {
  return (
    <div className="hover:border-brand-accent/30 flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-colors hover:bg-white/[0.05]">
      <GripVertical className="text-muted size-4 shrink-0 cursor-grab" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-body-md-medium text-brand-text truncate">{title}</p>
        <p className="text-body-sm text-muted truncate">{description}</p>
      </div>
      <button
        type="button"
        aria-label={`Add ${title}`}
        onClick={onAdd}
        className="text-brand-accent hover:bg-brand-accent hover:text-brand-text-dark ml-auto grid size-7 shrink-0 place-items-center rounded-md bg-white/5 transition-colors"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function ResetButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-body-sm-semibold text-brand-text/80 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 transition-colors hover:border-white/20 hover:bg-white/10"
    >
      Reset to Default
    </button>
  )
}

function SearchField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <Search
        className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 pl-9 text-sm"
      />
    </div>
  )
}

function toAvailableItem(item: ManageMetricsListItem): ManageMetricsAvailableItem {
  return {
    id: item.id,
    title: item.label,
    description: item.description || `${item.type} item`,
    type: item.type,
  }
}

function toListItem(item: ManageMetricsAvailableItem): ManageMetricsListItem {
  return {
    id: item.id,
    label: item.title,
    type: item.type || 'Text',
    description: item.description,
  }
}

export function ManageMetrics({
  moduleName,
  onBack,
  onCancel,
  onSave,
  className,
  dashboard,
  tableColumns,
  isSaving = false,
  isLoading = false,
  loadingLabel = 'Loading preferences…',
}: ManageMetricsProps) {
  const dashboardActive = dashboard?.active ?? EMPTY_LIST_ITEMS
  const dashboardAvailable = dashboard?.available ?? EMPTY_AVAILABLE_ITEMS
  const tableVisible = tableColumns?.visible ?? EMPTY_LIST_ITEMS
  const tableHidden = tableColumns?.hidden ?? EMPTY_AVAILABLE_ITEMS

  const [localActiveMetrics, setLocalActiveMetrics] = useState(dashboardActive)
  const [localAvailableMetrics, setLocalAvailableMetrics] = useState(dashboardAvailable)
  const [localVisibleColumns, setLocalVisibleColumns] = useState(tableVisible)
  const [localHiddenColumns, setLocalHiddenColumns] = useState(tableHidden)
  const [metricSearch, setMetricSearch] = useState('')
  const [columnSearch, setColumnSearch] = useState('')
  const [sourceSnapshot, setSourceSnapshot] = useState({
    dashboardActive,
    dashboardAvailable,
    tableVisible,
    tableHidden,
  })

  if (
    dashboardActive !== sourceSnapshot.dashboardActive ||
    dashboardAvailable !== sourceSnapshot.dashboardAvailable ||
    tableVisible !== sourceSnapshot.tableVisible ||
    tableHidden !== sourceSnapshot.tableHidden
  ) {
    setSourceSnapshot({
      dashboardActive,
      dashboardAvailable,
      tableVisible,
      tableHidden,
    })
    setLocalActiveMetrics(dashboardActive)
    setLocalAvailableMetrics(dashboardAvailable)
    setLocalVisibleColumns(tableVisible)
    setLocalHiddenColumns(tableHidden)
  }

  const filteredAvailableMetrics = useMemo(() => {
    const query = metricSearch.trim().toLowerCase()
    if (!query) return localAvailableMetrics
    return localAvailableMetrics.filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    )
  }, [localAvailableMetrics, metricSearch])

  const filteredHiddenColumns = useMemo(() => {
    const query = columnSearch.trim().toLowerCase()
    if (!query) return localHiddenColumns
    return localHiddenColumns.filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    )
  }, [columnSearch, localHiddenColumns])

  const handleRemoveMetric = (id: string) => {
    const item = localActiveMetrics.find((metric) => metric.id === id)
    if (!item || localActiveMetrics.length <= 1) return

    setLocalActiveMetrics((prev) => prev.filter((metric) => metric.id !== id))
    setLocalAvailableMetrics((prev) => [...prev, toAvailableItem(item)])
  }

  const handleAddMetric = (id: string) => {
    const item = localAvailableMetrics.find((metric) => metric.id === id)
    if (!item) return

    setLocalAvailableMetrics((prev) => prev.filter((metric) => metric.id !== id))
    setLocalActiveMetrics((prev) => [...prev, toListItem(item)])
  }

  const handleRemoveColumn = (id: string) => {
    const item = localVisibleColumns.find((column) => column.id === id)
    if (!item || localVisibleColumns.length <= 1) return

    setLocalVisibleColumns((prev) => prev.filter((column) => column.id !== id))
    setLocalHiddenColumns((prev) => [...prev, toAvailableItem(item)])
  }

  const handleAddColumn = (id: string) => {
    const item = localHiddenColumns.find((column) => column.id === id)
    if (!item) return

    setLocalHiddenColumns((prev) => prev.filter((column) => column.id !== id))
    setLocalVisibleColumns((prev) => [...prev, toListItem(item)])
  }

  const handleSave = () => {
    const payload: ManageMetricsSavePayload = {}

    if (dashboard) {
      payload.activeMetricIds = localActiveMetrics.map((item) => item.id)
    }

    if (tableColumns) {
      payload.visibleColumnIds = localVisibleColumns.map((item) => item.id)
    }

    onSave?.(payload)
  }

  if (isLoading) {
    return (
      <div className={cn('flex flex-col gap-6 pb-24', className)}>
        <div className="flex items-center gap-3">
          <div className="size-9 animate-pulse rounded-lg border border-white/10 bg-white/5" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-48 animate-pulse rounded bg-white/5" />
          </div>
        </div>

        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
            <div className="h-7 w-28 animate-pulse rounded-md bg-white/5" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`left-${index}`} className="h-12 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-10 animate-pulse rounded-lg bg-white/5" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`right-${index}`} className="h-12 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          </div>
        </section>

        <p className="sr-only">{loadingLabel}</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6 pb-24', className)}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="text-brand-text/80 grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:border-white/20 hover:bg-white/10"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-h3 text-brand-text">Manage Metrics</h1>
          <p className="text-body-sm text-muted">
            {moduleName} <span className="text-muted">/</span> Manage Metrics
          </p>
        </div>
      </div>

      {dashboard ? (
        <section className="radius-lg bg-brand-surface/50 border border-white/10 p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-body-md-semibold text-brand-text">Dashboard</p>
            <ResetButton onClick={dashboard.onReset} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="text-body-md-semibold text-brand-text">Active Metrics</p>
              <p className="text-body-sm text-muted mb-3">
                Showing {localActiveMetrics.length} metrics
              </p>
              <div className="space-y-2">
                {localActiveMetrics.length === 0 ? (
                  <p className="text-body-sm text-muted rounded-lg border border-dashed border-white/10 px-3 py-6 text-center">
                    No active metrics
                  </p>
                ) : (
                  localActiveMetrics.map((item) => (
                    <DraggableItem
                      key={item.id}
                      {...item}
                      removable
                      onRemove={() => handleRemoveMetric(item.id)}
                    />
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-body-md-semibold text-brand-text">Available Metrics</p>
              <p className="text-body-sm text-muted mb-3">Predefined metrics ready to add</p>
              <div className="space-y-3">
                <SearchField
                  placeholder="Search Metrics"
                  value={metricSearch}
                  onChange={setMetricSearch}
                />
                <div className="space-y-2">
                  {filteredAvailableMetrics.length === 0 ? (
                    <p className="text-body-sm text-muted rounded-lg border border-dashed border-white/10 px-3 py-6 text-center">
                      No available metrics
                    </p>
                  ) : (
                    filteredAvailableMetrics.map((item) => (
                      <AvailableCard
                        key={item.id}
                        {...item}
                        onAdd={() => handleAddMetric(item.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {tableColumns ? (
        <section className="radius-lg bg-brand-surface/50 border border-white/10 p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-body-md-semibold text-brand-text">Table Columns</p>
            <ResetButton onClick={tableColumns.onReset} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="text-body-md-semibold text-brand-text">Visible Columns</p>
              <p className="text-body-sm text-muted mb-3">Currently shown in table</p>
              <div className="space-y-2">
                {localVisibleColumns.length === 0 ? (
                  <p className="text-body-sm text-muted rounded-lg border border-dashed border-white/10 px-3 py-6 text-center">
                    No visible columns
                  </p>
                ) : (
                  localVisibleColumns.map((item) => (
                    <DraggableItem
                      key={item.id}
                      {...item}
                      removable
                      onRemove={() => handleRemoveColumn(item.id)}
                    />
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-body-md-semibold text-brand-text">Hidden Columns</p>
              <p className="text-body-sm text-muted mb-3">Available to add to table</p>
              <div className="space-y-3">
                <SearchField
                  placeholder="Search Columns"
                  value={columnSearch}
                  onChange={setColumnSearch}
                />
                <div className="space-y-2">
                  {filteredHiddenColumns.length === 0 ? (
                    <p className="text-body-sm text-muted rounded-lg border border-dashed border-white/10 px-3 py-6 text-center">
                      No hidden columns
                    </p>
                  ) : (
                    filteredHiddenColumns.map((item) => (
                      <AvailableCard
                        key={item.id}
                        {...item}
                        onAdd={() => handleAddColumn(item.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="bg-brand-bg/95 fixed inset-x-0 bottom-0 z-10 flex items-center justify-end gap-3 border-t border-white/10 px-4 py-3 backdrop-blur sm:px-6">
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving || (!dashboard && !tableColumns)}>
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
