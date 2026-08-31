export type ExpertTableColumnCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible: boolean
}

const col = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = false,
): ExpertTableColumnCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})

export const EXPERT_MANAGEMENT_MODULE_KEY = 'expert-management'
export const EXPERT_PENDING_APPROVALS_MODULE_KEY = 'expert-pending-approvals'
export const EXPERT_REPORTED_MODULE_KEY = 'expert-reported'
export const EXPERT_SUSPENDED_MODULE_KEY = 'expert-suspended'
export const EXPERT_DELETED_MODULE_KEY = 'expert-deleted'

export const EXPERT_MANAGEMENT_TABLE_COLUMNS_CATALOG: ExpertTableColumnCatalogItem[] = [
  col('expert-id', 'Expert ID', 'Text', 'Unique expert identifier', true),
  col('name', 'Expert Name', 'Text', 'Full legal / display name', true),
  col('email', 'Email ID', 'Text', 'Registered email address', true),
  col('phone', 'Phone Number', 'Text', 'Registered mobile number'),
  col('profession', 'Profession', 'Text', 'Primary profession', true),
  col('category', 'Category', 'Text', 'Marketplace category'),
  col('service-type', 'Service Type', 'Text', 'Service, Consultation, or Both', true),
  col('status', 'Status', 'Status', 'Current lifecycle status', true),
  col('membership-type', 'Membership Type', 'Text', 'Current subscription plan'),
  col('created-by', 'Created By', 'Text', 'Registration source (User / Admin)'),
  col('created-at', 'Created At', 'Date', 'Registration timestamp', true),
  col('last-active', 'Last Active', 'Date', 'Last login or activity', true),
  col('designation', 'Designation', 'Text', 'Expert designation'),
  col('city', 'City', 'Text', 'Current city'),
  col('state', 'State', 'Text', 'Current state'),
  col('years-of-experience', 'Years of Experience', 'Count', 'Professional experience years'),
  col('digilocker-verification', 'DigiLocker Verification', 'Status', 'DigiLocker verified Yes/No'),
  col('kyc-status', 'KYC Status', 'Status', 'KYC verification status'),
  col('phone-verification', 'Phone Verification', 'Status', 'Phone OTP verification'),
  col('email-verification', 'Email Verification', 'Status', 'Email verification'),
  col('compliance-status', 'Compliance Status', 'Status', 'Regulatory compliance status'),
  col('average-rating', 'Average Rating', 'Average', 'Average review rating 0–5'),
  col('total-clients-served', 'Total Clients Served', 'Count', 'Distinct completed clients'),
  col('total-earnings', 'Total Earnings', 'Currency', 'Lifetime settled earnings'),
  col('total-services-listed', 'Total Services Listed', 'Count', 'Service listings count'),
  col(
    'total-consultations-listed',
    'Total Consultations Listed',
    'Count',
    'Consultation listings count',
  ),
  col('consultation-listed', 'Consultation Listed', 'Text', 'Whether consultations are listed'),
  col('micro-website-url', 'Micro Website URL', 'Text', 'Public profile customUrl / share URL'),
  col(
    'total-orders-completed-services',
    'Total Orders Completed (Services)',
    'Count',
    'Completed service orders',
  ),
  col('ongoing-service-orders', 'Ongoing Service Orders', 'Count', 'In-progress service orders'),
  col(
    'completed-consultation-bookings',
    'Completed Consultation Bookings',
    'Count',
    'Finished consultations',
  ),
  col(
    'scheduled-consultation-bookings',
    'Scheduled Consultation Bookings',
    'Count',
    'New / scheduled consultation bookings',
  ),
  col('total-tickets-disputes', 'Total Tickets / Disputes', 'Count', 'All support disputes'),
  col('open-tickets-disputes', 'Open Tickets / Disputes', 'Count', 'Open or in-progress disputes'),
  col('resolved-tickets', 'Resolved Tickets', 'Count', 'Resolved disputes'),
  col('repeat-clients', 'Repeat Clients', 'Count', 'Clients with more than one completed order'),
  col(
    'repeat-client-percent',
    'Repeat Client %',
    'Percentage',
    'Repeat clients over total clients',
  ),
  col('quotations-received', 'Quotations Received', 'Count', 'Quotation requests received'),
  col('proposals-created', 'Proposals Created', 'Count', 'Proposals submitted'),
  col('proposals-accepted', 'Proposals Accepted', 'Count', 'Accepted proposals'),
  col('proposals-declined', 'Proposals Declined', 'Count', 'Declined proposals'),
  col('custom-orders-created', 'Custom Orders Created', 'Count', 'Custom jobs created'),
  col('completed-custom-orders', 'Completed Custom Orders', 'Count', 'Completed custom jobs'),
  col(
    'client-satisfaction-score',
    'Client Satisfaction Score (CSAT)',
    'Percentage',
    'Share of ratings ≥ 4',
  ),
  col('net-promoter-score', 'Net Promoter Score (NPS)', 'Average', 'NPS from reviews'),
]

