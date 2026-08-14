import { fetchVenues } from '@/modules/expert/api/venue-api'
import type { Venue } from '@/modules/expert/type/venue'

export type HarnessVenue = {
  id: string
  name: string
  status: string
  ownerId?: string
  weekdayPrice?: number
}

export async function listAdminVenuesForHarness(limit = 20): Promise<HarnessVenue[]> {
  const res = await fetchVenues({ page: 1, limit })
  const rows = (res?.data || []) as Venue[]
  if (!Array.isArray(rows)) return []
  return rows
    .map((v) => {
      const id = String(v.venueId || v._id || '')
      if (!id) return null
      return {
        id,
        name: v.venueName || 'Venue',
        status: String(v.status || '—'),
        ownerId: v.ownerId || v.partnerId ? String(v.ownerId || v.partnerId) : undefined,
        weekdayPrice: typeof v.weekdayPrice === 'number' ? v.weekdayPrice : undefined,
      } as HarnessVenue
    })
    .filter(Boolean) as HarnessVenue[]
}
