import { DUMMY_PUSH_TEST_IDS, type PushTestResolvedIds } from '../api/push-test-context.api'

export type PushNotifySource =
  | 'communication'
  | 'system'
  | 'booking'
  | 'kyc'
  | 'other'
  | 'membership'
  | 'listing'

export type PushNotificationFixture = {
  id: string
  label: string
  category: string
  eventType: string
  title: string
  body: string
  source: PushNotifySource
  sourceIdPrefix: string
  deepLink: {
    screen: string
    params: Record<string, string>
  }
}

/** @deprecated use DUMMY_PUSH_TEST_IDS from push-test-context.api */
export const PUSH_TEST_IDS = DUMMY_PUSH_TEST_IDS

export function buildPushNotificationFixtures(
  ids: PushTestResolvedIds = DUMMY_PUSH_TEST_IDS,
): PushNotificationFixture[] {
  return [
    {
      id: 'kyc-approved',
      label: 'KYC approved (concierge)',
      category: 'KYC',
      eventType: 'KYC_APPROVED',
      title: 'KYC approved',
      body: 'Your KYC verification has been approved. You can continue setting up your profile.',
      source: 'kyc',
      sourceIdPrefix: `concierge-kyc:${ids.partnerId}:approved:${ids.kycDocId}`,
      deepLink: {
        screen: 'kycStatus',
        params: { status: 'approved', partnerType: 'concierge' },
      },
    },
    {
      id: 'kyc-rejected',
      label: 'KYC rejected (concierge)',
      category: 'KYC',
      eventType: 'KYC_REJECTED',
      title: 'KYC not approved',
      body: 'Your KYC was not approved. Reason: Blurry ID document. Please update and resubmit.',
      source: 'kyc',
      sourceIdPrefix: `concierge-kyc:${ids.partnerId}:rejected:${ids.kycDocId}`,
      deepLink: {
        screen: 'kycStatus',
        params: {
          status: 'rejected',
          partnerType: 'concierge',
          rejectionReason: 'Blurry ID document',
        },
      },
    },
    {
      id: 'venue-kyc-approved',
      label: 'Venue KYC approved',
      category: 'KYC',
      eventType: 'VENUE_KYC_APPROVED',
      title: 'Venue KYC approved',
      body: 'Your venue KYC verification has been approved.',
      source: 'kyc',
      sourceIdPrefix: `venue-kyc:${ids.venuePartnerId}:approved:${ids.venueKycDocId}`,
      deepLink: {
        screen: 'kycStatus',
        params: { status: 'approved', partnerType: 'venue' },
      },
    },
    {
      id: 'venue-kyc-rejected',
      label: 'Venue KYC rejected',
      category: 'KYC',
      eventType: 'VENUE_KYC_REJECTED',
      title: 'Venue KYC not approved',
      body: 'Your venue KYC was not approved. Reason: GST certificate missing. Please update and resubmit.',
      source: 'kyc',
      sourceIdPrefix: `venue-kyc:${ids.venuePartnerId}:rejected:${ids.venueKycDocId}`,
      deepLink: {
        screen: 'kycStatus',
        params: {
          status: 'rejected',
          partnerType: 'venue',
          rejectionReason: 'GST certificate missing',
        },
      },
    },
    {
      id: 'service-approved',
      label: 'Service approved',
      category: 'Listing',
      eventType: 'SERVICE_APPROVED',
      title: 'Service approved',
      body: 'Your service "Logo Design Pack" is now live and visible to users.',
      source: 'listing',
      sourceIdPrefix: `service:${ids.serviceId}:approved`,
      deepLink: {
        screen: 'serviceListingDetail',
        params: { serviceId: ids.serviceId, status: 'approved' },
      },
    },
    {
      id: 'service-rejected',
      label: 'Service rejected',
      category: 'Listing',
      eventType: 'SERVICE_REJECTED',
      title: 'Service not approved',
      body: 'Your service "Logo Design Pack" was not approved. Reason: Incomplete deliverables description.',
      source: 'listing',
      sourceIdPrefix: `service:${ids.serviceId}:rejected`,
      deepLink: {
        screen: 'serviceListingDetail',
        params: { serviceId: ids.serviceId, status: 'rejected' },
      },
    },
    {
      id: 'consultation-approved',
      label: 'Consultation approved',
      category: 'Listing',
      eventType: 'CONSULTATION_APPROVED',
      title: 'Consultation approved',
      body: 'Your consultation "Career Guidance Call" is now live.',
      source: 'listing',
      sourceIdPrefix: `consultation:${ids.consultationId}:approved`,
      deepLink: {
        screen: 'consultationDetail',
        params: { consultationId: ids.consultationId, status: 'approved' },
      },
    },
    {
      id: 'consultation-rejected',
      label: 'Consultation rejected',
      category: 'Listing',
      eventType: 'CONSULTATION_REJECTED',
      title: 'Consultation not approved',
      body: 'Your consultation "Career Guidance Call" was not approved. Reason: Pricing options incomplete.',
      source: 'listing',
      sourceIdPrefix: `consultation:${ids.consultationId}:rejected`,
      deepLink: {
        screen: 'consultationDetail',
        params: { consultationId: ids.consultationId, status: 'rejected' },
      },
    },
    {
      id: 'service-request',
      label: 'New service request',
      category: 'Booking',
      eventType: 'SERVICE_REQUEST_RECEIVED',
      title: 'New service request',
      body: 'Vishal sent a new service request for "Project Aura".',
      source: 'booking',
      sourceIdPrefix: `quotation:${ids.quotationRequestId}:created`,
      deepLink: {
        screen: 'quotation_detail',
        params: {
          quotationRequestId: ids.quotationRequestId,
          screenHint: 'quotation_detail',
          itemType: 'service',
          itemId: ids.serviceId,
        },
      },
    },
    {
      id: 'consultation-booking',
      label: 'Consultation booking',
      category: 'Booking',
      eventType: 'CONSULTATION_REQUEST_RECEIVED',
      title: 'New consultation booking',
      body: 'Vishal booked "Career Guidance Call" for 30 minutes.',
      source: 'booking',
      sourceIdPrefix: `consultation-booking:${ids.consultationBookingId}:created`,
      deepLink: {
        screen: 'consultation_request',
        params: {
          consultationBookingId: ids.consultationBookingId,
          consultationId: ids.consultationId,
          screenHint: 'consultation_request',
        },
      },
    },
    {
      id: 'consultation-quotation',
      label: 'Consultation quotation request',
      category: 'Booking',
      eventType: 'CONSULTATION_REQUEST_RECEIVED',
      title: 'New consultation request',
      body: 'Vishal sent a new consultation request for "NDA Document Review".',
      source: 'booking',
      sourceIdPrefix: `quotation:${ids.consultQuotationId}:created`,
      deepLink: {
        screen: 'quotation_detail',
        params: {
          quotationRequestId: ids.consultQuotationId,
          screenHint: 'quotation_detail',
          itemType: 'consultation',
          itemId: ids.consultationId,
        },
      },
    },
    {
      id: 'proposal-milestone',
      label: 'Proposal accepted (milestone)',
      category: 'Proposal',
      eventType: 'PROPOSAL_ACCEPTED',
      title: 'Proposal accepted',
      body: 'Vishal accepted your proposal for "Project Aura".',
      source: 'booking',
      sourceIdPrefix: `proposal:${ids.proposalMilestoneId}:accepted`,
      deepLink: {
        screen: 'service_work_milestones',
        params: {
          proposalId: ids.proposalMilestoneId,
          quotationRequestId: ids.quotationRequestId,
          screenHint: 'service_work_milestones',
          paymentType: 'milestone',
        },
      },
    },
    {
      id: 'proposal-one-time',
      label: 'Proposal accepted (one-time → payment)',
      category: 'Proposal',
      eventType: 'PROPOSAL_ACCEPTED',
      title: 'Proposal accepted',
      body: 'Alex accepted your proposal for "NDA Document Review".',
      source: 'booking',
      sourceIdPrefix: `proposal:${ids.proposalOneTimeId}:accepted`,
      deepLink: {
        screen: 'payment',
        params: {
          proposalId: ids.proposalOneTimeId,
          quotationRequestId: ids.consultQuotationId,
          screenHint: 'payment',
          paymentType: 'one_time',
        },
      },
    },
    {
      id: 'venue-approved',
      label: 'Venue approved',
      category: 'Venue',
      eventType: 'VENUE_SPACE_APPROVED',
      title: 'Venue approved',
      body: 'Your venue "The Founders’ Circle" has been approved.',
      source: 'listing',
      sourceIdPrefix: `venue:${ids.venueId}:approved`,
      deepLink: {
        screen: 'venueDetail',
        params: { venueId: ids.venueId, status: 'approved' },
      },
    },
    {
      id: 'venue-rejected',
      label: 'Venue rejected',
      category: 'Venue',
      eventType: 'VENUE_SPACE_REJECTED',
      title: 'Venue not approved',
      body: 'Your venue "The Founders’ Circle" was not approved.',
      source: 'listing',
      sourceIdPrefix: `venue:${ids.venueId}:rejected`,
      deepLink: {
        screen: 'venueDetail',
        params: { venueId: ids.venueId, status: 'rejected' },
      },
    },
    {
      id: 'space-approved',
      label: 'Space approved',
      category: 'Venue',
      eventType: 'VENUE_SPACE_APPROVED',
      title: 'Space approved',
      body: 'Your space "Main Banquet Hall" has been approved.',
      source: 'listing',
      sourceIdPrefix: `space:${ids.spaceId}:approved`,
      deepLink: {
        screen: 'venueDetail',
        params: {
          venueId: ids.venueId,
          spaceId: ids.spaceId,
          status: 'approved',
        },
      },
    },
    {
      id: 'space-rejected',
      label: 'Space rejected',
      category: 'Venue',
      eventType: 'VENUE_SPACE_REJECTED',
      title: 'Space not approved',
      body: 'Your space "Main Banquet Hall" was not approved. Reason: Capacity details incomplete.',
      source: 'listing',
      sourceIdPrefix: `space:${ids.spaceId}:rejected`,
      deepLink: {
        screen: 'venueDetail',
        params: {
          venueId: ids.venueId,
          spaceId: ids.spaceId,
          status: 'rejected',
        },
      },
    },
    {
      id: 'membership-3d',
      label: 'Membership expiring (3 days)',
      category: 'Membership',
      eventType: 'MEMBERSHIP_EXPIRING_3D',
      title: 'Membership expiring soon',
      body: 'Your membership expires in 3 days. Renew to stay live on JOMS.',
      source: 'membership',
      sourceIdPrefix: `membership:${ids.subscriptionId}:expiring-3d`,
      deepLink: {
        screen: 'membership',
        params: {
          subscriptionId: ids.subscriptionId,
          daysLeft: '3',
          expiresAt: ids.subscriptionExpiresAt,
        },
      },
    },
    {
      id: 'membership-1d',
      label: 'Membership expiring (1 day)',
      category: 'Membership',
      eventType: 'MEMBERSHIP_EXPIRING_1D',
      title: 'Membership expiring soon',
      body: 'Your membership expires in 1 day. Renew to stay live on JOMS.',
      source: 'membership',
      sourceIdPrefix: `membership:${ids.subscriptionId}:expiring-1d`,
      deepLink: {
        screen: 'membership',
        params: {
          subscriptionId: ids.subscriptionId,
          daysLeft: '1',
          expiresAt: ids.subscriptionExpiresAt,
        },
      },
    },
  ]
}

export const PUSH_NOTIFICATION_FIXTURES = buildPushNotificationFixtures()

export const PUSH_FIXTURE_CATEGORIES = [
  'All',
  ...Array.from(new Set(PUSH_NOTIFICATION_FIXTURES.map((item) => item.category))),
]
