import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { SpaceBookingsSection } from '../../components/space-bookings-section'
import { useVenueFullView } from '../../hooks/use-venues'

export function SpaceBookingsPage() {
  const navigate = useNavigate()
  const { venueId, spaceId } = useParams<{ venueId: string; spaceId: string }>()
  const { data } = useVenueFullView(venueId, spaceId)

  const fullView = data?.data
  const venueName = fullView?.overview.venue.name || 'Venue'
  const spaceName = useMemo(() => {
    const detailName = fullView?.overview.space?.name
    const summary = fullView?.spaces.find((item) => item.spaceId === spaceId)
    return detailName || summary?.spaceName || 'Space'
  }, [fullView, spaceId])

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
          <span>View Bookings</span>
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
              { label: 'Bookings', isActive: true },
            ]}
          />
        </div>
      </header>

      <SpaceBookingsSection spaceId={spaceId} />
    </div>
  )
}
