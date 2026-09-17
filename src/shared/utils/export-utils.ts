import ExcelJS from 'exceljs'

import { exportDisplayValue } from './export-display'
import { toPdfExportText, writeExportPdf } from './export-pdf'

export { exportDisplayValue } from './export-display'
export { toPdfExportText } from './export-pdf'

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
    writeExportPdf({
      fileNamePrefix,
      sheets: [{ headers, rows }],
    })
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
    writeExportPdf({ fileNamePrefix, sheets: validSheets })
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
