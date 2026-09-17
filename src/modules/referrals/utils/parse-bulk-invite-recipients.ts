import { isScientificPhoneValue, normalizeImportedMobileNumber } from '@/shared/lib/phone'

export type BulkInviteRecipient = { name: string; email?: string; phone?: string }

export type BulkInviteParseResult = {
  recipients: BulkInviteRecipient[]
  warnings: string[]
}

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

const numberToDigitString = (value: number) => {
  if (!Number.isFinite(value)) return ''
  return String(Math.round(Math.abs(value)))
}

const excelCellToString = (value: unknown): string => {
  if (value == null || value === '') return ''
  if (typeof value === 'number' && Number.isFinite(value)) {
    return numberToDigitString(value)
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.result === 'number') return numberToDigitString(record.result)
    if (record.result != null) return excelCellToString(record.result)
    if (record.text != null) return String(record.text).trim()
    if (Array.isArray(record.richText)) {
      return record.richText.map((part) => String((part as { text?: string }).text || '')).join('')
    }
    if (typeof record.hyperlink === 'string') {
      return record.hyperlink.replace(/^mailto:/i, '').trim()
    }
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

export const parseRecipientRowsWithMeta = (rows: string[][]): BulkInviteParseResult => {
  const seenEmails = new Set<string>()
  const recipients: BulkInviteRecipient[] = []
  const warnings: string[] = []
  const duplicateNames: string[] = []
  let scientificPhones = 0
  let skippedInvalid = 0

  for (const cols of rows) {
    if (!cols.some((cell) => String(cell || '').trim())) continue
    if (cols.some((cell) => isScientificPhoneValue(String(cell || '')))) {
      scientificPhones += 1
    }

    const item = extractRecipient(cols)
    if (!item?.name || !item.email || !item.phone) {
      const looksLikeHeader = cols.every((cell) => !isValidBulkInviteEmail(String(cell || '')))
      if (!looksLikeHeader) skippedInvalid += 1
      continue
    }

    if (seenEmails.has(item.email)) {
      duplicateNames.push(item.name)
      continue
    }
    seenEmails.add(item.email)
    recipients.push(item)
  }

  if (scientificPhones > 0) {
    warnings.push(
      'Excel showed phones as 9.87E+09. Invites were still created from the stored numbers. For SMS accuracy, set the phone column to Text before typing numbers.',
    )
  }
  if (duplicateNames.length) {
    warnings.push(
      `Same email is used more than once. Only the first row was kept; skipped ${duplicateNames.join(', ')}. Each expert needs a unique email.`,
    )
  }
  if (skippedInvalid > 0 && recipients.length) {
    warnings.push(`${skippedInvalid} row(s) were skipped because email was missing or invalid.`)
  }

  return { recipients, warnings }
}

export const parseRecipientRows = (rows: string[][]): BulkInviteRecipient[] =>
  parseRecipientRowsWithMeta(rows).recipients

export const parseCsvRecipientsWithMeta = (text: string): BulkInviteParseResult => {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (!lines.length) return { recipients: [], warnings: [] }

  const delimiter = detectDelimiter(lines[0])
  const rows = lines.map((line) => parseCsvLine(line, delimiter))
  return parseRecipientRowsWithMeta(rows)
}

export const parseCsvRecipients = (text: string): BulkInviteRecipient[] =>
  parseCsvRecipientsWithMeta(text).recipients

export const parseXlsxRecipientsWithMeta = async (file: File): Promise<BulkInviteParseResult> => {
  const excelModule = await import('exceljs')
  const ExcelJS = excelModule.default ?? excelModule
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const sheet = workbook.worksheets[0]
  if (!sheet) return { recipients: [], warnings: [] }

  const rows: string[][] = []
  sheet.eachRow((row) => {
    const cells: string[] = []
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      while (cells.length < colNumber - 1) cells.push('')
      const value = cell.value
      cells[colNumber - 1] =
        typeof value === 'number' ? numberToDigitString(value) : excelCellToString(value)
    })
    rows.push(cells)
  })
  return parseRecipientRowsWithMeta(rows)
}

export const parseBulkInviteFile = async (file: File): Promise<BulkInviteParseResult> => {
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.xls') && !lower.endsWith('.xlsx')) {
    throw new Error('Legacy .xls is not supported. Save the sheet as .xlsx or .csv.')
  }
  if (lower.endsWith('.xlsx')) {
    return parseXlsxRecipientsWithMeta(file)
  }
  return parseCsvRecipientsWithMeta(await file.text())
}
