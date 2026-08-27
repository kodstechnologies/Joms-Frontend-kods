import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import type { Expert } from '../type/expert'
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'
import { displayExpertValue } from '../pages/experts/expert-list-format'
import { ExpertStatusBadge } from '../pages/experts/expert-list-shared'

const dash = (value: unknown): ReactNode => {
  if (value === null || value === undefined || value === '') return '—'
  return displayExpertValue(value as string | number | null | undefined)
}

const formatDateTime = (value?: string | null) =>
  value ? <TableDateTimeCell value={value} /> : '—'

const formatMoney = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `₹${Number(value).toLocaleString('en-IN')}`
}

const formatPercent = (value?: number | null) => {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `${Number(value)}%`
}

const textCol = (
  id: string,
  header: string,
  accessor: (expert: Expert) => unknown,
): ColumnDef<Expert> => ({
  id,
  header,
  accessorFn: (row) => (accessor(row) ?? '') as string | number,
  cell: ({ row }) => dash(accessor(row.original)),
})

const dateCol = (
  id: string,
  header: string,
  accessor: (expert: Expert) => string | null | undefined,
): ColumnDef<Expert> => ({
  id,
  header,
  accessorFn: (row) => accessor(row) ?? '',
  cell: ({ row }) => formatDateTime(accessor(row.original)),
})

const statusCol = (
  id: string,
  header: string,
  accessor: (expert: Expert) => string | null | undefined,
): ColumnDef<Expert> => ({
  id,
  header,
  accessorFn: (row) => accessor(row) ?? '',
  cell: ({ row }) => {
    const value = accessor(row.original)
    if (!value) return '—'
    return (
      <span className="rounded bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
        {String(value)}
      </span>
    )
  },
})

