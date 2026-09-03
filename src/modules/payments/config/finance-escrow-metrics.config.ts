export const FINANCE_ESCROW_MODULE_KEY = 'finance-escrow'

export type FinanceEscrowMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

type MetricRow = [id: string, label: string, type: string, description: string, active?: boolean]

const METRIC_ROWS: MetricRow[] = [
  ['active-escrows', 'Active Escrows', 'Count', 'Open escrow holds', true],
  ['held-amount', 'Held Amount', 'Currency', 'Total held in escrow', true],
  ['released-mtd', 'Released (MTD)', 'Currency', 'Released this month', true],
  ['disputed', 'Disputed', 'Count', 'Disputed escrows', true],
]

export const FINANCE_ESCROW_METRICS_CATALOG: FinanceEscrowMetricCatalogItem[] = METRIC_ROWS.map(
  ([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }),
)

export const FINANCE_ESCROW_MAX_ACTIVE_METRICS = FINANCE_ESCROW_METRICS_CATALOG.length

export const DEFAULT_FINANCE_ESCROW_METRIC_IDS = FINANCE_ESCROW_METRICS_CATALOG.filter(
  (metric) => metric.defaultActive,
).map((metric) => metric.id)
