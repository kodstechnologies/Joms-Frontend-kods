export type InvoiceReminder = {
  invoiceId: string
  invoiceNumber: string
  clientName: string
  remindAt: string
  message: string
  createdAt: string
}

const STORAGE_KEY = 'joms.finance.invoice-reminders'

const readAll = (): InvoiceReminder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as InvoiceReminder[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeAll = (reminders: InvoiceReminder[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

export const saveInvoiceReminder = (reminder: InvoiceReminder) => {
  const next = readAll().filter((item) => item.invoiceId !== reminder.invoiceId)
  next.push(reminder)
  writeAll(next)
}

export const listDueInvoiceReminders = (now = new Date()) => {
  const stamp = now.getTime()
  return readAll().filter((item) => {
    const at = new Date(item.remindAt).getTime()
    return Number.isFinite(at) && at <= stamp
  })
}

export const clearInvoiceReminder = (invoiceId: string) => {
  writeAll(readAll().filter((item) => item.invoiceId !== invoiceId))
}

export const formatReminderDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export const toDateTimeLocalValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const defaultReminderLocalValue = () => {
  const next = new Date()
  next.setDate(next.getDate() + 1)
  next.setHours(10, 0, 0, 0)
  return toDateTimeLocalValue(next)
}
