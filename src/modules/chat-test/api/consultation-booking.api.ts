import axios from 'axios'
import { env } from '@/config/env'

export type ConsultationProjectStatus = 'all' | 'newservice' | 'ongoing' | 'completed'

export type ConsultationScreenHint = 'consultation_request' | 'consultation_join' | 'completed'

export type ConsultationProjectCard = {
  id: string
  engagementType: 'consultation_booking'
  title: string
  category: string
  client: {
    userId: string | null
    username: string
    avatar?: string | null
    phone_e164?: string | null
  }
  partnerId: string
  startAt: string
  endAt: string
  durationMinutes: number | null
  price: number
  currency: string
  projectStatus: Exclude<ConsultationProjectStatus, 'all'>
  paymentStatus: 'pending' | 'paid' | null
  consultationBookingId: string
  consultationId: string | null
  lastActivityAt: string | null
  navigation: {
    screenHint: ConsultationScreenHint
    threadId: string | null
  }
}

export type ConsultationSlot = {
  startAt: string
  endAt: string
  startTime: string
  endTime: string
  durationMinutes: number
  price: number
  currency: string
}

export type ConsultationBooking = {
  _id: string
  partnerId: string
  consultationId: string | null
  title: string
  category?: string
  startAt: string
  endAt: string
  durationMinutes?: number | null
  price: number
  currency?: string
  paymentStatus: 'pending' | 'paid'
  paidAt?: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  sessionOutline?: string | null
  jitsiRoomName?: string | null
  threadId?: string | null
  client?: {
    id?: string | null
    name?: string
    avatar?: string | null
    phone?: string | null
    email?: string | null
  }
  projectStatus?: ConsultationProjectStatus
  screenHint?: ConsultationScreenHint
  canJoin?: boolean
  canMessage?: boolean
  join?: Record<string, unknown> | null
  navigation?: {
    screenHint: ConsultationScreenHint
    threadId: string | null
  }
}

export type JitsiJoinResponse = {
  canJoin: boolean
  join: Record<string, unknown> | null
  sessionId: string
  startAt: string
  endAt: string
}

function client(token: string) {
  return axios.create({
    baseURL: env.serviceApiBaseUrl,
    timeout: 60000,
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function listPartnerConsultationProjects(
  token: string,
  status: ConsultationProjectStatus = 'all',
) {
  const res = await client(token).get('/quotations/projects/consultations', {
    params: { status, limit: 50 },
  })
  return (res.data?.data || []) as ConsultationProjectCard[]
}

export async function getConsultationSlots(
  token: string,
  consultationId: string,
  params: { date: string; durationMinutes: number },
) {
  const res = await client(token).get(
    `/consultation-bookings/consultations/${consultationId}/slots`,
    { params },
  )
  return res.data?.data as {
    consultationId: string
    partnerId: string
    date: string
    durationMinutes: number
    slots: ConsultationSlot[]
  }
}

export async function createConsultationBooking(
  token: string,
  body: {
    consultationId: string
    startAt: string
    endAt: string
    durationMinutes: number
  },
) {
  const res = await client(token).post('/consultation-bookings', body)
  return res.data?.data as ConsultationBooking
}

export async function payConsultationBooking(token: string, bookingId: string) {
  const res = await client(token).post(`/consultation-bookings/${bookingId}/pay`)
  return res.data?.data as ConsultationBooking
}

export async function getConsultationBooking(token: string, bookingId: string) {
  const res = await client(token).get(`/consultation-bookings/${bookingId}`)
  return res.data?.data as ConsultationBooking
}

export async function joinConsultationBooking(token: string, bookingId: string) {
  const res = await client(token).get(`/consultation-bookings/${bookingId}/join`)
  return res.data?.data as JitsiJoinResponse
}

/** Partner chat-test: move slot to now so Join unlocks */
export async function testStartConsultationJoinWindow(token: string, bookingId: string) {
  const res = await client(token).post(`/consultation-bookings/${bookingId}/test-start-join`)
  return res.data?.data as ConsultationBooking
}

export async function testSetupConsultationBooking(
  partnerToken: string,
  consultationId: string,
  body?: {
    weeklyAvailability?: Array<{ day: string; from: string; to: string }>
  },
) {
  const res = await client(partnerToken).post(
    `/consultation-bookings/test-setup/${consultationId}`,
    body || {},
  )
  return res.data?.data as {
    consultationId: string
    status: string
    mode: string
    weeklyAvailability: Array<{ day: string; from: string; to: string }>
    message: string
  }
}

export async function linkConsultationBookingThread(
  token: string,
  bookingId: string,
  threadId: string,
) {
  const res = await client(token).post(`/consultation-bookings/${bookingId}/link-thread`, {
    threadId,
  })
  return res.data?.data as ConsultationBooking
}

export async function listMyConsultationBookings(token: string) {
  const res = await client(token).get('/consultation-bookings/mine', { params: { limit: 50 } })
  return (res.data?.data || []) as ConsultationBooking[]
}
