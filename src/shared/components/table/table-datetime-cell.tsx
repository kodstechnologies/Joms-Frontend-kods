type TableDateTimeCellProps = {
  value?: string | Date | null
  emptyLabel?: string
}

function formatParts(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  return { datePart, timePart }
}

export function TableDateTimeCell({ value, emptyLabel = '—' }: TableDateTimeCellProps) {
  if (!value) return <span className="ui-table-datetime-empty">{emptyLabel}</span>

  const parts = formatParts(value)
  if (!parts) return <span className="ui-table-datetime-empty">{emptyLabel}</span>

  return (
    <span className="ui-table-datetime">
      <span className="ui-table-datetime-date">{parts.datePart},</span>
      <span className="ui-table-datetime-time">{parts.timePart}</span>
    </span>
  )
}
