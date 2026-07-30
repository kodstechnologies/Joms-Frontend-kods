import { useMemo, useRef, useState, type DragEvent, type ReactNode } from 'react'
import { ArrowLeft, GripVertical, Plus, Search, X } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
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
  maxActive?: number
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

type ZoneId = 'active-metrics' | 'available-metrics' | 'visible-columns' | 'hidden-columns'

type DragPayload = {
  id: string
  zone: ZoneId
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  Count: 'bg-[#F6CB86]/20 text-[#F6CB86]',
  Percentage: 'bg-[#E0A263]/35 text-[#F6CB86]',
  Average: 'bg-[#E0A263]/30 text-[#E0A263]',
  Currency: 'bg-[#F6CB86]/20 text-[#F6CB86]',
  Number: 'bg-[#F6CB86]/20 text-[#F6CB86]',
  Text: 'bg-[#F6CB86]/15 text-[#F6CB86]',
  Status: 'bg-[#E0A263]/30 text-[#F6CB86]',
  Date: 'bg-[#E0A263]/25 text-[#E0A263]',
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide',
        TYPE_BADGE_STYLES[type] ?? 'bg-[#F6CB86]/15 text-[#F6CB86]',
      )}
    >
      {type}
    </span>
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

function arrayMove<T>(list: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from === to) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function ResetButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-white/40 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/5"
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
        className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-white/40"
        aria-hidden="true"
      />
      <input
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[50px] w-full rounded-xl border-0 bg-[#141414] py-0 pr-4 pl-11 text-sm text-white outline-none placeholder:text-white/40 focus:ring-1 focus:ring-white/15"
      />
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
}

