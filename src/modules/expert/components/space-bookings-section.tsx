import { useState } from 'react'
import { MoreVertical } from 'lucide-react'

import { useSpaceBookings } from '../hooks/use-venues'
import type { SpaceBookingStatus } from '../api/venue-api'
import { cn } from '@/shared/lib/cn'

const TABS: { key: SpaceBookingStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'booked', label: 'Booked' },
]

const statusBadgeClass = (status: string) => {
  if (status === 'completed') return 'bg-emerald-500/15 text-emerald-400'
  if (status === 'ongoing') return 'bg-[#E0A263]/20 text-[#E0A263]'
  return 'bg-emerald-500/15 text-emerald-400'
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)
}

type SpaceBookingsSectionProps = {
  spaceId?: string
}

export function SpaceBookingsSection({ spaceId }: SpaceBookingsSectionProps) {
  const [status, setStatus] = useState<SpaceBookingStatus>('all')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useSpaceBookings(spaceId, status, page, 20)

  const rows = data?.data ?? []
  const pagination = data?.meta?.pagination
  const totalPages = Math.max(1, pagination?.totalPages ?? 1)
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const visiblePages = getVisiblePages(currentPage, totalPages)

  const changePage = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), totalPages)
    if (clamped !== currentPage) setPage(clamped)
  }

  return (
    <section className="rounded-brand-lg bg-brand-surface border border-white/5 p-5">
      <h2 className="text-body-md mb-4 font-bold text-white">Bookings</h2>

      <div className="mb-4 flex items-center gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setStatus(tab.key)
              setPage(1)
            }}
            className={cn(
              'relative px-4 pb-3 text-[13px] font-semibold transition-colors',
              status === tab.key
                ? 'text-white after:absolute after:right-4 after:bottom-0 after:left-4 after:h-0.5 after:rounded-full after:bg-[#E0A263]'
                : 'text-muted hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left">
          <thead>
            <tr className="border-b border-white/10 text-[11px] text-[#777]">
              <th className="px-3 py-3 font-medium">Event ID</th>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Event Date</th>
              <th className="px-3 py-3 font-medium">Start Time</th>
              <th className="px-3 py-3 font-medium">End Time</th>
              <th className="px-3 py-3 font-medium">Total Attendees</th>
              <th className="px-3 py-3 font-medium">Checked-in Attendees</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Event Type</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`sk-${index}`} className="border-b border-white/5">
                  <td colSpan={10} className="px-3 py-3">
                    <div className="h-8 animate-pulse rounded bg-white/5" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={10} className="text-muted px-3 py-8 text-center text-sm">
                  Failed to load bookings. Please try again.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-muted px-3 py-8 text-center text-sm">
                  No bookings found for this space.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 text-[13px] text-white">
                  <td className="px-3 py-3.5 font-medium">{row.eventId}</td>
                  <td className="px-3 py-3.5">{row.name}</td>
                  <td className="px-3 py-3.5 text-[#999]">{row.eventDate || '—'}</td>
                  <td className="px-3 py-3.5 text-[#999]">{row.startTime || '—'}</td>
                  <td className="px-3 py-3.5 text-[#999]">{row.endTime || '—'}</td>
                  <td className="px-3 py-3.5 text-[#999]">{row.totalAttendees}</td>
                  <td className="px-3 py-3.5 text-[#999]">{row.checkedInAttendees}</td>
                  <td className="px-3 py-3.5">
                    <span
                      className={cn(
                        'inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold',
                        statusBadgeClass(row.status),
                      )}
                    >
                      {row.statusLabel}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-[#999]">{row.eventType}</td>
                  <td className="px-3 py-3.5">
                    <button
                      type="button"
                      className="text-[#777] hover:text-white"
                      aria-label="Booking actions"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-4 sm:flex-row">
        <button
          type="button"
          onClick={() => changePage(currentPage - 1)}
          disabled={isLoading || currentPage <= 1}
          className="table-pagination-btn"
        >
          Previous
        </button>

        <nav className="flex items-center gap-2" aria-label="Bookings pagination">
          {visiblePages.map((pageNumber, index) => {
            const previousPage = visiblePages[index - 1]
            const hasGap = previousPage !== undefined && pageNumber - previousPage > 1
            const isActive = currentPage === pageNumber

            return (
              <div key={pageNumber} className="flex items-center gap-2">
                {hasGap && <span className="text-brand-muted px-1">...</span>}
                <button
                  type="button"
                  onClick={() => changePage(pageNumber)}
                  disabled={isLoading}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Go to page ${pageNumber}`}
                  className={cn('table-pagination-btn', isActive && 'table-pagination-page-active')}
                >
                  {pageNumber.toString().padStart(2, '0')}
                </button>
              </div>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => changePage(currentPage + 1)}
          disabled={isLoading || currentPage >= totalPages}
          className="table-pagination-btn"
        >
          Next
        </button>
      </div>
    </section>
  )
}
