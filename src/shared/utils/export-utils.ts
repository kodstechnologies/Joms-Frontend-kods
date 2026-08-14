import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Utility to export tabular data to CSV, Excel, or PDF formats.
 *
 * @param headers An array of strings representing the column headers.
 * @param rows An array of string arrays, where each string array represents a row of data.
 * @param format The desired export format ('csv', 'excel', 'pdf').
 * @param fileNamePrefix The prefix for the downloaded file (e.g., 'venue_data').
 */
export function exportDataToFile(
  headers: string[],
  rows: string[][],
  format: string,
  fileNamePrefix: string,
) {
  if (!rows || rows.length === 0) {
    throw new Error('NO_RECORDS')
  }

  const rowsForExport = [headers, ...rows]

  if (format === 'excel') {
    const worksheet = XLSX.utils.aoa_to_sheet(rowsForExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    XLSX.writeFile(workbook, `${fileNamePrefix}.xlsx`)
  } else if (format === 'pdf') {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [headers],
      body: rows,
    })
    doc.save(`${fileNamePrefix}.pdf`)
  } else {
    // Default to CSV
    const csvContent = rowsForExport
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${fileNamePrefix}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