function MetricRow({
  item,
  zone,
  removable,
  onRemove,
  showDescription,
  draggingId,
  onDragStart,
  onDragOverItem,
  onDropOnItem,
}: {
  item: ManageMetricsListItem
  zone: ZoneId
  removable?: boolean
  onRemove?: () => void
  showDescription?: boolean
  draggingId: string | null
  onDragStart: (payload: DragPayload) => void
  onDragOverItem: (event: DragEvent, targetId: string, zone: ZoneId) => void
  onDropOnItem: (event: DragEvent, targetId: string, zone: ZoneId) => void
}) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        onDragStart({ id: item.id, zone })
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', item.id)
      }}
      onDragOver={(event) => onDragOverItem(event, item.id, zone)}
      onDrop={(event) => onDropOnItem(event, item.id, zone)}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-transparent bg-[#050505] px-3 py-3 transition-colors',
        draggingId === item.id && 'opacity-40',
        draggingId !== item.id && 'hover:border-[#F6CB86]/35',
      )}
    >
      <span
        className="shrink-0 cursor-grab text-white/40 hover:text-white active:cursor-grabbing"
        aria-hidden="true"
      >
        <GripVertical className="size-4" />
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <p className="min-w-0 shrink truncate text-base font-medium text-white">{item.label}</p>
        <TypeBadge type={item.type} />
      </div>

      {showDescription && item.description ? <p className="sr-only">{item.description}</p> : null}

      {removable ? (
        <button
          type="button"
          aria-label={`Remove ${item.label}`}
          onClick={onRemove}
          className="grid size-6 shrink-0 place-items-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

function AvailableRow({
  item,
  zone,
  onAdd,
  highlighted,
  draggingId,
  onDragStart,
  onDragOverItem,
  onDropOnItem,
}: {
  item: ManageMetricsAvailableItem
  zone: ZoneId
  onAdd?: () => void
  highlighted?: boolean
  draggingId: string | null
  onDragStart: (payload: DragPayload) => void
  onDragOverItem: (event: DragEvent, targetId: string, zone: ZoneId) => void
  onDropOnItem: (event: DragEvent, targetId: string, zone: ZoneId) => void
}) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        onDragStart({ id: item.id, zone })
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', item.id)
      }}
      onDragOver={(event) => onDragOverItem(event, item.id, zone)}
      onDrop={(event) => onDropOnItem(event, item.id, zone)}
      className={cn(
        'group rounded-brand-lg flex items-center gap-3 border bg-[#050505] px-3 py-3 transition-colors',
        highlighted || draggingId === item.id
          ? 'border-[#F6CB86]/70'
          : 'border-transparent hover:border-[#F6CB86]/40',
        draggingId === item.id && 'opacity-40',
      )}
    >
      <span
        className="shrink-0 cursor-grab text-white/40 hover:text-white active:cursor-grabbing"
        aria-hidden="true"
      >
        <GripVertical className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-white">{item.title}</p>
        <p className="truncate text-sm text-white/50">{item.description}</p>
      </div>

      <button
        type="button"
        aria-label={`Add ${item.title}`}
        onClick={onAdd}
        className={cn(
          'ml-auto grid size-7 shrink-0 place-items-center rounded-md transition-colors',
          highlighted
            ? 'bg-[#F6CB86] text-[#050505] hover:bg-[#E0A263]'
            : 'bg-[#F6CB86]/20 text-[#F6CB86] hover:bg-[#F6CB86] hover:text-[#050505]',
        )}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function DropZone({
  zone,
  isActive,
  onDragOverZone,
  onDropOnZone,
  children,
  className,
}: {
  zone: ZoneId
  isActive: boolean
  onDragOverZone: (event: DragEvent, zone: ZoneId) => void
  onDropOnZone: (event: DragEvent, zone: ZoneId) => void
  children: ReactNode
  className?: string
}) {
  return (
    <div
      onDragOver={(event) => onDragOverZone(event, zone)}
      onDrop={(event) => onDropOnZone(event, zone)}
      className={cn(
        'rounded-brand-lg flex flex-col gap-3 bg-[#141414] p-4 transition-colors',
        isActive && 'ring-1 ring-[#F6CB86]/40 ring-inset',
        className,
      )}
    >
      {children}
    </div>
  )
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
  const maxActive = dashboard?.maxActive ?? 8

  const [localActiveMetrics, setLocalActiveMetrics] = useState(dashboardActive)
  const [localAvailableMetrics, setLocalAvailableMetrics] = useState(dashboardAvailable)
  const [localVisibleColumns, setLocalVisibleColumns] = useState(tableVisible)
  const [localHiddenColumns, setLocalHiddenColumns] = useState(tableHidden)
  const [metricSearch, setMetricSearch] = useState('')
  const [columnSearch, setColumnSearch] = useState('')
  const [hoveredAvailableId, setHoveredAvailableId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<ZoneId | null>(null)
  const dragRef = useRef<DragPayload | null>(null)
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
    if (localActiveMetrics.length >= maxActive) return

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

  const isMetricPair = (from: ZoneId, to: ZoneId) =>
    (from === 'active-metrics' || from === 'available-metrics') &&
    (to === 'active-metrics' || to === 'available-metrics')

  const isColumnPair = (from: ZoneId, to: ZoneId) =>
    (from === 'visible-columns' || from === 'hidden-columns') &&
    (to === 'visible-columns' || to === 'hidden-columns')

  const moveItem = (from: ZoneId, to: ZoneId, itemId: string, overId?: string) => {
    if (!isMetricPair(from, to) && !isColumnPair(from, to)) return

    if (isMetricPair(from, to)) {
      if (from === to) {
        if (from === 'active-metrics') {
          setLocalActiveMetrics((prev) => {
            const oldIndex = prev.findIndex((item) => item.id === itemId)
            const newIndex = overId ? prev.findIndex((item) => item.id === overId) : prev.length - 1
            return arrayMove(prev, oldIndex, newIndex)
          })
        } else {
          setLocalAvailableMetrics((prev) => {
            const oldIndex = prev.findIndex((item) => item.id === itemId)
            const newIndex = overId ? prev.findIndex((item) => item.id === overId) : prev.length - 1
            return arrayMove(prev, oldIndex, newIndex)
          })
        }
        return
      }

      if (from === 'active-metrics' && to === 'available-metrics') {
        const item = localActiveMetrics.find((metric) => metric.id === itemId)
        if (!item || localActiveMetrics.length <= 1) return
        setLocalActiveMetrics((prev) => prev.filter((metric) => metric.id !== itemId))
        setLocalAvailableMetrics((prev) => {
          const next = [...prev, toAvailableItem(item)]
          if (!overId) return next
          const oldIndex = next.length - 1
          const newIndex = next.findIndex((entry) => entry.id === overId)
          return newIndex < 0 ? next : arrayMove(next, oldIndex, newIndex)
        })
        return
      }

      if (from === 'available-metrics' && to === 'active-metrics') {
        const item = localAvailableMetrics.find((metric) => metric.id === itemId)
        if (!item || localActiveMetrics.length >= maxActive) return
        setLocalAvailableMetrics((prev) => prev.filter((metric) => metric.id !== itemId))
        setLocalActiveMetrics((prev) => {
          const next = [...prev, toListItem(item)]
          if (!overId) return next
          const oldIndex = next.length - 1
          const newIndex = next.findIndex((entry) => entry.id === overId)
          return newIndex < 0 ? next : arrayMove(next, oldIndex, newIndex)
        })
      }
      return
    }

    if (from === to) {
      if (from === 'visible-columns') {
        setLocalVisibleColumns((prev) => {
          const oldIndex = prev.findIndex((item) => item.id === itemId)
          const newIndex = overId ? prev.findIndex((item) => item.id === overId) : prev.length - 1
          return arrayMove(prev, oldIndex, newIndex)
        })
      } else {
        setLocalHiddenColumns((prev) => {
          const oldIndex = prev.findIndex((item) => item.id === itemId)
          const newIndex = overId ? prev.findIndex((item) => item.id === overId) : prev.length - 1
          return arrayMove(prev, oldIndex, newIndex)
        })
      }
      return
    }

    if (from === 'visible-columns' && to === 'hidden-columns') {
      const item = localVisibleColumns.find((column) => column.id === itemId)
      if (!item || localVisibleColumns.length <= 1) return
      setLocalVisibleColumns((prev) => prev.filter((column) => column.id !== itemId))
      setLocalHiddenColumns((prev) => {
        const next = [...prev, toAvailableItem(item)]
        if (!overId) return next
        const oldIndex = next.length - 1
        const newIndex = next.findIndex((entry) => entry.id === overId)
        return newIndex < 0 ? next : arrayMove(next, oldIndex, newIndex)
      })
      return
    }

    if (from === 'hidden-columns' && to === 'visible-columns') {
      const item = localHiddenColumns.find((column) => column.id === itemId)
      if (!item) return
      setLocalHiddenColumns((prev) => prev.filter((column) => column.id !== itemId))
      setLocalVisibleColumns((prev) => {
        const next = [...prev, toListItem(item)]
        if (!overId) return next
        const oldIndex = next.length - 1
        const newIndex = next.findIndex((entry) => entry.id === overId)
        return newIndex < 0 ? next : arrayMove(next, oldIndex, newIndex)
      })
    }
  }

  const handleDragStart = (payload: DragPayload) => {
    dragRef.current = payload
    setDraggingId(payload.id)
  }

  const handleDragOverZone = (event: DragEvent, zone: ZoneId) => {
    event.preventDefault()
    setActiveDropZone(zone)
  }

  const handleDragOverItem = (event: DragEvent, _targetId: string, zone: ZoneId) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveDropZone(zone)
  }

  const clearDragState = () => {
    dragRef.current = null
    setDraggingId(null)
    setActiveDropZone(null)
  }

  const handleDropOnItem = (event: DragEvent, targetId: string, zone: ZoneId) => {
    event.preventDefault()
    event.stopPropagation()
    const drag = dragRef.current
    if (!drag) return
    moveItem(drag.zone, zone, drag.id, targetId === drag.id ? undefined : targetId)
    clearDragState()
  }

  const handleDropOnZone = (event: DragEvent, zone: ZoneId) => {
    event.preventDefault()
    const drag = dragRef.current
    if (!drag) return
    moveItem(drag.zone, zone, drag.id)
    clearDragState()
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
      <div className={cn('flex flex-col gap-6 bg-[#050505] pb-24', className)}>
        <div className="flex items-center gap-3">
          <div className="size-5 animate-pulse rounded bg-white/20" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-48 animate-pulse rounded bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`left-${index}`} className="h-12 animate-pulse rounded-xl bg-[#1A1A1A]" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-xl bg-[#1A1A1A]" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`right-${index}`} className="h-14 animate-pulse rounded-xl bg-[#1A1A1A]" />
            ))}
          </div>
        </div>
        <p className="sr-only">{loadingLabel}</p>
      </div>
    )
  }

  return (
    <div
      className={cn('flex flex-col gap-8 bg-[#050505] pb-24', className)}
      onDragEnd={clearDragState}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Metrics</h1>
          <p className="text-sm text-white/50">
            {moduleName} <span className="text-white/30">/</span> Manage Metrics
          </p>
        </div>
      </div>

      {dashboard ? (
        <section>
          <SectionHeader title="Dashboard" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <p className="text-base font-semibold text-white">Active Metrics</p>
              <p className="mb-3 text-sm text-white/50">
                Showing {localActiveMetrics.length} metrics
              </p>
              <DropZone
                zone="active-metrics"
                isActive={activeDropZone === 'active-metrics'}
                onDragOverZone={handleDragOverZone}
                onDropOnZone={handleDropOnZone}
              >
                {localActiveMetrics.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-sm text-white/40">
                    No active metrics — drag from Available
                  </p>
                ) : (
                  localActiveMetrics.map((item) => (
                    <MetricRow
                      key={item.id}
                      item={item}
                      zone="active-metrics"
                      removable
                      draggingId={draggingId}
                      onRemove={() => handleRemoveMetric(item.id)}
                      onDragStart={handleDragStart}
                      onDragOverItem={handleDragOverItem}
                      onDropOnItem={handleDropOnItem}
                    />
                  ))
                )}
              </DropZone>
            </div>

            <div>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">Available Metrics</p>
                  <p className="text-sm text-white/50">Predefined metrics ready to add</p>
                </div>
                <ResetButton onClick={dashboard.onReset} />
              </div>
              <div className="space-y-3">
                <SearchField
                  placeholder="Search Metrics"
                  value={metricSearch}
                  onChange={setMetricSearch}
                />
                <DropZone
                  zone="available-metrics"
                  isActive={activeDropZone === 'available-metrics'}
                  onDragOverZone={handleDragOverZone}
                  onDropOnZone={handleDropOnZone}
                  className="min-h-[340px] pb-28"
                >
                  {filteredAvailableMetrics.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-sm text-white/40">
                      No available metrics
                    </p>
                  ) : (
                    filteredAvailableMetrics.map((item) => (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredAvailableId(item.id)}
                        onMouseLeave={() =>
                          setHoveredAvailableId((current) => (current === item.id ? null : current))
                        }
                      >
                        <AvailableRow
                          item={item}
                          zone="available-metrics"
                          highlighted={hoveredAvailableId === item.id}
                          draggingId={draggingId}
                          onAdd={() => handleAddMetric(item.id)}
                          onDragStart={handleDragStart}
                          onDragOverItem={handleDragOverItem}
                          onDropOnItem={handleDropOnItem}
                        />
                      </div>
                    ))
                  )}
                </DropZone>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {dashboard && tableColumns ? (
        <div className="h-px w-full bg-[#FFFFFF33]" aria-hidden="true" />
      ) : null}

      {tableColumns ? (
        <section>
          <SectionHeader title="Table Columns" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <p className="text-base font-semibold text-white">Visible Columns</p>
              <p className="mb-3 text-sm text-white/50">Currently shown in table</p>
              <DropZone
                zone="visible-columns"
                isActive={activeDropZone === 'visible-columns'}
                onDragOverZone={handleDragOverZone}
                onDropOnZone={handleDropOnZone}
              >
                {localVisibleColumns.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-sm text-white/40">
                    No visible columns
                  </p>
                ) : (
                  localVisibleColumns.map((item) => (
                    <MetricRow
                      key={item.id}
                      item={item}
                      zone="visible-columns"
                      removable
                      draggingId={draggingId}
                      onRemove={() => handleRemoveColumn(item.id)}
                      onDragStart={handleDragStart}
                      onDragOverItem={handleDragOverItem}
                      onDropOnItem={handleDropOnItem}
                    />
                  ))
                )}
              </DropZone>
            </div>

            <div>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">Hidden Columns</p>
                  <p className="text-sm text-white/50">Available to add to table</p>
                </div>
                <ResetButton onClick={tableColumns.onReset} />
              </div>
              <div className="space-y-3">
                <SearchField
                  placeholder="Search Columns"
                  value={columnSearch}
                  onChange={setColumnSearch}
                />
                <DropZone
                  zone="hidden-columns"
                  isActive={activeDropZone === 'hidden-columns'}
                  onDragOverZone={handleDragOverZone}
                  onDropOnZone={handleDropOnZone}
                  className="min-h-[340px] pb-28"
                >
                  {filteredHiddenColumns.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-sm text-white/40">
                      No hidden columns
                    </p>
                  ) : (
                    filteredHiddenColumns.map((item) => (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredAvailableId(item.id)}
                        onMouseLeave={() =>
                          setHoveredAvailableId((current) => (current === item.id ? null : current))
                        }
                      >
                        <AvailableRow
                          item={item}
                          zone="hidden-columns"
                          highlighted={hoveredAvailableId === item.id}
                          draggingId={draggingId}
                          onAdd={() => handleAddColumn(item.id)}
                          onDragStart={handleDragStart}
                          onDragOverItem={handleDragOverItem}
                          onDropOnItem={handleDropOnItem}
                        />
                      </div>
                    ))
                  )}
                </DropZone>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-end gap-3 border-t border-[#FFFFFF33] bg-[#050505]/95 px-4 py-3 backdrop-blur sm:px-6">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
          className="border-white/30 bg-transparent text-white hover:bg-white/5"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || (!dashboard && !tableColumns)}
          className="bg-gradient-to-r from-[#E0A263] to-[#F6CB86] text-[#050505] hover:opacity-90"
        >
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