export const DEFAULT_EXPERT_MANAGEMENT_VISIBLE_COLUMN_IDS =
  EXPERT_MANAGEMENT_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const EXPERT_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG: ExpertTableColumnCatalogItem[] = [
  col('expert-id', 'Expert ID', 'Text', 'Unique expert identifier', true),
  col('name', 'Expert Name', 'Text', 'Registered full name', true),
  col('email', 'Email ID', 'Text', 'Registered email', true),
  col('phone', 'Phone Number', 'Text', 'Registered mobile'),
  col('profession', 'Profession', 'Text', 'Primary profession', true),
  col('category', 'Category', 'Text', 'Marketplace category'),
  col('service-type', 'Service Type', 'Text', 'Marketplace offering', true),
  col('submitted-at', 'Submitted At', 'Date', 'Application submitted date', true),
  col('approval-stage', 'Approval Stage', 'Text', 'Current workflow stage'),
  col('approval-status', 'Approval Status', 'Status', 'Overall approval state', true),
  col('digilocker-status', 'DigiLocker Status', 'Status', 'Identity verification via DigiLocker'),
  col('kyc-status', 'KYC Status', 'Status', 'KYC verification'),
  col('gst-status', 'GST Status', 'Status', 'GST verification'),
  col('undertaking-status', 'Undertaking Status', 'Status', 'Agreement submission'),
  col('compliance-status', 'Compliance Status', 'Status', 'Combined compliance status'),
  col('missing-documents', 'Missing Documents', 'Text', 'Pending documents'),
  col('assigned-reviewer', 'Assigned Reviewer', 'Text', 'Admin handling approval'),
  col('sla-days-pending', 'SLA (Days Pending)', 'Count', 'Days pending approval'),
  col('priority', 'Priority', 'Status', 'Operational priority'),
  col('escalation-status', 'Escalation Status', 'Status', 'Escalation state'),
  col('last-updated-at', 'Last Updated At', 'Date', 'Last workflow update'),
]

export const DEFAULT_EXPERT_PENDING_VISIBLE_COLUMN_IDS =
  EXPERT_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const EXPERT_REPORTED_TABLE_COLUMNS_CATALOG: ExpertTableColumnCatalogItem[] = [
  col('report-id', 'Report ID', 'Text', 'Unique report identifier', true),
  col('expert-id', 'Expert ID', 'Text', 'Reported expert identifier', true),
  col('expert-name', 'Expert Name', 'Text', 'Reported expert name', true),
  col('reported-by', 'Reported By', 'Text', 'Who submitted the report', true),
  col('reporter-id', 'Reporter ID', 'Text', 'Reporter user/admin id'),
  col('report-category', 'Report Category', 'Status', 'Type of issue', true),
  col('report-reason', 'Report Reason', 'Text', 'User submitted reason', true),
  col('evidence-attached', 'Evidence Attached', 'Status', 'Supporting documents present'),
  col('severity', 'Severity', 'Status', 'Business impact'),
  col('case-status', 'Case Status', 'Status', 'Investigation status', true),
  col('assigned-to', 'Assigned To', 'Text', 'Investigating admin'),
  col('reported-at', 'Reported At', 'Date', 'Report submitted timestamp', true),
  col('last-updated', 'Last Updated', 'Date', 'Latest action timestamp'),
  col('escalated-by', 'Escalated By', 'Text', 'Admin who escalated'),
  col('escalated-at', 'Escalated At', 'Date', 'Escalation timestamp'),
  col('resolution', 'Resolution', 'Status', 'Final outcome'),
  col('resolution-notes', 'Resolution Notes', 'Text', 'Internal resolution notes'),
  col('compliance-flag', 'Compliance Flag', 'Status', 'Compliance review required'),
  col('related-ticket-id', 'Related Ticket ID', 'Text', 'Linked support ticket'),
]

