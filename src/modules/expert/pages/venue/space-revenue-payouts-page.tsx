import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye } from 'lucide-react'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { useVenueFullView } from '../../hooks/use-venues'
import { useSpaceAnalytics } from '../../hooks/use-venue-analytics'
import { useFinancePayouts, useFinanceRevenue } from '@/modules/payments/hooks/use-finance'
import { formatDate, formatInr, mapPaymentToVenueRow } from '@/modules/payments/utils/finance-mappers'
import { statusBadgeClass } from '../../utils/payout-status'
import { cn } from '@/shared/lib/cn'

const PAGE_SIZE = 10

const titleCase = (value?: string | null) =>
  String(value || '—')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

export function SpaceRevenuePayoutsPage() {
  const navigate = useNavigate()
  const { venueId, spaceId } = useParams<{ venueId: string; spaceId: string }>()
  const [revenuePage, setRevenuePage] = useState(1)
  const [payoutPage, setPayoutPage] = useState(1)

  const { data: fullViewResponse } = useVenueFullView(venueId, spaceId)
  const analyticsQuery = useSpaceAnalytics(spaceId)

  const fullView = fullViewResponse?.data
  const venue = fullView?.overview.venue
  const venueName = venue?.name || 'Venue'
  const spaceName = useMemo(() => {
    const detailName = fullView?.overview.space?.name
    const summary = fullView?.spaces.find((item) => item.spaceId === spaceId)
    return detailName || summary?.spaceName || analyticsQuery.data?.spaceName || 'Space'
  }, [analyticsQuery.data?.spaceName, fullView, spaceId])

  const financeFilter = {
    module: 'venue',
    venueId: venueId || undefined,
    spaceId: spaceId || undefined,
    limit: PAGE_SIZE,
  }

  const revenueQuery = useFinanceRevenue(
    { ...financeFilter, page: revenuePage },
    Boolean(venueId && spaceId),
  )
  const payoutQuery = useFinancePayouts(
    { ...financeFilter, page: payoutPage },
    Boolean(spaceId),
  )

  const revenueRows = useMemo(
    () => (revenueQuery.data?.data?.rows ?? []).map(mapPaymentToVenueRow),
    [revenueQuery.data],
  )
  const payoutRows = payoutQuery.data?.data?.rows ?? []
  const revenuePages = Math.max(1, revenueQuery.data?.data?.meta?.totalPages ?? 1)
  const payoutPages = Math.max(1, payoutQuery.data?.data?.meta?.totalPages ?? 1)

  const overviewCards = (analyticsQuery.data?.overview ?? []).filter((card) =>
    /revenue|booking|event value|completed/i.test(card.label),
  )
  const cashFlow = analyticsQuery.data?.cashFlow ?? []
  const spacePath =
    venueId && spaceId ? `/venues/management/profile/${venueId}/space/${spaceId}` : '/venues/management'

  return (
    <div className="mx-auto flex max-w-[1210px] flex-col gap-5 pb-8">
      <header className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, spacePath)}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>View Revenue & Payouts</span>
        </button>
        <div className="pl-7">
          <PageBreadcrumb
            items={[
              { label: 'Venue Management', to: '/venues/management' },
              {
                label: venueName,
                to: venueId ? `/venues/management/profile/${venueId}` : undefined,
              },
              { label: spaceName, to: spacePath },
              { label: 'Revenue & Payouts', isActive: true },
            ]}
          />
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsQuery.isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`revenue-kpi-${index}`}
                className="h-24 animate-pulse rounded-brand-lg border border-white/5 bg-brand-surface"
              />
            ))
          : overviewCards.map((card) => (
              <article
                key={card.label}
                className="rounded-brand-lg border border-white/5 bg-brand-surface p-4"
              >
                <p className="text-[12px] text-[#999]">{card.label}</p>
                <p className="mt-2 text-[22px] font-bold text-white">{card.value}</p>
                {card.note ? <p className="mt-1 text-[11px] text-[#777]">{card.note}</p> : null}
              </article>
            ))}
      </section>

      <section className="rounded-brand-lg border border-white/5 bg-brand-surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-body-md font-bold text-white">Revenue</h2>
          <p className="text-[12px] text-[#777]">
            Lost to cancellations: {analyticsQuery.data?.cancellations.revenueLost || '₹0'}
          </p>
        </div>
        <FinanceTable
          isLoading={revenueQuery.isLoading}
          isError={revenueQuery.isError}
          emptyMessage="No revenue records for this space."
          errorMessage="Failed to load revenue records."
          columns={['Order', 'Booking', 'Client', 'Amount', 'Partner payout', 'Net revenue', 'Status', 'Date', '']}
          rows={revenueRows.map((row) => ({
            id: row.id,
            cells: [
              row.transactionId,
              row.bookingTitle,
              row.clientName,
              row.revenue,
              row.partnerPayout,
              row.netRevenue,
              row.status,
              row.transactionDate,
            ],
            onView: () => navigate(`/finance/revenue/${row.id}`),
          }))}
          page={Math.min(revenuePage, revenuePages)}
          totalPages={revenuePages}
          onPageChange={setRevenuePage}
        />
        {cashFlow.length > 0 ? (
          <div className="mt-5 border-t border-white/10 pt-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Cash flow</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-[#777]">
                    <th className="px-3 py-2 font-medium">Month</th>
                    <th className="px-3 py-2 font-medium">In</th>
                    <th className="px-3 py-2 font-medium">Out</th>
                    <th className="px-3 py-2 font-medium">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {cashFlow.map((point) => (
                    <tr key={point.month} className="border-b border-white/5 text-white">
                      <td className="px-3 py-2.5">{point.month}</td>
                      <td className="px-3 py-2.5 text-[#999]">{formatInr(point.in)}</td>
                      <td className="px-3 py-2.5 text-[#999]">{formatInr(point.out)}</td>
                      <td className="px-3 py-2.5">{formatInr(point.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-brand-lg border border-white/5 bg-brand-surface p-5">
        <h2 className="text-body-md mb-4 font-bold text-white">Payouts</h2>
        <FinanceTable
          isLoading={payoutQuery.isLoading}
          isError={payoutQuery.isError}
          emptyMessage="No payouts for this space."
          errorMessage="Failed to load payouts."
          columns={['Payout ID', 'Status', 'Gross', 'Net payable', 'Scheduled', 'Paid', '']}
          rows={payoutRows.map((row) => ({
            id: row._id,
            cells: [
              row.payoutId,
              titleCase(row.status),
              formatInr(row.fees?.grossAmount),
              formatInr(row.fees?.netPayable),
              formatDate(row.scheduledAt),
              formatDate(row.paidAt),
            ],
            statusClass: statusBadgeClass(row.status),
            statusIndex: 1,
            onView: () => navigate(`/finance/payouts/${row._id}`),
          }))}
          page={Math.min(payoutPage, payoutPages)}
          totalPages={payoutPages}
          onPageChange={setPayoutPage}
        />
      </section>
    </div>
  )
}

type FinanceTableRow = {
  id: string
  cells: string[]
  statusClass?: string
  statusIndex?: number
  onView: () => void
}

function FinanceTable({
  columns,
  rows,
  isLoading,
  isError,
  emptyMessage,
  errorMessage,
  page,
  totalPages,
  onPageChange,
}: {
  columns: string[]
  rows: FinanceTableRow[]
  isLoading: boolean
  isError: boolean
  emptyMessage: string
  errorMessage: string
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/10 text-[11px] text-[#777]">
              {columns.map((column) => (
                <th key={column || 'actions'} className="px-3 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`sk-${index}`} className="border-b border-white/5">
                  <td colSpan={columns.length} className="px-3 py-3">
                    <div className="h-8 animate-pulse rounded bg-white/5" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="text-brand-danger px-3 py-8 text-center">
                  {errorMessage}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-muted px-3 py-8 text-center">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 text-white">
                  {row.cells.map((cell, index) => (
                    <td key={`${row.id}-${index}`} className="px-3 py-3.5 text-[#ccc]">
                      {row.statusClass && index === row.statusIndex ? (
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                            row.statusClass,
                          )}
                        >
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-3.5">
                    <button
                      type="button"
                      onClick={row.onView}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#E0A263] hover:text-white"
                    >
                      <Eye className="size-3.5" aria-hidden="true" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          className="table-pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="text-[12px] text-[#999]">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="table-pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
