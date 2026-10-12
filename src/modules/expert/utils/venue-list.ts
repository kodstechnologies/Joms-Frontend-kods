import type { Venue, VenueRawStatus, VenueStatus } from '../type/venue'
import { cn } from '@/shared/lib/cn'

// The public venue id is used for API calls. The internal id is used only when that is missing.
export const getVenueApiId = (venue: Pick<Venue, '_id' | 'venueId'>) => venue.venueId || venue._id

export const getVenueDisplayId = (venue: Pick<Venue, 'venueid' | 'venueId' | '_id'>) =>
  venue.venueid || venue.venueId || venue._id

export const getVenuePartnerId = (venue: Pick<Venue, 'ownerId' | 'partnerId'>) =>
  venue.ownerId || venue.partnerId || ''

// The space code is SP plus the last part of the id, kept to three digits. A bad id produces no code.
export const formatVenueSpaceCode = (spaceObjectId?: string | null) => {
  if (!spaceObjectId) return null
  const hex = String(spaceObjectId).replace(/[^0-9a-fA-F]/g, '')
  const parsed = hex ? Number.parseInt(hex.slice(-6) || hex, 16) : Number.NaN
  if (!Number.isFinite(parsed)) return null
  return `SP${String(parsed % 1000).padStart(3, '0')}`
}

// A stored code of SPNaN is ignored and the code is built from the space id instead.
export const getVenueDisplaySpaceId = (venue: Pick<Venue, 'spaceid' | 'spaceId'>) => {
  if (venue.spaceid && venue.spaceid !== 'SPNaN') return venue.spaceid
  return formatVenueSpaceCode(venue.spaceId) || '—'
}

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

// Only an active venue is shown as active. Every other status is shown as inactive.
export const getVenueDisplayStatus = (venue: Pick<Venue, 'venueStatus'>): VenueRawStatus =>
  venue.venueStatus === 'active' ? 'active' : 'inactive'

export const getVenueDisplayStatusClassName = (venueStatus: VenueRawStatus) =>
  cn(
    'inline-flex h-5 min-w-[50px] items-center justify-center rounded-[10px] px-2.5 text-center text-[10px] leading-[14px] font-semibold tracking-normal',
    venueStatus === 'active' ? 'bg-[#00A63E33] text-[#00A63E]' : 'bg-slate-500/10 text-slate-400',
  )
