export const FINANCE_MEMBERSHIPS_MODULE_KEY = 'finance-memberships'

export type FinanceMembershipsTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

export const FINANCE_MEMBERSHIPS_TABLE_COLUMNS_CATALOG: FinanceMembershipsTableColumnCatalogItem[] =
  [
    {
      id: 'membership-id',
      label: 'Membership ID',
      type: 'Text',
      description: 'Unique membership identifier',
      defaultVisible: true,
    },
    {
      id: 'member-name',
      label: 'Member Name',
      type: 'Text',
      description: 'Member display name',
      defaultVisible: true,
    },
    {
      id: 'membership-tier',
      label: 'Membership Tier',
      type: 'Text',
      description: 'Membership tier / plan',
      defaultVisible: true,
    },
    {
      id: 'plan-duration',
      label: 'Plan Duration',
      type: 'Text',
      description: 'Plan duration',
      defaultVisible: true,
    },
    {
      id: 'subscription-type',
      label: 'Subscription Type',
      type: 'Text',
      description: 'Subscription type',
      defaultVisible: false,
    },
    {
      id: 'start-date',
      label: 'Start Date',
      type: 'Date',
      description: 'Subscription start date',
      defaultVisible: true,
    },
    {
      id: 'end-date',
      label: 'End Date',
      type: 'Date',
      description: 'Subscription end date',
      defaultVisible: false,
    },
    {
      id: 'renewal-status',
      label: 'Renewal Status',
      type: 'Status',
      description: 'Renewal state',
      defaultVisible: false,
    },
    {
      id: 'amount-paid',
      label: 'Amount Paid',
      type: 'Currency',
      description: 'Amount paid',
      defaultVisible: true,
    },
    {
      id: 'tax',
      label: 'Tax',
      type: 'Currency',
      description: 'Tax amount',
      defaultVisible: false,
    },
    {
      id: 'net-amount',
      label: 'Net Amount',
      type: 'Currency',
      description: 'Net amount',
      defaultVisible: false,
    },
    {
      id: 'payment-gateway',
      label: 'Payment Gateway',
      type: 'Text',
      description: 'Payment gateway',
      defaultVisible: false,
    },
    {
      id: 'invoice-id',
      label: 'Invoice ID',
      type: 'Text',
      description: 'Related invoice',
      defaultVisible: false,
    },
    {
      id: 'auto-renewal',
      label: 'Auto Renewal',
      type: 'Status',
      description: 'Auto renewal enabled',
      defaultVisible: true,
    },
    {
      id: 'next-billing-date',
      label: 'Next Billing Date',
      type: 'Date',
      description: 'Next billing date',
      defaultVisible: true,
    },
    {
      id: 'status',
      label: 'Status',
      type: 'Status',
      description: 'Subscription status',
      defaultVisible: true,
    },
    // Legacy columns kept visible so existing UI does not empty
    {
      id: 'subscription-id',
      label: 'Subscription ID',
      type: 'Text',
      description: 'Legacy subscription identifier',
      defaultVisible: true,
    },
    {
      id: 'name',
      label: 'Name',
      type: 'Text',
      description: 'Legacy subscriber name',
      defaultVisible: true,
    },
    {
      id: 'plan-name',
      label: 'Plan Name',
      type: 'Text',
      description: 'Legacy plan name',
      defaultVisible: true,
    },
    {
      id: 'amount',
      label: 'Amount',
      type: 'Currency',
      description: 'Legacy subscription amount',
      defaultVisible: true,
    },
    {
      id: 'billing-cycle',
      label: 'Billing Cycle',
      type: 'Text',
      description: 'Legacy billing period',
      defaultVisible: true,
    },
    {
      id: 'next-billing',
      label: 'Next Billing',
      type: 'Date',
      description: 'Legacy next billing date',
      defaultVisible: true,
    },
  ]

export const DEFAULT_FINANCE_MEMBERSHIPS_VISIBLE_COLUMN_IDS =
  FINANCE_MEMBERSHIPS_TABLE_COLUMNS_CATALOG.filter((column) => column.defaultVisible).map(
    (column) => column.id,
  )
