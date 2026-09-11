import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import type { Service } from '../type/service'
import type { ServiceReportItem } from '../components/service-report-detail-modal'
import { renderTableDateTimeCell as formatDateTime } from '@/shared/components/table/table-datetime-column'
import { getManagementStatusDisplay } from './management-status'

const dash = (value: unknown): ReactNode => {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

const formatMoney = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value))
}

const formatPercent = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `${Number(value)}%`
}

const formatRating = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `★${Number(value).toFixed(1)}`
}

const textCol = (
  id: string,
  header: string,
  accessor: (service: Service) => unknown,
): ColumnDef<Service> => ({
  id,
  header,
  accessorFn: (row) => (accessor(row) ?? '') as string | number,
  cell: ({ row }) => dash(accessor(row.original)),
})

const dateCol = (
  id: string,
  header: string,
  accessor: (service: Service) => string | null | undefined,
): ColumnDef<Service> => ({
  id,
  header,
  accessorFn: (row) => accessor(row) ?? '',
  cell: ({ row }) => formatDateTime(accessor(row.original)),
})

const moneyCol = (
  id: string,
  header: string,
  accessor: (service: Service) => number | null | undefined,
): ColumnDef<Service> => ({
  id,
  header,
  accessorFn: (row) => accessor(row) ?? 0,
  cell: ({ row }) => formatMoney(accessor(row.original)),
})

const percentCol = (
  id: string,
  header: string,
  accessor: (service: Service) => number | null | undefined,
): ColumnDef<Service> => ({
  id,
  header,
  accessorFn: (row) => accessor(row) ?? 0,
  cell: ({ row }) => formatPercent(accessor(row.original)),
})

const ratingCol = (
  id: string,
  header: string,
  accessor: (service: Service) => number | null | undefined,
): ColumnDef<Service> => ({
  id,
  header,
  accessorFn: (row) => accessor(row) ?? 0,
  cell: ({ row }) => formatRating(accessor(row.original)),
})

const badgeCol = (
  id: string,
  header: string,
  accessor: (service: Service) => string | null | undefined,
): ColumnDef<Service> => ({
  id,
  header,
  accessorFn: (row) => accessor(row) ?? '',
  cell: ({ row }) => {
    const value = accessor(row.original)
    if (!value) return '—'
    return (
      <span className="rounded bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
        {String(value)}
      </span>
    )
  },
})

const countCol = (
  id: string,
  header: string,
  accessor: (service: Service) => number | null | undefined,
): ColumnDef<Service> => ({
  id,
  header,
  accessorFn: (row) => accessor(row) ?? 0,
  cell: ({ row }) => {
    const value = accessor(row.original)
    if (value == null || Number.isNaN(Number(value))) return '—'
    return Number(value).toLocaleString('en-IN')
  },
})

