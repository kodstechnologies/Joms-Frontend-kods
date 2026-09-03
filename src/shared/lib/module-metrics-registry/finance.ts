import {
  FINANCE_REVENUE_MODULE_KEY,
  FINANCE_REVENUE_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-revenue-table-columns.config'
import {
  FINANCE_SERVICES_MODULE_KEY,
  FINANCE_SERVICES_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-services-table-columns.config'
import {
  FINANCE_VENUES_MODULE_KEY,
  FINANCE_VENUES_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-venues-table-columns.config'
import {
  FINANCE_TAX_MODULE_KEY,
  FINANCE_TAX_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-tax-table-columns.config'
import {
  FINANCE_RECONCILIATION_MODULE_KEY,
  FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-reconciliation-table-columns.config'
import {
  FINANCE_DASHBOARD_MAX_ACTIVE_METRICS,
  FINANCE_DASHBOARD_METRICS_CATALOG,
  FINANCE_DASHBOARD_MODULE_KEY,
} from '@/modules/payments/config/finance-dashboard-metrics.config'
import {
  FINANCE_REFUNDS_MAX_ACTIVE_METRICS,
  FINANCE_REFUNDS_METRICS_CATALOG,
  FINANCE_REFUNDS_MODULE_KEY,
} from '@/modules/payments/config/finance-refunds-metrics.config'
import { FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG } from '@/modules/payments/config/finance-refunds-table-columns.config'
import {
  FINANCE_ESCROW_MAX_ACTIVE_METRICS,
  FINANCE_ESCROW_METRICS_CATALOG,
  FINANCE_ESCROW_MODULE_KEY,
} from '@/modules/payments/config/finance-escrow-metrics.config'
import { FINANCE_ESCROW_TABLE_COLUMNS_CATALOG } from '@/modules/payments/config/finance-escrow-table-columns.config'
import {
  FINANCE_PAYOUTS_MODULE_KEY,
  FINANCE_PAYOUTS_TABLE_COLUMNS_CATALOG,
  FINANCE_PAYOUTS_MAX_ACTIVE_METRICS,
  FINANCE_PAYOUTS_METRICS_CATALOG,
} from '@/modules/payments/config/finance-payouts-table-columns.config'
import {
  FINANCE_INVOICES_MODULE_KEY,
  FINANCE_INVOICES_TABLE_COLUMNS_CATALOG,
  FINANCE_INVOICES_MAX_ACTIVE_METRICS,
  FINANCE_INVOICES_METRICS_CATALOG,
} from '@/modules/payments/config/finance-invoices-table-columns.config'
import {
  FINANCE_MEMBERSHIPS_MODULE_KEY,
  FINANCE_MEMBERSHIPS_TABLE_COLUMNS_CATALOG,
} from '@/modules/payments/config/finance-memberships-table-columns.config'
import { mapColumnsCatalog, mapMetricsCatalog, type ModuleMetricsDefinition } from './types'

type ColumnCatalog = Parameters<typeof mapColumnsCatalog>[0]
type MetricCatalog = Parameters<typeof mapMetricsCatalog>[0]

/** Finance list pages that only customize table columns. */
function financeColumnsPage(
  moduleKey: string,
  moduleName: string,
  returnTo: string,
  columns: ColumnCatalog,
): ModuleMetricsDefinition {
  return {
    moduleKey,
    moduleName,
    returnTo,
    columns: mapColumnsCatalog(columns),
  }
}

/** Finance surfaces that expose KPI metrics (+ optional columns). */
function financeMetricsPage(
  moduleKey: string,
  moduleName: string,
  returnTo: string,
  maxActiveMetrics: number,
  metrics: MetricCatalog,
  columns?: ColumnCatalog,
): ModuleMetricsDefinition {
  return {
    moduleKey,
    moduleName,
    returnTo,
    maxActiveMetrics,
    metrics: mapMetricsCatalog(metrics),
    ...(columns ? { columns: mapColumnsCatalog(columns) } : {}),
  }
}

export const FINANCE_MODULE_METRICS: Record<string, ModuleMetricsDefinition> = {
  'finance-dashboard': financeMetricsPage(
    FINANCE_DASHBOARD_MODULE_KEY,
    'Finance Dashboard',
    '/finance/dashboard',
    FINANCE_DASHBOARD_MAX_ACTIVE_METRICS,
    FINANCE_DASHBOARD_METRICS_CATALOG,
  ),
  'finance-venues': financeColumnsPage(
    FINANCE_VENUES_MODULE_KEY,
    'Finance Venues',
    '/finance/venues',
    FINANCE_VENUES_TABLE_COLUMNS_CATALOG,
  ),
  'finance-services': financeColumnsPage(
    FINANCE_SERVICES_MODULE_KEY,
    'Finance Services',
    '/finance/services',
    FINANCE_SERVICES_TABLE_COLUMNS_CATALOG,
  ),
  'finance-refunds': financeMetricsPage(
    FINANCE_REFUNDS_MODULE_KEY,
    'Refunds & Chargebacks',
    '/finance/refunds',
    FINANCE_REFUNDS_MAX_ACTIVE_METRICS,
    FINANCE_REFUNDS_METRICS_CATALOG,
    FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG,
  ),
  'finance-reconciliation': financeColumnsPage(
    FINANCE_RECONCILIATION_MODULE_KEY,
    'Reconciliation',
    '/finance/reconciliation',
    FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG,
  ),
  'finance-tax': financeColumnsPage(
    FINANCE_TAX_MODULE_KEY,
    'Tax Compliance',
    '/finance/tax',
    FINANCE_TAX_TABLE_COLUMNS_CATALOG,
  ),
  'finance-escrow': financeMetricsPage(
    FINANCE_ESCROW_MODULE_KEY,
    'Escrow Management',
    '/finance/escrow',
    FINANCE_ESCROW_MAX_ACTIVE_METRICS,
    FINANCE_ESCROW_METRICS_CATALOG,
    FINANCE_ESCROW_TABLE_COLUMNS_CATALOG,
  ),
  'finance-payouts': financeMetricsPage(
    FINANCE_PAYOUTS_MODULE_KEY,
    'Payout Management',
    '/finance/payouts',
    FINANCE_PAYOUTS_MAX_ACTIVE_METRICS,
    FINANCE_PAYOUTS_METRICS_CATALOG,
    FINANCE_PAYOUTS_TABLE_COLUMNS_CATALOG,
  ),
  'finance-invoices': financeMetricsPage(
    FINANCE_INVOICES_MODULE_KEY,
    'Invoices & Billing',
    '/finance/invoices',
    FINANCE_INVOICES_MAX_ACTIVE_METRICS,
    FINANCE_INVOICES_METRICS_CATALOG,
    FINANCE_INVOICES_TABLE_COLUMNS_CATALOG,
  ),
  'finance-memberships': financeColumnsPage(
    FINANCE_MEMBERSHIPS_MODULE_KEY,
    'Membership Revenue',
    '/finance/memberships',
    FINANCE_MEMBERSHIPS_TABLE_COLUMNS_CATALOG,
  ),
  'finance-revenue': financeColumnsPage(
    FINANCE_REVENUE_MODULE_KEY,
    'Revenue Overview',
    '/finance/revenue',
    FINANCE_REVENUE_TABLE_COLUMNS_CATALOG,
  ),
}
