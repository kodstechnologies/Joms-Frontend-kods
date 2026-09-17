export function exportDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' && value.trim() === '') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}
