import { useNavigate, useParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'

import { useAdminConsultationBooking } from '../../hooks/use-consultation-drilldown'
import { EmptyState, ShimmerBlock } from '../../components/service-drilldown/drilldown-primitives'
import { DASH, formatDateTime } from '../../components/service-drilldown/drilldown-format'
import {
  DrilldownHeader,
  FileVaultButton,
  MonitorMessagesButton,
} from '../../components/service-drilldown/engagement-chrome'
import {
  consultationBookingFilesPath,
  consultationBookingMessagesPath,
  consultationPerformancePath,
} from '../../lib/service-navigation'

export function ConsultationBookingPage() {
  const {
    expertId = '',
    consultationId = '',
    bookingId = '',
  } = useParams<{
    expertId: string
    consultationId: string
    bookingId: string
  }>()
  const navigate = useNavigate()
  const bookingQuery = useAdminConsultationBooking(bookingId)
  const booking = bookingQuery.data?.data
  const expertName = booking?.expert?.name || 'Expert'
  const clientName = booking?.client.name || 'Client'

  return (
    <div className="flex w-full flex-col gap-6 pb-8 text-white">
      <DrilldownHeader
        title="Meeting Notes"
        onBack={() =>
          navigateBackOrFallback(navigate, consultationPerformancePath(expertId, consultationId))
        }
        crumbs={[
          { label: 'Expert Management', onClick: () => navigate('/experts/management') },
          { label: expertName, onClick: () => navigate(`/experts/management/profile/${expertId}`) },
          {
            label: 'Consultation Performance',
            onClick: () => navigate(consultationPerformancePath(expertId, consultationId)),
          },
          { label: booking?.title || 'Consultation' },
          { label: clientName },
          { label: 'Meeting Notes' },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <FileVaultButton
              onClick={() =>
                navigate(consultationBookingFilesPath(expertId, consultationId, bookingId))
              }
            />
            <MonitorMessagesButton
              onClick={() =>
                navigate(consultationBookingMessagesPath(expertId, consultationId, bookingId))
              }
            />
          </div>
        }
      />

      {bookingQuery.isLoading ? (
        <ShimmerBlock className="h-64 w-full" />
      ) : !booking ? (
        <EmptyState message="This booking could not be loaded." />
      ) : (
        <section className="rounded-2xl bg-[#141414] p-6">
          <h1 className="text-2xl font-semibold text-white">{booking.title}</h1>
          <p className="text-muted mt-1 text-sm">{booking.category}</p>
          <p className="text-muted mt-3 text-sm">
            {formatDateTime(booking.startAt)}
            {booking.durationLabel ? ` • ${booking.durationLabel}` : ''}
          </p>

          <div className="mt-8">
            <h2 className="text-body-sm mb-2 font-semibold text-white">Overview</h2>
            <p className="text-body-sm text-muted leading-relaxed whitespace-pre-wrap">
              {booking.overview || booking.notes || DASH}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-body-sm mb-2 font-semibold text-white">
              Key Discussion Highlights
            </h2>
            {(booking.highlights ?? []).length === 0 ? (
              <p className="text-body-sm text-muted">{DASH}</p>
            ) : (
              <ul className="text-body-sm text-muted list-disc space-y-1 pl-5">
                {(booking.highlights ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
