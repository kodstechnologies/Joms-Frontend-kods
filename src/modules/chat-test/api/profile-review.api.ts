import axios from 'axios'
import { env } from '@/config/env'

export type EligibleReviewItem = {
  partnerId: string
  partnerName?: string
  engagementType: 'service_order' | 'custom_quotation'
  engagementId: string
  title: string
  serviceId?: string | null
  completedAt?: string
}

export type PartnerReview = {
  id: string
  rating: number
  text: string
  userName: string
  userAvatarUrl?: string | null
  engagementType: string
  engagementId: string
  title?: string
  serviceId?: string | null
  createdAt?: string
  relativeLabel?: string | null
}

export type PartnerInsights = {
  partnerUserId: string
  metrics: {
    response: {
      label: string | null
      avgMs: number | null
      sampleSize: number
      available?: boolean
    }
    speed: { label: string | null; avgMs: number | null; sampleSize: number; available?: boolean }
    nps: { score: number | null; available: boolean }
  }
  ratingsSummary: { average: number; count: number; available: boolean }
  reviews: PartnerReview[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

function client(token: string) {
  return axios.create({
    baseURL: env.profileApiBaseUrl,
    timeout: 30000,
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function listEligibleReviews(token: string, partnerId?: string) {
  const res = await client(token).get('/profile/reviews/eligible', {
    params: partnerId ? { partnerId } : {},
  })
  return (res.data?.data?.items || []) as EligibleReviewItem[]
}

export async function submitPartnerReview(
  token: string,
  body: {
    partnerId?: string
    engagementType: 'service_order' | 'custom_quotation'
    engagementId: string
    rating: number
    text?: string
    userName?: string
  },
) {
  const res = await client(token).post('/profile/reviews', body)
  return res.data?.data as PartnerReview
}

export async function getPartnerInsights(
  partnerUserId: string,
  params?: { sort?: 'recent' | 'top' | 'all'; page?: number; limit?: number },
  token?: string,
) {
  const res = await axios.get(`${env.profileApiBaseUrl}/profile/${partnerUserId}/insights`, {
    params: {
      sort: params?.sort || 'recent',
      page: params?.page || 1,
      limit: params?.limit || 20,
    },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    timeout: 30000,
  })
  return res.data?.data as PartnerInsights
}

export type EligibleVenueReviewItem = {
  venueId: string
  venueName?: string
  spaceId?: string | null
  spaceName?: string
  sessionId: string
  title: string
  partnerId: string
  completedAt?: string
}

export async function listEligibleVenueReviews(token: string, venueId?: string) {
  const res = await axios.get(`${env.venueApiBaseUrl}/venues/reviews/eligible`, {
    params: venueId ? { venueId } : {},
    headers: { Authorization: `Bearer ${token}` },
    timeout: 30000,
  })
  return (res.data?.data?.items || []) as EligibleVenueReviewItem[]
}

export async function submitVenueReview(
  token: string,
  venueId: string,
  body: { sessionId: string; rating: number; text?: string; userName?: string },
) {
  const res = await axios.post(`${env.venueApiBaseUrl}/venues/${venueId}/reviews`, body, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 30000,
  })
  return res.data?.data as PartnerReview
}

export async function getVenueInsights(
  venueId: string,
  params?: { sort?: 'recent' | 'top' | 'all'; page?: number; limit?: number },
) {
  const res = await axios.get(`${env.venueApiBaseUrl}/venues/${venueId}/insights`, {
    params: {
      sort: params?.sort || 'recent',
      page: params?.page || 1,
      limit: params?.limit || 20,
    },
    timeout: 30000,
  })
  return res.data?.data as PartnerInsights & {
    venueId: string
    ownerId?: string | null
    venueName?: string
  }
}
