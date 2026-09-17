import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' && value.trim() === '') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

/** PDF built-in fonts cannot draw ₹, which otherwise renders as spaced-out garbage. */
export function toPdfExportText(value: unknown): string {
  return exportDisplayValue(value)
    .replaceAll('\u20B9', 'Rs.')
    .replaceAll('\u00A0', ' ')
    .replace(/[\u2012\u2013\u2014\u2212]/g, '-')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
}

function normalizeExportFormat(format: string) {
  const value = String(format || 'csv')
    .toLowerCase()
    .trim()
  if (value === 'xlsx' || value === 'xls' || value === 'excel') return 'excel'
  if (value === 'pdf') return 'pdf'
  return 'csv'
}

function excelBufferToBlob(buffer: ExcelJS.Buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer as ArrayBuffer)
  return new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

const PDF_TABLE_STYLES = {
  styles: { font: 'helvetica' as const, fontSize: 8, cellPadding: 2 },
  headStyles: { fillColor: [33, 33, 33] as [number, number, number] },
}

function writePdfTable(
  doc: jsPDF,
  headers: string[],
  rows: (string | number)[][],
  startY?: number,
) {
  autoTable(doc, {
    ...(startY != null ? { startY } : {}),
    head: [headers.map((header) => toPdfExportText(header))],
    body: rows.map((row) => row.map((cell) => toPdfExportText(cell))),
    ...PDF_TABLE_STYLES,
  })
}

function applyExcelRow(row: ExcelJS.Row, values: (string | number)[], bold = false) {
  values.forEach((value, index) => {
    const cell = row.getCell(index + 1)
    if (typeof value === 'number' && Number.isFinite(value)) {
      cell.value = value
    } else {
      cell.value = exportDisplayValue(value)
      cell.numFmt = '@'
    }
    cell.font = { name: 'Calibri', size: 11, bold }
  })
}

function autosizeExcelSheet(sheet: ExcelJS.Worksheet) {
  sheet.columns.forEach((column) => {
    let maxLength = 12
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const length = String(cell.value ?? '').length
      if (length > maxLength) maxLength = length
    })
    column.width = Math.min(maxLength + 2, 40)
  })
}

export async function exportDataToFile(
  headers: string[],
  rows: string[][],
  format: string,
  fileNamePrefix: string,
) {
  if (!rows || rows.length === 0) {
    throw new Error('NO_RECORDS')
  }

  const rowsForExport = [headers, ...rows]
  const normalizedFormat = normalizeExportFormat(format)

  if (normalizedFormat === 'excel') {
    await writeExcelFile(rowsForExport, fileNamePrefix)
    return
  }

  if (normalizedFormat === 'pdf') {
    const doc = new jsPDF({
      orientation: headers.length > 6 ? 'landscape' : 'portrait',
    })
    writePdfTable(doc, headers, rows)
    doc.save(`${fileNamePrefix}.pdf`)
    return
  }

  exportCsv(rowsForExport, `${fileNamePrefix}.csv`)
}

export type ExcelSheetData = {
  name: string
  headers: string[]
  rows: (string | number)[][]
}

export async function exportSheetsToFile(
  sheets: ExcelSheetData[],
  fileNamePrefix: string,
  format = 'excel',
) {
  const validSheets = sheets.filter((sheet) => sheet.headers.length > 0 && sheet.rows.length > 0)
  if (!validSheets.length) {
    throw new Error('NO_RECORDS')
  }

  const normalizedFormat = normalizeExportFormat(format)

  if (normalizedFormat === 'pdf') {
    const doc = new jsPDF({
      orientation: validSheets.some((sheet) => sheet.headers.length > 6) ? 'landscape' : 'portrait',
    })

    validSheets.forEach((sheetData, index) => {
      if (index > 0) doc.addPage()
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.text(toPdfExportText(sheetData.name), 14, 16)
      writePdfTable(doc, sheetData.headers, sheetData.rows, 22)
    })

    doc.save(`${fileNamePrefix}.pdf`)
    return
  }

  if (normalizedFormat === 'csv') {
    const blocks = validSheets.map((sheetData) => {
      const rows = [[sheetData.name], sheetData.headers, ...sheetData.rows]
      return rows
        .map((row) =>
          row
            .map((val) => {
              const str = exportDisplayValue(val)
              return `"${str.replace(/"/g, '""')}"`
            })
            .join(','),
        )
        .join('\r\n')
    })
    const blob = new Blob(['\uFEFF' + blocks.join('\r\n\r\n')], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, `${fileNamePrefix}.csv`)
    return
  }

  const workbook = new ExcelJS.Workbook()

  for (const sheetData of validSheets) {
    const sheet = workbook.addWorksheet(sheetData.name.slice(0, 31))
    applyExcelRow(sheet.addRow([]), sheetData.headers, true)
    sheetData.rows.forEach((row) => {
      applyExcelRow(sheet.addRow([]), row)
    })
    autosizeExcelSheet(sheet)
  }

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(excelBufferToBlob(buffer), `${fileNamePrefix}.xlsx`)
}

export async function exportSheetsToExcel(sheets: ExcelSheetData[], fileNamePrefix: string) {
  await exportSheetsToFile(sheets, fileNamePrefix, 'excel')
}

async function writeExcelFile(rowsForExport: string[][], fileNamePrefix: string) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Data')
  applyExcelRow(sheet.addRow([]), rowsForExport[0] ?? [], true)
  rowsForExport.slice(1).forEach((row) => {
    applyExcelRow(sheet.addRow([]), row)
  })
  autosizeExcelSheet(sheet)
  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(excelBufferToBlob(buffer), `${fileNamePrefix}.xlsx`)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function exportCsv(rows: (string | number | boolean | null | undefined)[][], filename: string) {
  const csvContent =
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((val) => {
            const str = exportDisplayValue(val)
            return `"${str.replace(/"/g, '""')}"`
          })
          .join(','),
      )
      .join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}
