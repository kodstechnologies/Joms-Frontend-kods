import type { ExecutiveOverviewPayload } from '@/modules/dashboard/types/executive-overview'

const csvEscape = (value: string | number | null | undefined) => {
  const text = value == null ? '' : String(value)
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function buildExecutiveOverviewCsv(payload: ExecutiveOverviewPayload) {
  const lines: string[] = ['Section,Name,Value,Formatted']

  for (const [id, metric] of Object.entries(payload.metrics || {})) {
    lines.push(
      ['KPI', csvEscape(id), csvEscape(metric.value), csvEscape(metric.formatted)].join(','),
    )
  }

  for (const row of payload.engagement || []) {
    lines.push(
      ['Engagement', csvEscape(row.label), csvEscape(row.value), csvEscape(row.formatted)].join(
        ',',
      ),
    )
  }

  for (const row of payload.charts?.revenueMemberGrowth || []) {
    lines.push(
      [
        'Revenue & Member Growth',
        csvEscape(row.month),
        csvEscape(row.revenue),
        csvEscape(row.newMembers),
      ].join(','),
    )
  }

  for (const row of payload.charts?.membershipTrends || []) {
    lines.push(
      [
        'Membership Trends',
        csvEscape(row.month),
        csvEscape(`active=${row.active};expired=${row.expired};new=${row.new}`),
        '',
      ].join(','),
    )
  }

  for (const row of payload.charts?.conversionFunnel || []) {
    lines.push(['Conversion Funnel', csvEscape(row.stage), csvEscape(row.value), ''].join(','))
  }

  for (const row of payload.charts?.serviceTypeDistribution || []) {
    lines.push(
      ['Service type distribution', csvEscape(row.name), csvEscape(row.value), ''].join(','),
    )
  }

  return lines.join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
