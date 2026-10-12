import { SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '@/modules/expert/config/service-management-table-columns.config'
import { SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG } from '@/modules/expert/config/service-performance-table-columns.config'
import {
  VENUE_DELETED_TABLE_COLUMNS_CATALOG,
  VENUE_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  VENUE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
  VENUE_REPORTED_TABLE_COLUMNS_CATALOG,
  VENUE_SUSPENDED_TABLE_COLUMNS_CATALOG,
} from '@/modules/expert/config/venue-management-table-columns.config'
import { SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '@/modules/expert/config/service-category-management-table-columns.config'
import { VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '@/modules/expert/config/venue-category-management-table-columns.config'

function kebabToCamel(value: string) {
  return value.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
}

export function buildDefaultColumnSortMap(columnIds: string[]) {
  return Object.fromEntries(columnIds.map((id) => [id, kebabToCamel(id)]))
}

export function buildCatalogSortFieldMap(
  catalog: ReadonlyArray<{ id: string }>,
  overrides: Record<string, string | null | undefined> = {},
) {
  const base = buildDefaultColumnSortMap(catalog.map((column) => column.id))
  return { ...base, ...overrides }
}

export function buildDefaultTableSortFieldMap(columnIds: string[]) {
  return buildDefaultColumnSortMap(columnIds)
}

export const EXPERT_COLUMN_SORT_FIELDS: Record<string, string> = {
  'expert-id': 'expertId',
  name: 'name',
  email: 'email',
  phone: 'phone',
  profession: 'profession',
  category: 'category',
  'service-type': 'serviceType',
  status: 'status',
  'membership-type': 'membershipType',
  'created-by': 'createdBy',
  'created-at': 'createdAt',
  'last-active': 'lastActive',
  designation: 'designation',
  city: 'city',
  state: 'state',
  'years-of-experience': 'yearsOfExperience',
  'digilocker-verification': 'digilockerVerification',
  'kyc-status': 'kycStatus',
  'phone-verification': 'phoneVerification',
  'email-verification': 'emailVerification',
  'compliance-status': 'complianceStatus',
  'average-rating': 'averageRating',
  'total-clients-served': 'totalClientsServed',
  'total-earnings': 'totalEarnings',
  'total-services-listed': 'totalServicesListed',
  'total-consultations-listed': 'totalConsultationsListed',
  'consultation-listed': 'consultationListed',
  'micro-website-url': 'microWebsiteUrl',
  'total-orders-completed-services': 'totalOrdersCompletedServices',
  'ongoing-service-orders': 'ongoingServiceOrders',
  'completed-consultation-bookings': 'completedConsultationBookings',
  'scheduled-consultation-bookings': 'scheduledConsultationBookings',
  'total-tickets-disputes': 'totalTicketsDisputes',
  'open-tickets-disputes': 'openTicketsDisputes',
  'resolved-tickets': 'resolvedTickets',
  'repeat-clients': 'repeatClients',
  'repeat-client-percent': 'repeatClientPercent',
  'quotations-received': 'quotationsReceived',
  'proposals-created': 'proposalsCreated',
  'proposals-accepted': 'proposalsAccepted',
  'proposals-declined': 'proposalsDeclined',
  'custom-orders-created': 'customOrdersCreated',
  'completed-custom-orders': 'completedCustomOrders',
  'client-satisfaction-score': 'clientSatisfactionScore',
  'net-promoter-score': 'netPromoterScore',
  reason: 'reason',
  'admin-notes': 'adminNotes',
  'deactivation-type': 'deactivationType',
  'deleted-by': 'deletedBy',
  'deleted-at': 'deletedAt',
  'reported-at': 'reportedAt',
  'submitted-at': 'submittedAt',
  'approval-stage': 'approvalStage',
  'approval-status': 'approvalStatus',
  'digilocker-status': 'digilockerStatus',
  'gst-status': 'gstStatus',
  'undertaking-status': 'undertakingStatus',
  'missing-documents': 'missingDocuments',
  'assigned-reviewer': 'assignedReviewer',
  'sla-days-pending': 'slaDaysPending',
  priority: 'priority',
  'escalation-status': 'escalationStatus',
  'last-updated-at': 'lastUpdatedAt',
  'suspension-status': 'suspensionStatus',
  'suspension-type': 'suspensionType',
  'suspension-reason': 'suspensionReason',
  'suspended-by': 'suspendedBy',
  'suspended-at': 'suspendedAt',
  'suspension-until': 'suspensionUntil',
  'suspension-duration': 'suspensionDuration',
  'linked-report-cases': 'linkedReportCases',
  'active-orders-impacted': 'activeOrdersImpacted',
  'scheduled-consultations': 'scheduledConsultations',
  'microsite-status': 'micrositeStatus',
  'last-communication': 'lastCommunication',
  'reinstatement-eligible': 'reinstatementEligible',
}

export const EXPERT_AUTH_SORT_FIELDS: Record<string, string> = {
  name: 'fullname',
  email: 'email',
  phone: 'phone',
  'service-type': 'servicetype',
  'created-at': 'createdAt',
  'last-active': 'lastActiveAt',
  'last-updated-at': 'updatedAt',
  'deleted-at': 'deactivatedAt',
  'submitted-at': 'createdAt',
}

export const SERVICE_COLUMN_SORT_FIELDS = buildCatalogSortFieldMap(
  SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  {
    name: 'title',
    type: 'serviceType',
    category: 'categoryName',
    'sub-category': 'subCategoryName',
    'pricing-model': 'pricingType',
    'expert-id': 'expertName',
    'service-id': 'createdAt',
    status: 'status',
    'created-at': 'createdAt',
    'last-updated-at': 'lastUpdatedAt',
    'submitted-at': 'submittedAt',
    'approved-at': 'approvedAt',
    'deleted-at': 'deletedAt',
    'suspended-at': 'suspendedAt',
  },
)

export const SERVICE_PERFORMANCE_COLUMN_SORT_FIELDS = buildCatalogSortFieldMap(
  SERVICE_PERFORMANCE_TABLE_COLUMNS_CATALOG,
  {
    'listing-type': 'engagementType',
  },
)

export const VENUE_COLUMN_SORT_FIELDS = buildCatalogSortFieldMap(
  VENUE_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  {
    name: 'title',
    'venue-id': 'createdAt',
    'expert-id': 'expertName',
    category: 'categoryName',
    'sub-category': 'subCategoryName',
    'created-at': 'createdAt',
    'last-updated-at': 'lastUpdatedAt',
    'submitted-at': 'submittedAt',
    'approved-at': 'approvedAt',
    'deleted-at': 'deletedAt',
    'suspended-at': 'suspendedAt',
  },
)

const VENUE_SUB_LIST_SORT_OVERRIDES: Record<string, string> = {
  'venue-name': 'title',
  'venue-id': 'createdAt',
  'venue-category': 'categoryName',
  'submitted-at': 'submittedAt',
  'suspended-at': 'suspendedAt',
  'deleted-at': 'deletedAt',
  'reported-at': 'createdAt',
}

export const VENUE_PENDING_SORT_FIELDS = buildCatalogSortFieldMap(
  VENUE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
  VENUE_SUB_LIST_SORT_OVERRIDES,
)

export const VENUE_REPORTED_SORT_FIELDS = buildCatalogSortFieldMap(
  VENUE_REPORTED_TABLE_COLUMNS_CATALOG,
  VENUE_SUB_LIST_SORT_OVERRIDES,
)

export const VENUE_SUSPENDED_SORT_FIELDS = buildCatalogSortFieldMap(
  VENUE_SUSPENDED_TABLE_COLUMNS_CATALOG,
  VENUE_SUB_LIST_SORT_OVERRIDES,
)

export const VENUE_DELETED_SORT_FIELDS = buildCatalogSortFieldMap(
  VENUE_DELETED_TABLE_COLUMNS_CATALOG,
  VENUE_SUB_LIST_SORT_OVERRIDES,
)

export const VENUE_REJECTED_SORT_FIELDS: Record<string, string> = {
  venueid: 'createdAt',
  venueName: 'title',
  eventType: 'eventType',
  spaceid: 'spaceid',
  spaceName: 'spaceName',
  venueCategory: 'categoryName',
}

export const SERVICE_CATEGORY_COLUMN_SORT_FIELDS = buildCatalogSortFieldMap(
  SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG,
)

export const VENUE_CATEGORY_COLUMN_SORT_FIELDS = buildCatalogSortFieldMap(
  VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG,
)

export function resolveExpertSortField(columnId: string) {
  return EXPERT_COLUMN_SORT_FIELDS[columnId] ?? columnId
}

export function resolveExpertAuthSortField(columnId: string) {
  return EXPERT_AUTH_SORT_FIELDS[columnId] ?? resolveExpertSortField(columnId)
}
