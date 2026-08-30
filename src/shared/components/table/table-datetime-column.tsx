import { TableDateTimeCell } from './table-datetime-cell'

export function renderTableDateTimeCell(value?: string | null) {
  return value ? <TableDateTimeCell value={value} /> : '—'
}
