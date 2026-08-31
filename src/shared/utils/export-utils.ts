import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' && value.trim() === '') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
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
    autoTable(doc, {
      head: [headers],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [33, 33, 33] },
    })
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

export async function exportSheetsToExcel(sheets: ExcelSheetData[], fileNamePrefix: string) {
  const validSheets = sheets.filter((sheet) => sheet.headers.length > 0 && sheet.rows.length > 0)
  if (!validSheets.length) {
    throw new Error('NO_RECORDS')
  }

  const workbook = new ExcelJS.Workbook()

  for (const sheetData of validSheets) {
    const sheet = workbook.addWorksheet(sheetData.name.slice(0, 31))
    const headerRow = sheet.addRow(sheetData.headers)
    headerRow.font = { bold: true }
    sheetData.rows.forEach((row) => {
      sheet.addRow(row)
    })
    sheet.columns.forEach((column) => {
      let maxLength = 12
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const length = String(cell.value ?? '').length
        if (length > maxLength) maxLength = length
      })
      column.width = Math.min(maxLength + 2, 40)
    })
  }

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(excelBufferToBlob(buffer), `${fileNamePrefix}.xlsx`)
}

async function writeExcelFile(rowsForExport: string[][], fileNamePrefix: string) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Data')
  const headerRow = sheet.addRow(rowsForExport[0] ?? [])
  headerRow.font = { bold: true }
  rowsForExport.slice(1).forEach((row) => {
    sheet.addRow(row)
  })
  sheet.columns.forEach((column) => {
    let maxLength = 12
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const length = String(cell.value ?? '').length
      if (length > maxLength) maxLength = length
    })
    column.width = Math.min(maxLength + 2, 40)
  })
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
            const str = String(val ?? '')
            return `"${str.replace(/"/g, '""')}"`
          })
          .join(','),
      )
      .join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}
