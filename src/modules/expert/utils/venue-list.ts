import type { Venue, VenueRawStatus, VenueStatus } from '../type/venue'
import { cn } from '@/shared/lib/cn'

export const getVenueApiId = (venue: Pick<Venue, '_id' | 'venueId'>) => venue.venueId || venue._id

export const getVenueDisplayId = (venue: Pick<Venue, 'venueid' | 'venueId' | '_id'>) =>
  venue.venueid || venue.venueId || venue._id

export const getVenuePartnerId = (venue: Pick<Venue, 'ownerId' | 'partnerId'>) =>
  venue.ownerId || venue.partnerId || ''

export const getVenueDisplaySpaceId = (venue: Pick<Venue, 'spaceid'>) => venue.spaceid || '—'

export const getVenueApiSpaceId = (venue: Pick<Venue, 'spaceId'>) => venue.spaceId || null

export const formatVenueStatus = (status: VenueStatus) => status.replace(/_/g, ' ')

export const getVenueStatusClassName = (status: VenueStatus) =>
  cn(
    'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
    status === 'pending' || status === 'in_review'
      ? 'bg-amber-500/10 text-amber-500'
      : status === 'live'
        ? 'bg-green-500/10 text-green-500'
        : status === 'suspended'
          ? 'bg-purple-500/10 text-purple-400'
          : status === 'deleted'
            ? 'bg-red-500/10 text-red-400'
            : 'bg-slate-500/10 text-slate-500',
  )

export const getVenueDisplayStatus = (venue: Pick<Venue, 'venueStatus'>): VenueRawStatus =>
  venue.venueStatus === 'active' ? 'active' : 'inactive'

export const getVenueDisplayStatusClassName = (venueStatus: VenueRawStatus) =>
  cn(
    'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
    venueStatus === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400',
  )
