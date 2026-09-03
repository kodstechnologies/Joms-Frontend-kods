import { deriveMetricExports } from '@/shared/lib/define-metrics-catalog'

export const FINANCE_ESCROW_MODULE_KEY = 'finance-escrow'

export type FinanceEscrowMetricCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export const FINANCE_ESCROW_METRICS_CATALOG: FinanceEscrowMetricCatalogItem[] = [
  {
    id: 'active-escrows',
    label: 'Active Escrows',
    type: 'Count',
    description: 'Open escrow holds',
    defaultActive: true,
  },
  {
    id: 'held-amount',
    label: 'Held Amount',
    type: 'Currency',
    description: 'Total held in escrow',
    defaultActive: true,
  },
  {
    id: 'released-mtd',
    label: 'Released (MTD)',
    type: 'Currency',
    description: 'Released this month',
    defaultActive: true,
  },
  {
    id: 'disputed',
    label: 'Disputed',
    type: 'Count',
    description: 'Disputed escrows',
    defaultActive: true,
  },
]

const derived = deriveMetricExports(FINANCE_ESCROW_METRICS_CATALOG)
export const FINANCE_ESCROW_MAX_ACTIVE_METRICS = derived.maxActive
export const DEFAULT_FINANCE_ESCROW_METRIC_IDS = derived.defaultIds
