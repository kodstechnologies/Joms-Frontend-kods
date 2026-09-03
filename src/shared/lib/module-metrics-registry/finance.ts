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
import type { ModuleMetricsDefinition } from './types'

export const FINANCE_MODULE_METRICS: Record<string, ModuleMetricsDefinition> = {
  'finance-dashboard': {
    moduleKey: FINANCE_DASHBOARD_MODULE_KEY,
    moduleName: 'Finance Dashboard',
    returnTo: '/finance/dashboard',
    maxActiveMetrics: FINANCE_DASHBOARD_MAX_ACTIVE_METRICS,
    metrics: FINANCE_DASHBOARD_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
  },
  'finance-venues': {
    moduleKey: FINANCE_VENUES_MODULE_KEY,
    moduleName: 'Finance Venues',
    returnTo: '/finance/venues',
    columns: FINANCE_VENUES_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-services': {
    moduleKey: FINANCE_SERVICES_MODULE_KEY,
    moduleName: 'Finance Services',
    returnTo: '/finance/services',
    columns: FINANCE_SERVICES_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-refunds': {
    moduleKey: FINANCE_REFUNDS_MODULE_KEY,
    moduleName: 'Refunds & Chargebacks',
    returnTo: '/finance/refunds',
    maxActiveMetrics: FINANCE_REFUNDS_MAX_ACTIVE_METRICS,
    metrics: FINANCE_REFUNDS_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-reconciliation': {
    moduleKey: FINANCE_RECONCILIATION_MODULE_KEY,
    moduleName: 'Reconciliation',
    returnTo: '/finance/reconciliation',
    columns: FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-tax': {
    moduleKey: FINANCE_TAX_MODULE_KEY,
    moduleName: 'Tax Compliance',
    returnTo: '/finance/tax',
    columns: FINANCE_TAX_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-escrow': {
    moduleKey: FINANCE_ESCROW_MODULE_KEY,
    moduleName: 'Escrow Management',
    returnTo: '/finance/escrow',
    maxActiveMetrics: FINANCE_ESCROW_MAX_ACTIVE_METRICS,
    metrics: FINANCE_ESCROW_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: FINANCE_ESCROW_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-payouts': {
    moduleKey: FINANCE_PAYOUTS_MODULE_KEY,
    moduleName: 'Payout Management',
    returnTo: '/finance/payouts',
    maxActiveMetrics: FINANCE_PAYOUTS_MAX_ACTIVE_METRICS,
    metrics: FINANCE_PAYOUTS_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: FINANCE_PAYOUTS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-invoices': {
    moduleKey: FINANCE_INVOICES_MODULE_KEY,
    moduleName: 'Invoices & Billing',
    returnTo: '/finance/invoices',
    maxActiveMetrics: FINANCE_INVOICES_MAX_ACTIVE_METRICS,
    metrics: FINANCE_INVOICES_METRICS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultActive: item.defaultActive,
    })),
    columns: FINANCE_INVOICES_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-memberships': {
    moduleKey: FINANCE_MEMBERSHIPS_MODULE_KEY,
    moduleName: 'Membership Revenue',
    returnTo: '/finance/memberships',
    columns: FINANCE_MEMBERSHIPS_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
  'finance-revenue': {
    moduleKey: FINANCE_REVENUE_MODULE_KEY,
    moduleName: 'Revenue Overview',
    returnTo: '/finance/revenue',
    columns: FINANCE_REVENUE_TABLE_COLUMNS_CATALOG.map((item) => ({
      id: item.id,
      label: item.label,
      type: item.type,
      description: item.description,
      defaultVisible: item.defaultVisible,
    })),
  },
}
