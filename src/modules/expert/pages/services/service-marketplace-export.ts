import { exportSheetsToFile } from '@/shared/utils/export-utils'

type ExportMetric = {
  label: string
  value: string
}

type ExportTrendPoint = {
  month: string
  consultationsCompleted: number
  servicesDelivered: number
  revenue: number
}

type ExportPayload = {
  serviceMetrics: ExportMetric[]
  consultationMetrics: ExportMetric[]
  trendPoints: ExportTrendPoint[]
  rangeLabel: string
}

const STYLE = {
  default: 0,
  title: 1,
  metaLabel: 2,
  metaValue: 3,
  section: 4,
  header: 5,
  odd: 6,
  oddValue: 7,
  even: 8,
  evenValue: 9,
  currency: 10,
  muted: 11,
} as const

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i]
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function u16(value: number) {
  const bytes = new Uint8Array(2)
  new DataView(bytes.buffer).setUint16(0, value, true)
  return bytes
}

function u32(value: number) {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, value, true)
  return bytes
}

function concatBytes(parts: Uint8Array[]) {
  const output = new Uint8Array(parts.reduce((total, part) => total + part.length, 0))
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }
  return output
}

function dosDateTime(date = new Date()) {
  return {
    time:
      ((date.getHours() & 0x1f) << 11) |
      ((date.getMinutes() & 0x3f) << 5) |
      (Math.floor(date.getSeconds() / 2) & 0x1f),
    date:
      (((date.getFullYear() - 1980) & 0x7f) << 9) |
      (((date.getMonth() + 1) & 0xf) << 5) |
      (date.getDate() & 0x1f),
  }
}

function buildZip(files: Array<{ name: string; content: string }>) {
  const encoder = new TextEncoder()
  const { time, date } = dosDateTime()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const nameBytes = encoder.encode(file.name)
    const data = encoder.encode(file.content)
    const crc = crc32(data)

    const local = concatBytes([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(time),
      u16(date),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
      data,
    ])
    locals.push(local)

    centrals.push(
      concatBytes([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0),
        u16(0),
        u16(time),
        u16(date),
        u32(crc),
        u32(data.length),
        u32(data.length),
        u16(nameBytes.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        nameBytes,
      ]),
    )
    offset += local.length
  }

  const centralDir = concatBytes(centrals)
  return concatBytes([
    ...locals,
    centralDir,
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ])
}

function textCell(ref: string, value: string, style: number) {
  return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`
}

function numberCell(ref: string, value: number, style: number) {
  return `<c r="${ref}" s="${style}"><v>${value}</v></c>`
}

function emptyCell(ref: string, style: number) {
  return `<c r="${ref}" s="${style}"/>`
}

function rowXml(index: number, height: number, cells: string) {
  return `<row r="${index}" ht="${height}" customHeight="1">${cells}</row>`
}

function colXml(index: number, width: number) {
  return `<col min="${index}" max="${index}" width="${width}" customWidth="1"/>`
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1">
    <numFmt numFmtId="164" formatCode="&quot;₹&quot;#,##0.00"/>
  </numFmts>
  <fonts count="8">
    <font><sz val="11"/><color theme="1"/><name val="Calibri"/></font>
    <font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><sz val="10"/><color rgb="FF475569"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><sz val="10"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
    <font><i/><sz val="10"/><color rgb="FF64748B"/><name val="Calibri"/></font>
  </fonts>
  <fills count="7">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE67A00"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E293B"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF59E0B"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF7ED"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border/>
    <border><bottom style="thin"><color rgb="FFD97706"/></bottom></border>
    <border><bottom style="thin"><color rgb="FFE2E8F0"/></bottom></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="12">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="5" borderId="2" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="5" borderId="2" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="6" borderId="2" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="6" borderId="2" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="164" fontId="3" fillId="5" borderId="2" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="7" fillId="0" borderId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
  </cellXfs>
</styleSheet>`
}

function worksheetXml({
  columns,
  rows,
  mergeRef,
  lastCell,
}: {
  columns: string
  rows: string
  mergeRef: string
  lastCell: string
}) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:${lastCell}"/>
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>${columns}</cols>
  <sheetData>${rows}</sheetData>
  <mergeCells count="1"><mergeCell ref="${mergeRef}"/></mergeCells>
