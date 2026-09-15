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
    'inline-flex h-5 min-w-[50px] items-center justify-center rounded-[10px] px-2.5 text-[10px] leading-[14px] font-semibold tracking-normal',
    status === 'pending' || status === 'in_review'
      ? 'bg-amber-500/10 text-amber-500'
      : status === 'live'
        ? 'bg-[#00A63E33] text-[#00A63E]'
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
    'inline-flex h-5 min-w-[50px] items-center justify-center rounded-[10px] px-2.5 text-center text-[10px] leading-[14px] font-semibold tracking-normal',
    venueStatus === 'active' ? 'bg-[#00A63E33] text-[#00A63E]' : 'bg-slate-500/10 text-slate-400',
  )
