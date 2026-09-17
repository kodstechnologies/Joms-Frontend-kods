import type { MembershipPlan } from '../types/membership'
import { fetchMemberships } from '../api/membership-api'
import {
  formatCurrency,
  formatMembershipDate,
  getDiscountedPrice,
  getFeatureLines,
  getStatusLabel,
  getTypeLabel,
} from './membership-format'
import { exportDataToFile, exportDisplayValue } from '@/shared/utils/export-utils'

const EXPORT_PAGE_SIZE = 1000

function priceForCycle(plan: MembershipPlan, cycleName: string) {
  const item = plan.pricing.find(
    (entry) => entry.billingCycleName.toLowerCase() === cycleName.toLowerCase(),
  )
  if (!item) return ''
  return formatCurrency(getDiscountedPrice(item.price, item.discount))
}

export function buildMembershipPlanExportTable(plans: MembershipPlan[]) {
  const cycleNames = [
    ...new Set(plans.flatMap((plan) => plan.pricing.map((item) => item.billingCycleName))),
  ]

  const headers = [
    'Plan ID',
    'Plan Name',
    'Type',
    'Status',
    'Version',
    ...cycleNames.map((cycle) => `${cycle} Price`),
    'Features',
    'Trial Period (Days)',
    'Auto Renew',
    'Allow Upgrades',
    'Allow Downgrades',
    'Validity Start',
    'Validity End',
    'Pause From',
    'Pause To',
    'Total Subscriptions',
    'Weekly Subscriptions',
    '3 Months Subscriptions',
    '6 Months Subscriptions',
    'Created At',
    'Updated At',
    'Updated By',
  ]

  const rows = plans.map((plan) => [
    exportDisplayValue(plan.planId),
    exportDisplayValue(plan.planName),
    getTypeLabel(plan.type),
    getStatusLabel(plan.status),
    exportDisplayValue(plan.version),
    ...cycleNames.map((cycle) => priceForCycle(plan, cycle)),
    getFeatureLines(plan.features).join('; '),
    exportDisplayValue(plan.trialPeriodDays),
    exportDisplayValue(plan.enableAutoRenew),
    exportDisplayValue(plan.allowPlanUpgrades),
    exportDisplayValue(plan.allowDowngradePlans),
    formatMembershipDate(plan.validity?.startDate),
    formatMembershipDate(plan.validity?.endDate),
    formatMembershipDate(plan.pauseInfo?.fromDate),
    formatMembershipDate(plan.pauseInfo?.toDate),
    exportDisplayValue(plan.subscriptionStats?.total ?? 0),
    exportDisplayValue(plan.subscriptionStats?.weekly ?? 0),
    exportDisplayValue(plan.subscriptionStats?.threeMonths ?? 0),
    exportDisplayValue(plan.subscriptionStats?.sixMonths ?? 0),
    formatMembershipDate(plan.createdAt),
    formatMembershipDate(plan.updatedAt),
    exportDisplayValue(plan.updatedBy),
  ])

  return { headers, rows }
}

export async function fetchAllMembershipPlansForExport(params: {
  search?: string
  status?: MembershipPlan['status']
  type?: MembershipPlan['type']
}) {
  const firstPage = await fetchMemberships({
    type: params.type ?? 'expert',
    search: params.search,
    status: params.status,
    page: 1,
    limit: EXPORT_PAGE_SIZE,
  })

  const plans = [...(firstPage.data?.memberships ?? [])]
  const totalPages = Math.max(firstPage.data?.meta?.totalPages ?? 1, 1)

  for (let page = 2; page <= totalPages; page += 1) {
    const nextPage = await fetchMemberships({
      type: params.type ?? 'expert',
      search: params.search,
      status: params.status,
      page,
      limit: EXPORT_PAGE_SIZE,
    })
    plans.push(...(nextPage.data?.memberships ?? []))
  }

  return plans
}

export async function exportMembershipPlansToExcel(plans: MembershipPlan[], format = 'excel') {
  const { headers, rows } = buildMembershipPlanExportTable(plans)
  const date = new Date().toISOString().slice(0, 10)
  await exportDataToFile(headers, rows, format, `membership_plans_${date}`)
}