/** Preference-driven column map for partner-based expert tables. */
export function buildExpertDataColumnsById(): Record<string, ColumnDef<Expert>> {
  return {
    'expert-id': textCol('expert-id', 'Expert ID', (e) => e.expertId),
    name: {
      id: 'name',
      header: 'Expert Name',
      accessorFn: (row) => row.name ?? '',
      cell: ({ row }) => <span className="font-medium text-white">{dash(row.original.name)}</span>,
    },
    email: textCol('email', 'Email ID', (e) => e.email),
    phone: textCol('phone', 'Phone Number', (e) => e.phone),
    profession: textCol('profession', 'Profession', (e) => e.profession),
    category: textCol('category', 'Category', (e) => e.category),
    'service-type': textCol('service-type', 'Service Type', (e) => e.serviceType),
    status: {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => row.status ?? '',
      cell: ({ row }) => <ExpertStatusBadge status={row.original.status} />,
    },
    'membership-type': textCol('membership-type', 'Membership Type', (e) => e.membershipType),
    'created-by': textCol('created-by', 'Created By', (e) => e.createdBy),
    'created-at': dateCol('created-at', 'Created At', (e) => e.createdAt),
    'last-active': dateCol('last-active', 'Last Active', (e) => e.lastActive),
    designation: textCol('designation', 'Designation', (e) => e.designation),
    city: textCol('city', 'City', (e) => e.city),
    state: textCol('state', 'State', (e) => e.state),
    'years-of-experience': textCol(
      'years-of-experience',
      'Years of Experience',
      (e) => e.yearsOfExperience,
    ),
    'digilocker-verification': statusCol(
      'digilocker-verification',
      'DigiLocker Verification',
      (e) => e.digilockerVerification || e.digilockerStatus,
    ),
    'kyc-status': statusCol('kyc-status', 'KYC Status', (e) => e.kycStatus),
    'phone-verification': statusCol(
      'phone-verification',
      'Phone Verification',
      (e) => e.phoneVerification,
    ),
    'email-verification': statusCol(
      'email-verification',
      'Email Verification',
      (e) => e.emailVerification,
    ),
    'compliance-status': statusCol(
      'compliance-status',
      'Compliance Status',
      (e) => e.complianceStatus,
    ),
    'average-rating': textCol('average-rating', 'Average Rating', (e) => e.averageRating),
    'total-clients-served': textCol(
      'total-clients-served',
      'Total Clients Served',
      (e) => e.totalClientsServed,
    ),
    'total-earnings': {
      id: 'total-earnings',
      header: 'Total Earnings',
      accessorFn: (row) => row.totalEarnings ?? 0,
      cell: ({ row }) => formatMoney(row.original.totalEarnings),
    },
    'total-services-listed': textCol(
      'total-services-listed',
      'Total Services Listed',
      (e) => e.totalServicesListed,
    ),
    'total-consultations-listed': textCol(
      'total-consultations-listed',
      'Total Consultations Listed',
      (e) => e.totalConsultationsListed,
    ),
    'consultation-listed': textCol(
      'consultation-listed',
      'Consultation Listed',
      (e) => e.consultationListed,
    ),
    'micro-website-url': textCol(
      'micro-website-url',
      'Micro Website URL',
      (e) => e.microWebsiteUrl,
    ),
    'total-orders-completed-services': textCol(
      'total-orders-completed-services',
      'Total Orders Completed (Services)',
      (e) => e.totalOrdersCompletedServices,
    ),
    'ongoing-service-orders': textCol(
      'ongoing-service-orders',
      'Ongoing Service Orders',
      (e) => e.ongoingServiceOrders,
    ),
    'completed-consultation-bookings': textCol(
      'completed-consultation-bookings',
      'Completed Consultation Bookings',
      (e) => e.completedConsultationBookings,
    ),
    'scheduled-consultation-bookings': textCol(
      'scheduled-consultation-bookings',
      'Scheduled Consultation Bookings',
      (e) => e.scheduledConsultationBookings,
    ),
    'total-tickets-disputes': textCol(
      'total-tickets-disputes',
      'Total Tickets / Disputes',
      (e) => e.totalTicketsDisputes,
    ),
    'open-tickets-disputes': textCol(
      'open-tickets-disputes',
      'Open Tickets / Disputes',
      (e) => e.openTicketsDisputes,
    ),
    'resolved-tickets': textCol('resolved-tickets', 'Resolved Tickets', (e) => e.resolvedTickets),
    'repeat-clients': textCol('repeat-clients', 'Repeat Clients', (e) => e.repeatClients),
    'repeat-client-percent': {
      id: 'repeat-client-percent',
      header: 'Repeat Client %',
      accessorFn: (row) => row.repeatClientPercent ?? 0,
      cell: ({ row }) => formatPercent(row.original.repeatClientPercent),
    },
    'quotations-received': textCol(
      'quotations-received',
      'Quotations Received',
      (e) => e.quotationsReceived,
    ),
    'proposals-created': textCol(
      'proposals-created',
      'Proposals Created',
      (e) => e.proposalsCreated,
    ),
    'proposals-accepted': textCol(
      'proposals-accepted',
      'Proposals Accepted',
      (e) => e.proposalsAccepted,
    ),
    'proposals-declined': textCol(
      'proposals-declined',
      'Proposals Declined',
      (e) => e.proposalsDeclined,
    ),
    'custom-orders-created': textCol(
      'custom-orders-created',
      'Custom Orders Created',
      (e) => e.customOrdersCreated,
    ),
    'completed-custom-orders': textCol(
      'completed-custom-orders',
      'Completed Custom Orders',
      (e) => e.completedCustomOrders,
    ),
    'client-satisfaction-score': {
      id: 'client-satisfaction-score',
      header: 'Client Satisfaction Score (CSAT)',
      accessorFn: (row) => row.clientSatisfactionScore ?? 0,
      cell: ({ row }) => formatPercent(row.original.clientSatisfactionScore),
    },
    'net-promoter-score': textCol(
      'net-promoter-score',
      'Net Promoter Score (NPS)',
      (e) => e.netPromoterScore,
    ),
    reason: textCol('reason', 'Reason', (e) => e.reason),
    'admin-notes': textCol('admin-notes', 'Admin Notes', (e) => e.adminNotes),
    'deactivation-type': textCol(
      'deactivation-type',
      'Deactivation Type',
      (e) => e.deactivationType,
    ),
    'deleted-by': textCol('deleted-by', 'Deleted By', (e) => e.deletedBy),
    'deleted-at': dateCol('deleted-at', 'Deleted At', (e) => e.deletedAt),
    'reported-at': dateCol('reported-at', 'Reported At', (e) => e.reportedAt),
    'submitted-at': dateCol('submitted-at', 'Submitted At', (e) => e.submittedAt),
    'approval-stage': textCol('approval-stage', 'Approval Stage', (e) => e.approvalStage),
    'approval-status': statusCol('approval-status', 'Approval Status', (e) => e.approvalStatus),
    'digilocker-status': statusCol(
      'digilocker-status',
      'DigiLocker Status',
      (e) => e.digilockerStatus,
    ),
    'gst-status': statusCol('gst-status', 'GST Status', (e) => e.gstStatus),
    'undertaking-status': statusCol(
      'undertaking-status',
      'Undertaking Status',
      (e) => e.undertakingStatus,
    ),
    'missing-documents': textCol(
      'missing-documents',
      'Missing Documents',
      (e) => e.missingDocuments,
    ),
    'assigned-reviewer': textCol(
      'assigned-reviewer',
      'Assigned Reviewer',
      (e) => e.assignedReviewer,
    ),
    'sla-days-pending': textCol('sla-days-pending', 'SLA (Days Pending)', (e) => e.slaDaysPending),
    priority: statusCol('priority', 'Priority', (e) => e.priority),
    'escalation-status': statusCol(
      'escalation-status',
      'Escalation Status',
      (e) => e.escalationStatus,
    ),
    'last-updated-at': dateCol('last-updated-at', 'Last Updated At', (e) => e.lastUpdatedAt),
    'suspension-status': statusCol(
      'suspension-status',
      'Suspension Status',
      (e) => e.suspensionStatus,
    ),
    'suspension-type': textCol('suspension-type', 'Suspension Type', (e) => e.suspensionType),
    'suspension-reason': textCol(
      'suspension-reason',
      'Suspension Reason',
      (e) => e.suspensionReason,
    ),
    'suspended-by': textCol('suspended-by', 'Suspended By', (e) => e.suspendedBy),
    'suspended-at': dateCol('suspended-at', 'Suspended At', (e) => e.suspendedAt),
    'suspension-until': dateCol('suspension-until', 'Suspension Until', (e) => e.suspensionUntil),
    'suspension-duration': textCol(
      'suspension-duration',
      'Suspension Duration',
      (e) => e.suspensionDuration,
    ),
    'linked-report-cases': textCol(
      'linked-report-cases',
      'Linked Report Cases',
      (e) => e.linkedReportCases,
    ),
    'active-orders-impacted': textCol(
      'active-orders-impacted',
      'Active Orders Impacted',
      (e) => e.activeOrdersImpacted,
    ),
    'scheduled-consultations': textCol(
      'scheduled-consultations',
      'Scheduled Consultations',
      (e) => e.scheduledConsultations,
    ),
    'microsite-status': statusCol('microsite-status', 'Microsite Status', (e) => e.micrositeStatus),
    'last-communication': dateCol(
      'last-communication',
      'Last Communication',
      (e) => e.lastCommunication,
    ),
    'reinstatement-eligible': statusCol(
      'reinstatement-eligible',
      'Reinstatement Eligible',
      (e) => e.reinstatementEligible,
    ),
  }
}

export function pickPreferenceColumns(
  dataColumnsById: Record<string, ColumnDef<Expert>>,
  visibleIds: string[],
  fallbackIds: string[],
): ColumnDef<Expert>[] {
  const ids = visibleIds.length ? visibleIds : fallbackIds
  return ids.map((id) => dataColumnsById[id]).filter(Boolean) as ColumnDef<Expert>[]
}
