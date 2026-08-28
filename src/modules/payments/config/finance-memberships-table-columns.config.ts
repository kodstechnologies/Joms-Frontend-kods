/**
 * Finance Memberships — Membership Revenue table column catalog.
 * Source: JOMS Excel → Finance Management → Membership Revenue.
 */

export const FINANCE_MEMBERSHIPS_MODULE_KEY = 'finance-memberships'

export type FinanceMembershipsTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

const col = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = false,
): FinanceMembershipsTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const FINANCE_MEMBERSHIPS_TABLE_COLUMNS_CATALOG: FinanceMembershipsTableColumnCatalogItem[] =
  [
    col('membership-id', 'Membership ID', 'Text', 'Unique membership identifier', true),
    col('member-name', 'Member Name', 'Text', 'Member display name', true),
    col('membership-tier', 'Membership Tier', 'Text', 'Membership tier / plan', true),
    col('plan-duration', 'Plan Duration', 'Text', 'Plan duration', true),
    col('subscription-type', 'Subscription Type', 'Text', 'Subscription type'),
    col('start-date', 'Start Date', 'Date', 'Subscription start date', true),
    col('end-date', 'End Date', 'Date', 'Subscription end date'),
    col('renewal-status', 'Renewal Status', 'Status', 'Renewal state'),
    col('amount-paid', 'Amount Paid', 'Currency', 'Amount paid', true),
    col('tax', 'Tax', 'Currency', 'Tax amount'),
    col('net-amount', 'Net Amount', 'Currency', 'Net amount'),
    col('payment-gateway', 'Payment Gateway', 'Text', 'Payment gateway'),
    col('invoice-id', 'Invoice ID', 'Text', 'Related invoice'),
    col('auto-renewal', 'Auto Renewal', 'Status', 'Auto renewal enabled', true),
    col('next-billing-date', 'Next Billing Date', 'Date', 'Next billing date', true),
    col('status', 'Status', 'Status', 'Subscription status', true),
    // Legacy columns kept visible so existing UI does not empty
    col('subscription-id', 'Subscription ID', 'Text', 'Legacy subscription identifier', true),
    col('name', 'Name', 'Text', 'Legacy subscriber name', true),
    col('plan-name', 'Plan Name', 'Text', 'Legacy plan name', true),
    col('amount', 'Amount', 'Currency', 'Legacy subscription amount', true),
    col('billing-cycle', 'Billing Cycle', 'Text', 'Legacy billing period', true),
    col('next-billing', 'Next Billing', 'Date', 'Legacy next billing date', true),
  ]

export const DEFAULT_FINANCE_MEMBERSHIPS_VISIBLE_COLUMN_IDS =
  FINANCE_MEMBERSHIPS_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
