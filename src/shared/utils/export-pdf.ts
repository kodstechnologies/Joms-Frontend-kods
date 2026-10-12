import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { exportDisplayValue } from './export-display'

export type PdfPageLayout = {
  orientation: 'portrait' | 'landscape'
  format: 'a4'
  fontSize: number
}

const PAGE_WIDTH_MM = {
  portrait: 210,
  landscape: 297,
} as const

const PDF_MARGIN = { top: 14, right: 10, bottom: 12, left: 10 }
const LONG_TOKEN_CHARS = 28

function chunkPdfToken(value: string, size = LONG_TOKEN_CHARS) {
  if (value.length <= size) return value
  const parts: string[] = []
  for (let index = 0; index < value.length; index += size) {
    parts.push(value.slice(index, index + size))
  }
  return parts.join(' ')
}

function wrapPdfToken(token: string) {
  if (token.length <= LONG_TOKEN_CHARS) return token
  if (token.includes('@')) {
    const at = token.indexOf('@')
    return `${chunkPdfToken(token.slice(0, at))}@ ${chunkPdfToken(token.slice(at + 1))}`
  }
  const protocol = token.match(/^(https?:\/\/)(.+)$/i)
  if (protocol) {
    return (
      protocol[1] +
      protocol[2]
        .split('/')
        .map((part) => chunkPdfToken(part))
        .join('/ ')
    )
  }
  if (token.includes('/')) {
    return token
      .split('/')
      .map((part) => chunkPdfToken(part))
      .join('/ ')
  }
  return chunkPdfToken(token)
}

export function toPdfExportText(value: unknown): string {
  const text = exportDisplayValue(value)
    .replaceAll('\u20B9', 'Rs.')
    .replaceAll('\u00A0', ' ')
    .replace(/[\u2012\u2013\u2014\u2212]/g, '-')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')

  return text.replace(/\S+/g, wrapPdfToken)
}

export function layoutForPdfColumnCount(columnCount: number): PdfPageLayout {
  if (columnCount > 5) {
    return {
      orientation: 'landscape',
      format: 'a4',
      fontSize: columnCount > 8 ? 7 : 8,
    }
  }

  return { orientation: 'portrait', format: 'a4', fontSize: 9 }
}

export function maxPdfColumnsForLayout(layout: PdfPageLayout): number {
  const usableWidth = PAGE_WIDTH_MM[layout.orientation] - PDF_MARGIN.left - PDF_MARGIN.right
  const minWidth = layout.fontSize >= 8 ? 34 : 30
  return Math.max(3, Math.floor(usableWidth / minWidth))
}

export function chunkPdfColumns(
  headers: string[],
  rows: (string | number)[][],
  maxColumns: number,
): { headers: string[]; rows: (string | number)[][] }[] {
  if (headers.length <= maxColumns || maxColumns < 2) {
    return [{ headers, rows }]
  }

  const dataColumnsPerPage = maxColumns - 1
  const chunks: { headers: string[]; rows: (string | number)[][] }[] = []

  for (let start = 1; start < headers.length; start += dataColumnsPerPage) {
    const end = Math.min(start + dataColumnsPerPage, headers.length)
    chunks.push({
      headers: [headers[0], ...headers.slice(start, end)],
      rows: rows.map((row) => [row[0] ?? '', ...row.slice(start, end)]),
    })
  }

  return chunks
}

export function computePdfColumnWidths(
  headers: string[],
  rows: (string | number)[][],
  usableWidth: number,
): number[] {
  const count = headers.length
  if (count === 0) return []

  const weights = headers.map((header, index) => {
    let maxChars = toPdfExportText(header).length
    const sampleLimit = Math.min(rows.length, 80)
    for (let rowIndex = 0; rowIndex < sampleLimit; rowIndex += 1) {
      const chars = toPdfExportText(rows[rowIndex]?.[index]).length
      if (chars > maxChars) maxChars = chars
    }
    return Math.min(Math.max(maxChars, 8), 32)
  })

  const weightSum = weights.reduce((sum, weight) => sum + weight, 0) || count
  const minWidth = Math.min(18, usableWidth / count)
  const rawWidths = weights.map((weight) => Math.max(minWidth, (weight / weightSum) * usableWidth))
  const total = rawWidths.reduce((sum, width) => sum + width, 0) || usableWidth
  const scaled = rawWidths.map((width) => (width / total) * usableWidth)
  const rounded = scaled.map((width) => Math.round(width * 100) / 100)
  const drift = usableWidth - rounded.reduce((sum, width) => sum + width, 0)
  rounded[rounded.length - 1] = Math.round((rounded[rounded.length - 1] + drift) * 100) / 100
  return rounded
}

