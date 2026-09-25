import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from 'react'
import { ArrowLeft, GripVertical, Plus, Search, X } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { dedupeOrderedIds } from '@/shared/lib/dedupe-ids'
import { toast } from 'sonner'

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
  Count: 'bg-white/10 text-white/80',
  Percentage: 'bg-white/10 text-white/80',
  Average: 'bg-white/10 text-white/80',
  Currency: 'bg-white/10 text-white/80',
  Number: 'bg-white/10 text-white/80',
  Text: 'bg-white/10 text-white/80',
  Status: 'bg-white/10 text-white/80',
  Date: 'bg-white/10 text-white/80',
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide',
        TYPE_BADGE_STYLES[type] ?? 'bg-white/10 text-white/80',
      )}
    >
      {type}
    </span>
  )
}

function dedupeActiveMetrics(items: ManageMetricsListItem[]): ManageMetricsListItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function dedupeAvailableMetrics(
  items: ManageMetricsAvailableItem[],
  activeIds: Set<string>,
): ManageMetricsAvailableItem[] {
  const seen = new Set(activeIds)
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function dedupeVisibleColumns(items: ManageMetricsListItem[]): ManageMetricsListItem[] {
  return dedupeActiveMetrics(items)
}

function dedupeHiddenColumns(
  items: ManageMetricsAvailableItem[],
  visibleIds: Set<string>,
): ManageMetricsAvailableItem[] {
  return dedupeAvailableMetrics(items, visibleIds)
}

function buildColumnListsKey(
  visible: ManageMetricsListItem[],
  hidden: ManageMetricsAvailableItem[],
) {
  return `${visible.map((item) => item.id).join(',')}|${hidden.map((item) => item.id).join(',')}`
}

function buildMetricListsKey(
  active: ManageMetricsListItem[],
  available: ManageMetricsAvailableItem[],
) {
  return `${active.map((item) => item.id).join(',')}|${available.map((item) => item.id).join(',')}`
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
        className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-white/70"
        strokeWidth={1.75}
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
      onClick={removable ? onRemove : undefined}
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
        <GripVertical className="size-4 text-current" strokeWidth={1.75} />
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
          className="grid size-6 shrink-0 place-items-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-3.5 text-current" aria-hidden="true" strokeWidth={1.75} />
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
      onClick={onAdd}
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
        <GripVertical className="size-4 text-current" strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-white">{item.title}</p>
        <p className="truncate text-sm text-white/50">{item.description}</p>
      </div>

      <button
        type="button"
        aria-label={`Add ${item.title}`}
        onClick={onAdd}
        className="ml-auto grid size-7 shrink-0 place-items-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Plus className="size-4 text-current" aria-hidden="true" strokeWidth={1.75} />
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
  const catalogMetricCount = dashboardActive.length + dashboardAvailable.length
  const maxActive = dashboard?.maxActive ?? catalogMetricCount

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
  const propsKey = buildMetricListsKey(dashboardActive, dashboardAvailable)
  const columnPropsKey = buildColumnListsKey(tableVisible, tableHidden)
  const lastSyncedPropsKey = useRef(propsKey)
  const lastSyncedColumnPropsKey = useRef(columnPropsKey)

  useEffect(() => {
    if (propsKey === lastSyncedPropsKey.current) return

    lastSyncedPropsKey.current = propsKey
    const active = dedupeActiveMetrics(dashboardActive)
    const activeIds = new Set(active.map((item) => item.id))
    setLocalActiveMetrics(active)
    setLocalAvailableMetrics(dedupeAvailableMetrics(dashboardAvailable, activeIds))
  }, [propsKey, dashboardActive, dashboardAvailable])

  useEffect(() => {
    if (columnPropsKey === lastSyncedColumnPropsKey.current) return

    lastSyncedColumnPropsKey.current = columnPropsKey
    const visible = dedupeVisibleColumns(tableVisible)
    const visibleIds = new Set(visible.map((item) => item.id))
    setLocalVisibleColumns(visible)
    setLocalHiddenColumns(dedupeHiddenColumns(tableHidden, visibleIds))
  }, [columnPropsKey, tableHidden, tableVisible])

  const displayedActiveMetrics = useMemo(
    () => dedupeActiveMetrics(localActiveMetrics),
    [localActiveMetrics],
  )

  const displayedVisibleColumns = useMemo(
    () => dedupeVisibleColumns(localVisibleColumns),
    [localVisibleColumns],
  )

  const displayedHiddenColumns = useMemo(() => {
    const visibleIds = new Set(displayedVisibleColumns.map((item) => item.id))
    return dedupeHiddenColumns(localHiddenColumns, visibleIds)
  }, [displayedVisibleColumns, localHiddenColumns])

  const filteredAvailableMetrics = useMemo(() => {
    const uniqueAvailable = dedupeAvailableMetrics(
      localAvailableMetrics,
      new Set(displayedActiveMetrics.map((item) => item.id)),
    )
    const query = metricSearch.trim().toLowerCase()
    if (!query) return uniqueAvailable
    return uniqueAvailable.filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    )
  }, [localAvailableMetrics, displayedActiveMetrics, metricSearch])

  const filteredHiddenColumns = useMemo(() => {
    const query = columnSearch.trim().toLowerCase()
    if (!query) return displayedHiddenColumns
    return displayedHiddenColumns.filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    )
  }, [columnSearch, displayedHiddenColumns])

  const handleRemoveMetric = (id: string) => {
    setLocalActiveMetrics((prev) => {
      const index = prev.findIndex((metric) => metric.id === id)
      const item = index >= 0 ? prev[index] : undefined
      if (!item) return prev

      const nextActive = dedupeActiveMetrics(prev.filter((_, itemIndex) => itemIndex !== index))
      setLocalAvailableMetrics((availablePrev) =>
        dedupeAvailableMetrics(
          [...availablePrev, toAvailableItem(item)],
          new Set(nextActive.map((metric) => metric.id)),
        ),
      )
      return nextActive
    })
  }

  const handleAddMetric = (id: string) => {
    setLocalAvailableMetrics((availablePrev) => {
      const item = availablePrev.find((metric) => metric.id === id)
      if (!item) return availablePrev

      setLocalActiveMetrics((activePrev) => {
        if (activePrev.some((metric) => metric.id === id)) return activePrev
        if (activePrev.length >= maxActive) {
          toast.error(`You can only have up to ${maxActive} active metrics.`)
          return activePrev
        }
        return dedupeActiveMetrics([...activePrev, toListItem(item)])
      })

      return availablePrev.filter((metric) => metric.id !== id)
    })
  }

  const handleRemoveColumn = (id: string) => {
    setLocalVisibleColumns((prev) => {
      const item = prev.find((column) => column.id === id)
      if (!item || prev.length <= 1) return prev

      const nextVisible = dedupeVisibleColumns(prev.filter((column) => column.id !== id))
      const visibleIds = new Set(nextVisible.map((column) => column.id))
      setLocalHiddenColumns((hiddenPrev) =>
        dedupeHiddenColumns(
          [...hiddenPrev.filter((column) => column.id !== id), toAvailableItem(item)],
          visibleIds,
        ),
      )
      return nextVisible
    })
  }

  const handleAddColumn = (id: string) => {
    setLocalHiddenColumns((hiddenPrev) => {
      const item = hiddenPrev.find((column) => column.id === id)
      if (!item) return hiddenPrev

      setLocalVisibleColumns((visiblePrev) => {
        if (visiblePrev.some((column) => column.id === id)) return visiblePrev
        return dedupeVisibleColumns([...visiblePrev, toListItem(item)])
      })

      return hiddenPrev.filter((column) => column.id !== id)
    })
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
        setLocalActiveMetrics((activePrev) => {
          const index = activePrev.findIndex((metric) => metric.id === itemId)
          const item = index >= 0 ? activePrev[index] : undefined
          if (!item) return activePrev

          const nextActive = dedupeActiveMetrics(
            activePrev.filter((_, itemIndex) => itemIndex !== index),
          )
          setLocalAvailableMetrics((availablePrev) => {
            const next = dedupeAvailableMetrics(
              [...availablePrev, toAvailableItem(item)],
              new Set(nextActive.map((metric) => metric.id)),
            )
            if (!overId) return next
            const oldIndex = next.length - 1
            const newIndex = next.findIndex((entry) => entry.id === overId)
            return newIndex < 0 ? next : arrayMove(next, oldIndex, newIndex)
          })
          return nextActive
        })
        return
      }

      if (from === 'available-metrics' && to === 'active-metrics') {
        setLocalAvailableMetrics((availablePrev) => {
          const item = availablePrev.find((metric) => metric.id === itemId)
          if (!item) return availablePrev

          let moved = false
          setLocalActiveMetrics((activePrev) => {
            if (activePrev.some((metric) => metric.id === itemId)) return activePrev
            if (activePrev.length >= maxActive) return activePrev
            moved = true

            const next = dedupeActiveMetrics([...activePrev, toListItem(item)])
            if (!overId) return next
            const oldIndex = next.length - 1
            const newIndex = next.findIndex((entry) => entry.id === overId)
            return newIndex < 0 ? next : arrayMove(next, oldIndex, newIndex)
          })

          return moved ? availablePrev.filter((metric) => metric.id !== itemId) : availablePrev
        })
      }
      return
    }

    if (from === to) {
      if (from === 'visible-columns') {
        setLocalVisibleColumns((prev) => {
          const oldIndex = prev.findIndex((item) => item.id === itemId)
          const newIndex = overId ? prev.findIndex((item) => item.id === overId) : prev.length - 1
          return dedupeVisibleColumns(arrayMove(prev, oldIndex, newIndex))
        })
      } else {
        setLocalHiddenColumns((prev) => {
          const oldIndex = prev.findIndex((item) => item.id === itemId)
          const newIndex = overId ? prev.findIndex((item) => item.id === overId) : prev.length - 1
          const visibleIds = new Set(displayedVisibleColumns.map((item) => item.id))
          return dedupeHiddenColumns(arrayMove(prev, oldIndex, newIndex), visibleIds)
        })
      }
      return
    }

    if (from === 'visible-columns' && to === 'hidden-columns') {
      setLocalVisibleColumns((visiblePrev) => {
        const item = visiblePrev.find((column) => column.id === itemId)
        if (!item || visiblePrev.length <= 1) return visiblePrev

        const nextVisible = dedupeVisibleColumns(
          visiblePrev.filter((column) => column.id !== itemId),
        )
        const visibleIds = new Set(nextVisible.map((column) => column.id))
        setLocalHiddenColumns((hiddenPrev) => {
          const next = dedupeHiddenColumns(
            [...hiddenPrev.filter((column) => column.id !== itemId), toAvailableItem(item)],
            visibleIds,
          )
          if (!overId) return next
          const oldIndex = next.length - 1
          const newIndex = next.findIndex((entry) => entry.id === overId)
          return newIndex < 0 ? next : arrayMove(next, oldIndex, newIndex)
        })
        return nextVisible
      })
      return
    }

    if (from === 'hidden-columns' && to === 'visible-columns') {
      setLocalHiddenColumns((hiddenPrev) => {
        const item = hiddenPrev.find((column) => column.id === itemId)
        if (!item) return hiddenPrev

        setLocalVisibleColumns((visiblePrev) => {
          if (visiblePrev.some((column) => column.id === itemId)) return visiblePrev
          const next = dedupeVisibleColumns([...visiblePrev, toListItem(item)])
          if (!overId) return next
          const oldIndex = next.length - 1
          const newIndex = next.findIndex((entry) => entry.id === overId)
          return newIndex < 0 ? next : arrayMove(next, oldIndex, newIndex)
        })

        return hiddenPrev.filter((column) => column.id !== itemId)
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
      payload.activeMetricIds = dedupeOrderedIds(displayedActiveMetrics.map((item) => item.id))
    }

    if (tableColumns) {
      payload.visibleColumnIds = dedupeOrderedIds(displayedVisibleColumns.map((item) => item.id))
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
          <ArrowLeft className="size-5 text-current" strokeWidth={1.75} aria-hidden="true" />
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
                Showing {displayedActiveMetrics.length} metrics
              </p>
              <DropZone
                zone="active-metrics"
                isActive={activeDropZone === 'active-metrics'}
                onDragOverZone={handleDragOverZone}
                onDropOnZone={handleDropOnZone}
              >
                {displayedActiveMetrics.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-sm text-white/40">
                    No active metrics — drag from Available
                  </p>
                ) : (
                  displayedActiveMetrics.map((item) => (
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
                {displayedVisibleColumns.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-sm text-white/40">
                    No visible columns
                  </p>
                ) : (
                  displayedVisibleColumns.map((item) => (
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