export function buildServiceDataColumnsById(): Record<string, ColumnDef<Service>> {
  return {
    'service-id': {
      id: 'service-id',
      header: 'Listing ID',
      accessorFn: (row) => row.serviceid || row._id || '',
      cell: ({ row }) => (
        <span className="ui-table-id uppercase">{row.original.serviceid || row.original._id}</span>
      ),
    },
    name: {
      id: 'name',
      header: 'Listing Name',
      accessorFn: (row) => row.title ?? '',
      cell: ({ row }) => <span className="font-medium text-white">{dash(row.original.title)}</span>,
    },
    type: badgeCol('type', 'Listing Type', (s) => s.serviceType),
    category: textCol('category', 'Category', (s) => s.categoryName),
    'sub-category': textCol('sub-category', 'Sub Category', (s) => s.subCategoryName),
    status: {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => row.status ?? '',
      cell: ({ row }) => {
        const { label, className } = getManagementStatusDisplay(row.original.status, {
          isSuspend: row.original.isSuspend,
          isDeleted: row.original.status === 'deleted',
        })
        return <span className={className}>{label}</span>
      },
    },
    promoted: badgeCol('promoted', 'Promoted', (s) => s.promoted),
    'pricing-model': badgeCol(
      'pricing-model',
      'Pricing Model',
      (s) => s.pricingModel ?? s.pricingType,
    ),
    'tier-name': textCol('tier-name', 'Tier Name', (s) => s.tierName),
    pricing: moneyCol('pricing', 'Base Price', (s) => s.pricing),
    'platform-discount-percent': percentCol(
      'platform-discount-percent',
      'Platform Discount %',
      (s) => s.platformDiscountPercent,
    ),
    'final-price': moneyCol('final-price', 'Final Price', (s) => s.finalPrice),
    'platform-discount-active': badgeCol(
      'platform-discount-active',
      'Platform Discount Active',
      (s) => s.platformDiscountActive,
    ),
    'expert-id': {
      id: 'expert-id',
      header: 'Expert ID',
      accessorFn: (row) => row.expertid ?? '',
      cell: ({ row }) => (
        <span className="ui-table-id">{row.original.expertid || 'Not provided'}</span>
      ),
    },
    'expert-name': textCol('expert-name', 'Expert Name', (s) => s.expertName),
    'expert-rating': ratingCol('expert-rating', 'Expert Rating', (s) => s.expertRating),
    'expert-account-status': badgeCol(
      'expert-account-status',
      'Expert Account Status',
      (s) => s.expertAccountStatus,
    ),
    'total-transactions': countCol(
      'total-transactions',
      'Total Transactions',
      (s) => s.totalTransactions,
    ),
    'scheduled-bookings': countCol(
      'scheduled-bookings',
      'Scheduled Bookings',
      (s) => s.scheduledBookings,
    ),
    'in-progress-orders': countCol(
      'in-progress-orders',
      'In Progress Orders',
      (s) => s.inProgressOrders,
    ),
    'completed-transactions': countCol(
      'completed-transactions',
      'Completed Transactions',
      (s) => s.completedTransactions,
    ),
    'cancelled-terminated-transactions': countCol(
      'cancelled-terminated-transactions',
      'Cancelled / Terminated Transactions',
      (s) => s.cancelledTerminatedTransactions,
    ),
    'total-disputes': countCol('total-disputes', 'Total Disputes', (s) => s.totalDisputes),
    'client-raised-disputes': countCol(
      'client-raised-disputes',
      'Client Raised Disputes',
      (s) => s.clientRaisedDisputes,
    ),
    'expert-raised-disputes': countCol(
      'expert-raised-disputes',
      'Expert Raised Disputes',
      (s) => s.expertRaisedDisputes,
    ),
    'repeat-booking-percent': percentCol(
      'repeat-booking-percent',
      'Repeat Booking %',
      (s) => s.repeatBookingPercent,
    ),
    'average-rating': ratingCol('average-rating', 'Average Rating', (s) => s.averageRating),
    'total-revenue': moneyCol('total-revenue', 'Total Revenue', (s) => s.totalRevenue),
    'cancellation-rate': percentCol(
      'cancellation-rate',
      'Cancellation Rate',
      (s) => s.cancellationRate,
    ),
    'created-at': dateCol('created-at', 'Created At', (s) => s.createdAt),
    'approved-at': dateCol('approved-at', 'Approved At', (s) => s.approvedAt),
    'submitted-at': dateCol('submitted-at', 'Submitted At', (s) => s.submittedAt),
    'last-updated-at': dateCol('last-updated-at', 'Last Updated At', (s) => s.lastUpdatedAt),
    'suspension-reason': textCol(
      'suspension-reason',
      'Suspension Reason',
      (s) => s.suspensionReason,
    ),
    'suspension-type': badgeCol('suspension-type', 'Suspension Type', (s) => s.suspensionType),
    'suspended-at': dateCol('suspended-at', 'Suspended At', (s) => s.suspendedAt),
    'suspension-until': dateCol('suspension-until', 'Suspension Until', (s) => s.suspensionUntil),
    'suspended-by': textCol('suspended-by', 'Suspended By', (s) => s.suspendedBy),
    'compliance-status': badgeCol(
      'compliance-status',
      'Compliance Status',
      (s) => s.complianceStatus,
    ),
    'deleted-by': textCol('deleted-by', 'Deleted By', (s) => s.deletedBy),
    'deleted-by-id': textCol('deleted-by-id', 'Deleted By ID', (s) => s.deletedById),
    'deletion-reason': textCol(
      'deletion-reason',
      'Deletion Reason',
      (s) => s.deletionReason || s.reason,
    ),
    'deleted-at': dateCol('deleted-at', 'Deleted At', (s) => s.deletedAt),
    'restore-eligible': badgeCol('restore-eligible', 'Restore Eligible', (s) => s.restoreEligible),
  }
}

export function buildServiceReportDataColumnsById(): Record<string, ColumnDef<ServiceReportItem>> {
  return {
    'report-id': {
      id: 'report-id',
      header: 'Report ID',
      accessorFn: (row) => row.reportId ?? '',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#E5B54E]">
          {row.original.reportId || '—'}
        </span>
      ),
    },
    'listing-id': {
      id: 'listing-id',
      header: 'Listing ID',
      accessorFn: (row) => row.serviceId ?? '',
      cell: ({ row }) => <span className="ui-table-id">{dash(row.original.serviceId)}</span>,
    },
    'listing-name': {
      id: 'listing-name',
      header: 'Listing Name',
      accessorFn: (row) => row.serviceTitle ?? '',
      cell: ({ row }) => (
        <span className="font-medium text-white">{dash(row.original.serviceTitle)}</span>
      ),
    },
    'reported-at': {
      id: 'reported-at',
      header: 'Reported At',
      accessorFn: (row) => row.createdAt || row.submittedAt || '',
      cell: ({ row }) => formatDateTime(row.original.createdAt || row.original.submittedAt),
    },
    'report-reason': {
      id: 'report-reason',
      header: 'Report Reason',
      accessorFn: (row) => row.issueType ?? '',
      cell: ({ row }) => (
        <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400">
          {row.original.issueType || '—'}
        </span>
      ),
    },
    'reported-by': {
      id: 'reported-by',
      header: 'Reported By',
      accessorFn: (row) => row.reporterType ?? '',
      cell: ({ row }) => dash(row.original.reporterType),
    },
    'reporter-id': {
      id: 'reporter-id',
      header: 'Reporter ID',
      accessorFn: (row) => row.reporterId ?? '',
      cell: ({ row }) => <span className="ui-table-id">{dash(row.original.reporterId)}</span>,
    },
    'case-status': {
      id: 'case-status',
      header: 'Case Status',
      accessorFn: (row) => row.investigationStatus || 'New',
      cell: ({ row }) => {
        const status = row.original.investigationStatus || 'New'
        return (
          <span className="rounded bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
            {status}
          </span>
        )
      },
    },
    'assigned-admin': {
      id: 'assigned-admin',
      header: 'Assigned Admin',
      accessorFn: (row) => row.investigatingAdmin ?? '',
      cell: ({ row }) => dash(row.original.investigatingAdmin),
    },
  }
}

export function pickServicePreferenceColumns<T>(
  dataColumnsById: Record<string, ColumnDef<T>>,
  visibleIds: string[],
  fallbackIds: string[],
): ColumnDef<T>[] {
  const ids = visibleIds.length ? visibleIds : fallbackIds
  return ids.map((id) => dataColumnsById[id]).filter(Boolean) as ColumnDef<T>[]
}