export const DEFAULT_EXPERT_REPORTED_VISIBLE_COLUMN_IDS =
  EXPERT_REPORTED_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG: ExpertTableColumnCatalogItem[] = [
  col('expert-id', 'Expert ID', 'Text', 'Unique expert identifier', true),
  col('name', 'Expert Name', 'Text', 'Registered full name', true),
  col('email', 'Email ID', 'Text', 'Registered email', true),
  col('profession', 'Profession', 'Text', 'Primary profession', true),
  col('category', 'Category', 'Text', 'Marketplace category'),
  col('suspension-status', 'Suspension Status', 'Status', 'Current suspension state', true),
  col('suspension-type', 'Suspension Type', 'Text', 'Temporary or indefinite'),
  col('suspension-reason', 'Suspension Reason', 'Text', 'Primary suspension reason', true),
  col('suspended-by', 'Suspended By', 'Text', 'Admin who suspended'),
  col('suspended-at', 'Suspended At', 'Date', 'Suspension timestamp'),
  col('suspension-until', 'Suspension Until', 'Date', 'End date for temporary suspension'),
  col('suspension-duration', 'Suspension Duration', 'Text', 'Days suspended'),
  col('compliance-status', 'Compliance Status', 'Status', 'Compliance review status'),
  col('linked-report-cases', 'Linked Report Cases', 'Count', 'Linked report case count'),
  col('active-orders-impacted', 'Active Orders Impacted', 'Count', 'In-progress orders affected'),
  col(
    'scheduled-consultations',
    'Scheduled Consultations',
    'Count',
    'Upcoming consultations affected',
  ),
  col('microsite-status', 'Microsite Status', 'Status', 'Public microsite status'),
  col('last-communication', 'Last Communication', 'Date', 'Most recent communication'),
  col(
    'reinstatement-eligible',
    'Reinstatement Eligible',
    'Status',
    'Whether reinstatement is allowed',
  ),
  col('last-updated-at', 'Last Updated At', 'Date', 'Latest administrative update'),
]

export const DEFAULT_EXPERT_SUSPENDED_VISIBLE_COLUMN_IDS =
  EXPERT_SUSPENDED_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)

export const EXPERT_DELETED_TABLE_COLUMNS_CATALOG: ExpertTableColumnCatalogItem[] = [
  col('expert-id', 'Expert ID', 'Text', 'Unique expert identifier', true),
  col('name', 'Expert Name', 'Text', 'Registered full name', true),
  col('email', 'Email ID', 'Text', 'Registered email', true),
  col('phone', 'Phone Number', 'Text', 'Registered mobile'),
  col('profession', 'Profession', 'Text', 'Primary profession', true),
  col('service-type', 'Service Type', 'Text', 'Marketplace offering', true),
  col('deactivation-type', 'Deactivation Type', 'Text', 'Temporary or permanent delete'),
  col('reason', 'Reason', 'Text', 'Deletion reason', true),
  col('admin-notes', 'Admin Notes', 'Text', 'Internal deletion notes'),
  col('deleted-at', 'Deleted At', 'Date', 'Deactivation timestamp', true),
  col('deleted-by', 'Deleted By', 'Text', 'Admin who deleted the account'),
]

export const DEFAULT_EXPERT_DELETED_VISIBLE_COLUMN_IDS =
  EXPERT_DELETED_TABLE_COLUMNS_CATALOG.filter((c) => c.defaultVisible).map((c) => c.id)
