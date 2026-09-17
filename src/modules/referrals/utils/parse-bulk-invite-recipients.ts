import { normalizeImportedMobileNumber } from '@/shared/lib/phone'

export type BulkInviteRecipient = { name: string; email?: string; phone?: string }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const HEADER_NAME_PATTERN =
  /^(s no|sno|sr no|name|full name|fullname|expert name|recipient|user name|username)$/i

export const isValidBulkInviteEmail = (value: string) => EMAIL_PATTERN.test(value.trim())

const parseCsvLine = (line: string, delimiter: string): string[] => {
  const cols: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === delimiter && !inQuotes) {
      cols.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  cols.push(current.trim())
  return cols
}

const detectDelimiter = (headerLine: string): string => {
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0 }
  let inQuotes = false
  for (const ch of headerLine) {
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (!inQuotes && ch in counts) counts[ch] += 1
  }
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return ranked[0][1] > 0 ? ranked[0][0] : ','
}

const excelCellToString = (value: unknown): string => {
  if (value == null || value === '') return ''
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : String(value)
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (record.text != null) return String(record.text).trim()
    if (record.result != null) return excelCellToString(record.result)
    if (Array.isArray(record.richText)) {
      return record.richText.map((part) => String((part as { text?: string }).text || '')).join('')
    }
    if (record.hyperlink != null) return String(record.hyperlink)
  }
  return String(value).trim()
}

const isImportablePhone = (value: string) =>
  /^[0-9]{10}$/.test(normalizeImportedMobileNumber(value))

const extractRecipient = (cols: string[]): BulkInviteRecipient | null => {
  const cells = cols.map((col) => String(col || '').trim())
  if (!cells.some(Boolean)) return null

  const emailIdx = cells.findIndex((cell) => isValidBulkInviteEmail(cell))
  const phoneIdx = cells.findIndex((cell, index) => index !== emailIdx && isImportablePhone(cell))

  if (emailIdx < 0 || phoneIdx < 0) return null

  const email = cells[emailIdx].trim().toLowerCase()
  const phone = normalizeImportedMobileNumber(cells[phoneIdx])
  const name = cells
    .filter((_, index) => index !== emailIdx && index !== phoneIdx)
    .filter(Boolean)
    .join(', ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!name || HEADER_NAME_PATTERN.test(name)) return null

  return { name, email, phone }
}

export const parseRecipientRows = (rows: string[][]): BulkInviteRecipient[] => {
  const seen = new Set<string>()
  const recipients: BulkInviteRecipient[] = []

  for (const cols of rows) {
    const item = extractRecipient(cols)
    if (!item?.name || !item.email || !item.phone) continue
    const key = `${item.email}|${item.phone}|${item.name.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    recipients.push(item)
  }

  return recipients
}

export const parseCsvRecipients = (text: string): BulkInviteRecipient[] => {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (!lines.length) return []

  const delimiter = detectDelimiter(lines[0])
  const rows = lines.map((line) => parseCsvLine(line, delimiter))
  return parseRecipientRows(rows)
}

export const parseXlsxRecipients = async (file: File): Promise<BulkInviteRecipient[]> => {
  const excelModule = await import('exceljs')
  const ExcelJS = excelModule.default ?? excelModule
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const sheet = workbook.worksheets[0]
  if (!sheet) return []

  const rows: string[][] = []
  sheet.eachRow((row) => {
    const values = Array.isArray(row.values) ? row.values.slice(1) : []
    rows.push(values.map((cell) => excelCellToString(cell)))
  })
  return parseRecipientRows(rows)
}

export const parseBulkInviteFile = async (file: File): Promise<BulkInviteRecipient[]> => {
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.xls') && !lower.endsWith('.xlsx')) {
    throw new Error('Legacy .xls is not supported. Save the sheet as .xlsx or .csv.')
  }
  if (lower.endsWith('.xlsx')) {
    return parseXlsxRecipients(file)
  }
  return parseCsvRecipients(await file.text())
}