function usablePageWidth(doc: jsPDF) {
  return doc.internal.pageSize.getWidth() - PDF_MARGIN.left - PDF_MARGIN.right - 1
}

function writePdfTitle(doc: jsPDF, title: string) {
  const lines = doc.splitTextToSize(toPdfExportText(title), usablePageWidth(doc))
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30)
  doc.text(lines, PDF_MARGIN.left, PDF_MARGIN.top)
  return PDF_MARGIN.top + lines.length * 5.5 + 2
}

function writePdfTable(
  doc: jsPDF,
  headers: string[],
  rows: (string | number)[][],
  layout: PdfPageLayout,
  startY: number,
) {
  const usableWidth = usablePageWidth(doc)
  const columnWidths = computePdfColumnWidths(headers, rows, usableWidth)
  const columnStyles = Object.fromEntries(
    columnWidths.map((cellWidth, index) => [index, { cellWidth, overflow: 'linebreak' as const }]),
  )

  autoTable(doc, {
    startY,
    head: [headers.map((header) => toPdfExportText(header))],
    body: rows.map((row) => row.map((cell) => toPdfExportText(cell))),
    theme: 'grid',
    tableWidth: usableWidth,
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    margin: PDF_MARGIN,
    styles: {
      font: 'helvetica',
      fontSize: layout.fontSize,
      cellPadding: layout.fontSize >= 8 ? 2.2 : 1.6,
      overflow: 'linebreak',
      cellWidth: 'auto',
      valign: 'top',
      textColor: [30, 30, 30],
      lineColor: [210, 210, 210],
      lineWidth: 0.1,
      minCellWidth: 16,
    },
    headStyles: {
      fillColor: [33, 33, 33],
      textColor: 255,
      fontStyle: 'bold',
      overflow: 'linebreak',
      valign: 'middle',
      cellPadding: 2,
    },
    bodyStyles: {
      overflow: 'linebreak',
      valign: 'top',
    },
    columnStyles,
    horizontalPageBreak: false,
  })
}

function addPdfPageNumbers(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    const width = doc.internal.pageSize.getWidth()
    const height = doc.internal.pageSize.getHeight()
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(`Page ${page} of ${pageCount}`, width / 2, height - 6, { align: 'center' })
  }
}

function applyPageLayout(doc: jsPDF, layout: PdfPageLayout, isFirstPage: boolean) {
  if (isFirstPage) return
  doc.addPage(layout.format, layout.orientation)
}

export function buildExportPdf(options: {
  fileNamePrefix: string
  sheets: { name?: string; headers: string[]; rows: (string | number)[][] }[]
}) {
  const { fileNamePrefix, sheets } = options
  const firstLayout = layoutForPdfColumnCount(sheets[0]?.headers.length ?? 0)
  const doc = new jsPDF({
    orientation: firstLayout.orientation,
    format: firstLayout.format,
    unit: 'mm',
    compress: true,
  })

  let isFirstPage = true

  sheets.forEach((sheet) => {
    const layout = layoutForPdfColumnCount(sheet.headers.length)
    const chunks = chunkPdfColumns(sheet.headers, sheet.rows, maxPdfColumnsForLayout(layout))

    chunks.forEach((chunk, chunkIndex) => {
      applyPageLayout(doc, layout, isFirstPage)
      isFirstPage = false

      const sheetTitle =
        sheet.name || (chunks.length > 1 ? fileNamePrefix.replaceAll('_', ' ') : '')
      const titleParts = [
        sheetTitle,
        chunks.length > 1 ? `(${chunkIndex + 1}/${chunks.length})` : '',
      ]
        .filter(Boolean)
        .join(' ')
      const startY = titleParts ? writePdfTitle(doc, titleParts) : PDF_MARGIN.top
      writePdfTable(doc, chunk.headers, chunk.rows, layout, startY)
    })
  })

  addPdfPageNumbers(doc)
  return doc
}

export function writeExportPdf(options: {
  fileNamePrefix: string
  sheets: { name?: string; headers: string[]; rows: (string | number)[][] }[]
}) {
  buildExportPdf(options).save(`${options.fileNamePrefix}.pdf`)
}