</worksheet>`
}

function metricBlock(startRow: number, title: string, metrics: ExportMetric[], colCount: number) {
  const rows: string[] = []
  let row = startRow
  const filler = Array.from({ length: colCount - 1 }, (_, index) =>
    emptyCell(`${String.fromCharCode(66 + index)}${row}`, STYLE.section),
  ).join('')
  rows.push(rowXml(row, 22, `${textCell(`A${row}`, title, STYLE.section)}${filler}`))
  row += 1
  rows.push(
    rowXml(
      row,
      20,
      `${textCell(`A${row}`, 'Metric', STYLE.header)}${textCell(`B${row}`, 'Value', STYLE.header)}`,
    ),
  )
  row += 1
  metrics.forEach((metric, index) => {
    const isOdd = index % 2 === 0
    rows.push(
      rowXml(
        row,
        20,
        `${textCell(`A${row}`, metric.label, isOdd ? STYLE.odd : STYLE.even)}${textCell(`B${row}`, metric.value, isOdd ? STYLE.oddValue : STYLE.evenValue)}`,
      ),
    )
    row += 1
  })
  return { rows: rows.join(''), nextRow: row }
}

function buildDashboardSheet(payload: ExportPayload) {
  const exportedAt = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const parts: string[] = [
    rowXml(
      1,
      28,
      `${textCell('A1', 'Service Marketplace Dashboard', STYLE.title)}${emptyCell('B1', STYLE.title)}`,
    ),
    rowXml(
      2,
      18,
      `${textCell('A2', 'Exported on', STYLE.metaLabel)}${textCell('B2', exportedAt, STYLE.metaValue)}`,
    ),
    rowXml(
      3,
      18,
      `${textCell('A3', 'Trend range', STYLE.metaLabel)}${textCell('B3', payload.rangeLabel, STYLE.metaValue)}`,
    ),
    rowXml(4, 10, `${emptyCell('A4', STYLE.default)}${emptyCell('B4', STYLE.default)}`),
  ]

  const services = metricBlock(5, 'Service Metrics', payload.serviceMetrics, 2)
  parts.push(services.rows)
  parts.push(
    rowXml(
      services.nextRow,
      10,
      `${emptyCell(`A${services.nextRow}`, STYLE.default)}${emptyCell(`B${services.nextRow}`, STYLE.default)}`,
    ),
  )
  const consultations = metricBlock(
    services.nextRow + 1,
    'Consultation Metrics',
    payload.consultationMetrics,
    2,
  )
  parts.push(consultations.rows)

  return worksheetXml({
    columns: `${colXml(1, 38)}${colXml(2, 24)}`,
    rows: parts.join(''),
    mergeRef: 'A1:B1',
    lastCell: `B${consultations.nextRow - 1}`,
  })
}

function buildTrendsSheet(payload: ExportPayload) {
  const headerRow = 4
  const parts: string[] = [
    rowXml(
      1,
      28,
      `${textCell('A1', 'Service & Consultation Trends', STYLE.title)}${emptyCell('B1', STYLE.title)}${emptyCell('C1', STYLE.title)}${emptyCell('D1', STYLE.title)}`,
    ),
    rowXml(
      2,
      18,
      `${textCell('A2', 'Trend range', STYLE.metaLabel)}${textCell('B2', payload.rangeLabel, STYLE.metaValue)}${emptyCell('C2', STYLE.default)}${emptyCell('D2', STYLE.default)}`,
    ),
    rowXml(
      3,
      10,
      `${emptyCell('A3', STYLE.default)}${emptyCell('B3', STYLE.default)}${emptyCell('C3', STYLE.default)}${emptyCell('D3', STYLE.default)}`,
    ),
    rowXml(
      headerRow,
      20,
      `${textCell('A4', 'Period', STYLE.header)}${textCell('B4', 'Consultations Completed', STYLE.header)}${textCell('C4', 'Services Delivered', STYLE.header)}${textCell('D4', 'Revenue (₹)', STYLE.header)}`,
    ),
  ]

  if (payload.trendPoints.length === 0) {
    parts.push(
      rowXml(
        5,
        20,
        `${textCell('A5', 'No trend data available.', STYLE.muted)}${emptyCell('B5', STYLE.default)}${emptyCell('C5', STYLE.default)}${emptyCell('D5', STYLE.default)}`,
      ),
    )
  } else {
    payload.trendPoints.forEach((point, index) => {
      const row = headerRow + 1 + index
      const isOdd = index % 2 === 0
      const labelStyle = isOdd ? STYLE.odd : STYLE.even
      const valueStyle = isOdd ? STYLE.oddValue : STYLE.evenValue
      parts.push(
        rowXml(
          row,
          20,
          `${textCell(`A${row}`, point.month, labelStyle)}${numberCell(`B${row}`, point.consultationsCompleted ?? 0, valueStyle)}${numberCell(`C${row}`, point.servicesDelivered ?? 0, valueStyle)}${numberCell(`D${row}`, point.revenue ?? 0, STYLE.currency)}`,
        ),
      )
    })
  }

  const lastRow = payload.trendPoints.length === 0 ? 5 : headerRow + payload.trendPoints.length
  return worksheetXml({
    columns: `${colXml(1, 16)}${colXml(2, 28)}${colXml(3, 24)}${colXml(4, 18)}`,
    rows: parts.join(''),
    mergeRef: 'A1:D1',
    lastCell: `D${lastRow}`,
  })
}

export function exportServiceMarketplaceExcel(payload: ExportPayload) {
  const zipBytes = buildZip([
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Dashboard" sheetId="1" r:id="rId1"/>
    <sheet name="Trends" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    { name: 'xl/styles.xml', content: stylesXml() },
    { name: 'xl/worksheets/sheet1.xml', content: buildDashboardSheet(payload) },
    { name: 'xl/worksheets/sheet2.xml', content: buildTrendsSheet(payload) },
  ])

  const blob = new Blob([zipBytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'service_marketplace_dashboard.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportServiceMarketplace(payload: ExportPayload, format = 'excel') {
  const normalized = String(format || 'excel')
    .toLowerCase()
    .trim()
  if (normalized === 'excel' || normalized === 'xlsx' || normalized === 'xls') {
    exportServiceMarketplaceExcel(payload)
    return
  }

  await exportSheetsToFile(
    [
      {
        name: 'Service Metrics',
        headers: ['Metric', 'Value'],
        rows: payload.serviceMetrics.map((metric) => [metric.label, metric.value]),
      },
      {
        name: 'Consultation Metrics',
        headers: ['Metric', 'Value'],
        rows: payload.consultationMetrics.map((metric) => [metric.label, metric.value]),
      },
      {
        name: 'Trends',
        headers: ['Period', 'Consultations Completed', 'Services Delivered', 'Revenue'],
        rows: payload.trendPoints.map((point) => [
          point.month,
          point.consultationsCompleted,
          point.servicesDelivered,
          point.revenue,
        ]),
      },
    ].filter((sheet) => sheet.rows.length > 0),
    'service_marketplace_dashboard',
    format,
  )
}
