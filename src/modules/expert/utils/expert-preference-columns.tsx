import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import type { Expert } from '../type/expert'
import type { ExpertReportItem } from '../components/expert-report-detail-modal'
import { renderTableDateTimeCell as formatDateTime } from '@/shared/components/table/table-datetime-column'
import { displayExpertValue } from '../pages/experts/expert-list-format'
import { ExpertStatusBadge } from '../pages/experts/expert-list-shared'

const dash = (value: unknown): ReactNode => {
  if (value === null || value === undefined || value === '') return '—'
  return displayExpertValue(value as string | number | null | undefined)
}

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
    'approval-status': {
      id: 'approval-status',
      header: 'Approval Status',
      accessorFn: (row) => row.approvalStatus ?? row.status ?? '',
      cell: ({ row }) => (
        <ExpertStatusBadge status={row.original.approvalStatus ?? row.original.status} />
      ),
    },
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

export function pickExpertReportPreferenceColumns(
  dataColumnsById: Record<string, ColumnDef<ExpertReportItem>>,
  visibleIds: string[],
  fallbackIds: string[],
): ColumnDef<ExpertReportItem>[] {
  const ids = visibleIds.length ? visibleIds : fallbackIds
  return ids.map((id) => dataColumnsById[id]).filter(Boolean) as ColumnDef<ExpertReportItem>[]
}

export function buildExpertReportDataColumnsById(): Record<string, ColumnDef<ExpertReportItem>> {
  const dashReport = (value: unknown) =>
    value === null || value === undefined || value === '' ? '—' : String(value)

  return {
    'report-id': {
      id: 'report-id',
      header: 'Report ID',
      accessorFn: (row) => row.reportId ?? '',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#E5B54E]">
          {row.original.reportId || '—'}
        </span>
      ),
    },
    'expert-id': {
      id: 'expert-id',
      header: 'Expert ID',
      accessorFn: (row) =>
        row.expertId ||
        (row.partnerId ? `EXP-${String(row.partnerId).slice(-4).toUpperCase()}` : ''),
      cell: ({ row }) =>
        dashReport(
          row.original.expertId ||
            (row.original.partnerId
              ? `EXP-${String(row.original.partnerId).slice(-4).toUpperCase()}`
              : null),
        ),
    },
    'expert-name': {
      id: 'expert-name',
      header: 'Expert Name',
      accessorFn: (row) => row.expertName ?? '',
      cell: ({ row }) => (
        <span className="font-semibold text-white">{dashReport(row.original.expertName)}</span>
      ),
    },
    'reported-by': {
      id: 'reported-by',
      header: 'Reported By',
      accessorFn: (row) => row.reporterName ?? '',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-200">{dashReport(row.original.reporterName)}</div>
          <div className="text-[11px] text-slate-400">{dashReport(row.original.reporterType)}</div>
        </div>
      ),
    },
    'reporter-id': {
      id: 'reporter-id',
      header: 'Reporter ID',
      accessorFn: (row) => row.reporterId ?? '',
      cell: ({ row }) => dashReport(row.original.reporterId),
    },
    'report-category': {
      id: 'report-category',
      header: 'Report Category',
      accessorFn: (row) => row.issueType ?? '',
      cell: ({ row }) => (
        <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400">
          {dashReport(row.original.issueType)}
        </span>
      ),
    },
    'report-reason': {
      id: 'report-reason',
      header: 'Report Reason',
      accessorFn: (row) => row.reason ?? '',
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-xs text-slate-300" title={row.original.reason}>
          {dashReport(row.original.reason)}
        </div>
      ),
    },
    'evidence-attached': {
      id: 'evidence-attached',
      header: 'Evidence Attached',
      accessorFn: (row) =>
        row.hasSupportingDocuments || (row.supportingDocuments?.length ?? 0) > 0 ? 'Yes' : 'No',
      cell: ({ row }) =>
        dashReport(
          row.original.hasSupportingDocuments || (row.original.supportingDocuments?.length ?? 0) > 0
            ? 'Yes'
            : 'No',
        ),
    },
    severity: {
      id: 'severity',
      header: 'Severity',
      accessorFn: (row) => row.businessImpact ?? '',
      cell: ({ row }) => dashReport(row.original.businessImpact),
    },
    'case-status': {
      id: 'case-status',
      header: 'Case Status',
      accessorFn: (row) => row.investigationStatus || 'New',
      cell: ({ row }) => {
        const status = row.original.investigationStatus || 'New'
        const isResolved = status === 'Resolved' || status === 'Closed'
        const isReview = status === 'Under Review' || status === 'Escalated'
        return (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isResolved
                ? 'bg-emerald-500/15 text-emerald-400'
                : isReview
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-blue-500/15 text-blue-400'
            }`}
          >
            {status}
          </span>
        )
      },
    },
    'assigned-to': {
      id: 'assigned-to',
      header: 'Assigned To',
      accessorFn: (row) => row.investigatingAdmin ?? '',
      cell: ({ row }) => dashReport(row.original.investigatingAdmin),
    },
    'reported-at': {
      id: 'reported-at',
      header: 'Reported At',
      accessorFn: (row) => row.submittedAt ?? '',
      cell: ({ row }) =>
        row.original.submittedAt ? formatDateTime(row.original.submittedAt) : '—',
    },
    'last-updated': {
      id: 'last-updated',
      header: 'Last Updated',
      accessorFn: (row) => row.latestActionTimestamp ?? '',
      cell: ({ row }) =>
        row.original.latestActionTimestamp
          ? formatDateTime(row.original.latestActionTimestamp)
          : '—',
    },
    'escalated-by': {
      id: 'escalated-by',
      header: 'Escalated By',
      accessorFn: (row) => row.adminWhoEscalated ?? '',
      cell: ({ row }) => dashReport(row.original.adminWhoEscalated),
    },
    'escalated-at': {
      id: 'escalated-at',
      header: 'Escalated At',
      accessorFn: (row) => row.escalatedAt || row.escalationTimestamp || '',
      cell: ({ row }) => {
        const value = row.original.escalatedAt || row.original.escalationTimestamp
        return value ? formatDateTime(value) : '—'
      },
    },
    resolution: {
      id: 'resolution',
      header: 'Resolution',
      accessorFn: (row) => row.finalOutcome ?? '',
      cell: ({ row }) => dashReport(row.original.finalOutcome),
    },
    'resolution-notes': {
      id: 'resolution-notes',
      header: 'Resolution Notes',
      accessorFn: (row) => row.internalNotes ?? '',
      cell: ({ row }) => dashReport(row.original.internalNotes),
    },
    'compliance-flag': {
      id: 'compliance-flag',
      header: 'Compliance Flag',
      accessorFn: (row) =>
        row.complianceReviewRequired == null ? '' : row.complianceReviewRequired ? 'Yes' : 'No',
      cell: ({ row }) =>
        dashReport(
          row.original.complianceReviewRequired == null
            ? null
            : row.original.complianceReviewRequired
              ? 'Yes'
              : 'No',
        ),
    },
    'related-ticket-id': {
      id: 'related-ticket-id',
      header: 'Related Ticket ID',
      accessorFn: (row) => row.linkedSupportTicket ?? '',
      cell: ({ row }) => dashReport(row.original.linkedSupportTicket),
    },
  }
}
