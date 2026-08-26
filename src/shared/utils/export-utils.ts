import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' && value.trim() === '') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

export function exportDataToFile(
  headers: string[],
  rows: string[][],
  format: string,
  fileNamePrefix: string,
) {
  if (!rows || rows.length === 0) {
    throw new Error('NO_RECORDS')
  }

  const normalized = String(format || 'csv')
    .trim()
    .toLowerCase()
  const rowsForExport = [headers, ...rows]

  if (normalized === 'excel' || normalized === 'xlsx') {
    void writeExcelFile(rowsForExport, fileNamePrefix).catch(() => {
      exportCsv(rowsForExport, `${fileNamePrefix}.csv`)
    })
    return
  }

  if (normalized === 'pdf') {
    try {
      const doc = new jsPDF()
      autoTable(doc, {
        head: [headers],
        body: rows,
      })
      doc.save(`${fileNamePrefix}.pdf`)
      return
    } catch {
      exportCsv(rowsForExport, `${fileNamePrefix}.csv`)
      return
    }
  }

  exportCsv(rowsForExport, `${fileNamePrefix}.csv`)
}

async function writeExcelFile(rowsForExport: string[][], fileNamePrefix: string) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Data')
  rowsForExport.forEach((row) => {
    sheet.addRow(row)
  })
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  downloadBlob(blob, `${fileNamePrefix}.xlsx`)
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
