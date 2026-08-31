import axios from 'axios'
import { env } from '@/config/env'

export type VenueBookingProjectStatus = 'all' | 'new' | 'ongoing' | 'completed' | 'cancelled'

export type VenueBookableVenue = {
  id: string
  name: string
  status?: string | null
  coverImageUrl?: string | null
  venueType?: string | null
  aboutVenue?: string | null
  ownerId?: string | null
}

export type VenueBookableSpace = {
  id: string
  name: string
  spaceType?: string | null
  capacityRange?: string | null
  guestLimit?: number | null
  approxPrice?: number | null
  weekdayPrice?: number | null
  weekendPrice?: number | null
  currency?: string
}

export type VenueBookingSlot = {
  startAt: string
  endAt: string
  startTime: string
  endTime: string
  durationMinutes: number
  price: number
  currency: string
}

export type VenueBookingDetail = {
  id: string
  engagementType: 'venue_booking'
  title: string
  category?: string
  startAt: string | null
  endAt: string | null
  timeLabel?: string | null
  price: number
  currency: string
  status?: string | null
  paymentStatus: 'pending' | 'paid' | 'failed'
  bookedBy?: 'partner' | 'user'
  projectStatus: Exclude<VenueBookingProjectStatus, 'all'>
  statusLabel?: string
  endsIn?: string | null
  notes?: string | null
  client?: {
    id?: string | null
    name?: string
    avatar?: string | null
    phone?: string | null
    email?: string | null
  }
  partnerId?: string | null
  venue?: {
    id: string
    name: string | null
    coverImageUrl?: string | null
  } | null
  space?: {
    id: string
    name: string | null
    spaceType?: string | null
  } | null
  navigation?: {
    screenHint: string
    sessionId: string
    venueId: string | null
    spaceId: string | null
  }
  createdAt?: string | null
  updatedAt?: string | null
}

function client(token: string) {
  return axios.create({
    baseURL: env.venueApiBaseUrl,
    timeout: 60000,
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function listBookableVenues(
  token: string,
  page = 1,
  limit = 20,
  scope: 'bookable' | 'all' = 'bookable',
) {
  const res = await client(token).get('/venue-bookings/venues', {
    params: { page, limit, scope },
  })
  return {
    data: (res.data?.data || []) as VenueBookableVenue[],
    meta: res.data?.meta as { pagination?: Record<string, number> } | undefined,
  }
}

/** Fetches every page so dev tools always show the full venue catalog. */
export async function listAllBookableVenues(token: string, scope: 'bookable' | 'all' = 'all') {
  const all: VenueBookableVenue[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const result = await listBookableVenues(token, page, 100, scope)
    all.push(...result.data)
    totalPages = result.meta?.pagination?.totalPages ?? 1
    page += 1
  }

  return all
}

export async function listBookableSpaces(token: string, venueId: string) {
  const res = await client(token).get(`/venue-bookings/venues/${venueId}/spaces`)
  return res.data?.data as {
    venue: VenueBookableVenue
    spaces: VenueBookableSpace[]
  }
}

export async function getSpaceSlots(
  token: string,
  spaceId: string,
  params: { date: string; durationMinutes?: number },
) {
  const res = await client(token).get(`/venue-bookings/spaces/${spaceId}/slots`, {
    params: {
      date: params.date,
      durationMinutes: params.durationMinutes ?? 60,
    },
  })
  return res.data?.data as {
    venueId: string
    spaceId: string
    date: string
    durationMinutes: number
    slots: VenueBookingSlot[]
  }
}

export async function createVenueBooking(
  token: string,
  body: {
    venueId: string
    spaceId: string
    startAt: string
    endAt: string
    title?: string
    notes?: string
    price?: number
  },
) {
  const res = await client(token).post('/venue-bookings', body)
  return res.data?.data as VenueBookingDetail
}

export async function payVenueBooking(token: string, bookingId: string) {
  const res = await client(token).post(`/venue-bookings/${bookingId}/pay`)
  return res.data?.data as VenueBookingDetail
}

export async function completeVenueBooking(token: string, bookingId: string) {
  const res = await client(token).post(`/venue-bookings/${bookingId}/complete`)
  return res.data?.data as VenueBookingDetail
}

export async function getVenueBooking(token: string, bookingId: string) {
  const res = await client(token).get(`/venue-bookings/${bookingId}`)
  return res.data?.data as VenueBookingDetail
}

export async function listMyVenueBookings(token: string, page = 1, limit = 20) {
  const res = await client(token).get('/venue-bookings/me', {
    params: { page, limit },
  })
  return {
    data: (res.data?.data || []) as VenueBookingDetail[],
    meta: res.data?.meta as { pagination?: Record<string, number> } | undefined,
  }
}
