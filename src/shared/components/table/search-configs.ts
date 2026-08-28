import type { SearchableColumn } from '@/shared/types/search-types'

const EXPERT_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Under Review', value: 'under-review' },
  { label: 'Deactivated', value: 'deactivated' },
  { label: 'Blacklisted', value: 'blacklisted' },
]

const SERVICE_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Paused', value: 'paused' },
  { label: 'Deleted', value: 'deleted' },
]

const VENUE_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Deleted', value: 'deleted' },
]

const CATEGORY_STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Paused', value: 'PAUSED' },
  { label: 'Deleted', value: 'DELETED' },
]

const TICKET_STATUS_OPTIONS = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
  { label: 'Escalated', value: 'escalated' },
]

const REFERRAL_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Used', value: 'used' },
  { label: 'Expired', value: 'expired' },
  { label: 'Revoked', value: 'revoked' },
]

const PAYMENT_STATUS_OPTIONS = [
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
]

const PAYOUT_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
]

const INVITE_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Expired', value: 'expired' },
  { label: 'Revoked', value: 'revoked' },
]

const INCIDENT_SEVERITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
]

const ESCALATION_STATUS_OPTIONS = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

export const EXPERT_MANAGEMENT_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Expert ID', type: 'text', placeholder: 'Search by Expert ID...' },
  { key: 'searchByName', label: 'Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: EXPERT_STATUS_OPTIONS },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
  { key: 'searchByDate', label: 'Onboarding Date', type: 'date' },
]

export const EXPERT_PENDING_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Expert ID', type: 'text', placeholder: 'Search by Expert ID...' },
  { key: 'searchByName', label: 'Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
  { key: 'searchByDate', label: 'Application Date', type: 'date' },
]

export const EXPERT_SUSPENDED_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Expert ID', type: 'text', placeholder: 'Search by Expert ID...' },
  { key: 'searchByName', label: 'Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
  { key: 'searchByDate', label: 'Suspended Date', type: 'date' },
]

export const EXPERT_REPORTED_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Expert ID', type: 'text', placeholder: 'Search by Expert ID...' },
  { key: 'searchByName', label: 'Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
  { key: 'searchByDate', label: 'Report Date', type: 'date' },
]

export const EXPERT_DELETED_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Expert ID', type: 'text', placeholder: 'Search by Expert ID...' },
  { key: 'searchByName', label: 'Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Deleted Date', type: 'date' },
]

export const SERVICE_MANAGEMENT_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Service ID', type: 'text', placeholder: 'Search by Service ID...' },
  { key: 'searchByName', label: 'Service Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: SERVICE_STATUS_OPTIONS },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
  { key: 'searchByDate', label: 'Created Date', type: 'date' },
]

export const SERVICE_PENDING_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Service ID', type: 'text', placeholder: 'Search by Service ID...' },
  { key: 'searchByName', label: 'Service Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
  { key: 'searchByDate', label: 'Submitted Date', type: 'date' },
]

export const SERVICE_REPORTED_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Service ID', type: 'text', placeholder: 'Search by Service ID...' },
  { key: 'searchByName', label: 'Service Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Report Date', type: 'date' },
]

export const SERVICE_SUSPENDED_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Service ID', type: 'text', placeholder: 'Search by Service ID...' },
  { key: 'searchByName', label: 'Service Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Suspended Date', type: 'date' },
]

export const SERVICE_DELETED_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Service ID', type: 'text', placeholder: 'Search by Service ID...' },
  { key: 'searchByName', label: 'Service Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Deleted Date', type: 'date' },
]

export const SERVICE_PERFORMANCE_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Service ID', type: 'text', placeholder: 'Search by Service ID...' },
  { key: 'searchByName', label: 'Service Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
]

export const CONSULTATION_PERFORMANCE_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Consultation ID', type: 'text', placeholder: 'Search by ID...' },
  { key: 'searchByName', label: 'Expert Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
]

export const SERVICE_CATEGORY_SEARCH_COLUMNS: SearchableColumn[] = [
  {
    key: 'searchById',
    label: 'Category ID',
    type: 'text',
    placeholder: 'Search by Category ID...',
  },
  { key: 'searchByName', label: 'Category Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: CATEGORY_STATUS_OPTIONS },
]

export const VENUE_CATEGORY_SEARCH_COLUMNS: SearchableColumn[] = [
  {
    key: 'searchById',
    label: 'Category ID',
    type: 'text',
    placeholder: 'Search by Category ID...',
  },
  { key: 'searchByName', label: 'Category Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: CATEGORY_STATUS_OPTIONS },
]

export const VENUE_MANAGEMENT_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Venue ID', type: 'text', placeholder: 'Search by Venue ID...' },
  { key: 'searchByName', label: 'Venue Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: VENUE_STATUS_OPTIONS },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
  { key: 'searchByDate', label: 'Created Date', type: 'date' },
]

export const VENUE_PENDING_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Venue ID', type: 'text', placeholder: 'Search by Venue ID...' },
  { key: 'searchByName', label: 'Venue Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
  { key: 'searchByDate', label: 'Submitted Date', type: 'date' },
]

export const VENUE_REPORTED_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Venue ID', type: 'text', placeholder: 'Search by Venue ID...' },
  { key: 'searchByName', label: 'Venue Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Report Date', type: 'date' },
]

export const VENUE_SUSPENDED_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Venue ID', type: 'text', placeholder: 'Search by Venue ID...' },
  { key: 'searchByName', label: 'Venue Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Suspended Date', type: 'date' },
]

export const VENUE_REJECTED_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Venue ID', type: 'text', placeholder: 'Search by Venue ID...' },
  { key: 'searchByName', label: 'Venue Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Rejected Date', type: 'date' },
]

export const VENUE_DELETED_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Venue ID', type: 'text', placeholder: 'Search by Venue ID...' },
  { key: 'searchByName', label: 'Venue Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Deleted Date', type: 'date' },
]

export const FINANCE_REVENUE_SEARCH_COLUMNS: SearchableColumn[] = [
  {
    key: 'searchById',
    label: 'Transaction ID',
    type: 'text',
    placeholder: 'Search by Transaction ID...',
  },
  { key: 'searchByName', label: 'Expert Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: PAYMENT_STATUS_OPTIONS },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const FINANCE_SERVICES_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Service ID', type: 'text', placeholder: 'Search by Service ID...' },
  { key: 'searchByName', label: 'Service Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: PAYMENT_STATUS_OPTIONS },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const FINANCE_VENUES_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Venue ID', type: 'text', placeholder: 'Search by Venue ID...' },
  { key: 'searchByName', label: 'Venue Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: PAYMENT_STATUS_OPTIONS },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const FINANCE_MEMBERSHIPS_SEARCH_COLUMNS: SearchableColumn[] = [
  {
    key: 'searchById',
    label: 'Membership ID',
    type: 'text',
    placeholder: 'Search by Membership ID...',
  },
  { key: 'searchByName', label: 'Expert Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: PAYMENT_STATUS_OPTIONS },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const FINANCE_PAYOUTS_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Payout ID', type: 'text', placeholder: 'Search by Payout ID...' },
  { key: 'searchByName', label: 'Expert Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: PAYOUT_STATUS_OPTIONS },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const FINANCE_REFUNDS_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Refund ID', type: 'text', placeholder: 'Search by Refund ID...' },
  { key: 'searchByName', label: 'Customer Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: PAYMENT_STATUS_OPTIONS },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const FINANCE_TAX_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Tax ID', type: 'text', placeholder: 'Search by Tax ID...' },
  { key: 'searchByName', label: 'Expert Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const FINANCE_INVOICES_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Invoice ID', type: 'text', placeholder: 'Search by Invoice ID...' },
  { key: 'searchByName', label: 'Client Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: PAYMENT_STATUS_OPTIONS },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const FINANCE_RECONCILIATION_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Record ID', type: 'text', placeholder: 'Search by ID...' },
  { key: 'searchByName', label: 'Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const FINANCE_ESCROW_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Escrow ID', type: 'text', placeholder: 'Search by Escrow ID...' },
  { key: 'searchByName', label: 'Expert Name', type: 'text', placeholder: 'Search by name...' },
]

export const FINANCE_MEMBERSHIP_SEARCH_COLUMNS = FINANCE_MEMBERSHIPS_SEARCH_COLUMNS
export const FINANCE_PAYOUT_SEARCH_COLUMNS = FINANCE_PAYOUTS_SEARCH_COLUMNS

export const FINANCE_EVENTS_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Event ID', type: 'text', placeholder: 'Search by Event ID...' },
  { key: 'searchByName', label: 'Event Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const FINANCE_CATEGORIES_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Category ID', type: 'text', placeholder: 'Search by ID...' },
  { key: 'searchByName', label: 'Category Name', type: 'text', placeholder: 'Search by name...' },
]
export const FINANCE_CATEGORY_SEARCH_COLUMNS = FINANCE_CATEGORIES_SEARCH_COLUMNS

export const RBAC_MANAGEMENT_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Admin ID', type: 'text', placeholder: 'Search by Admin ID...' },
  { key: 'searchByName', label: 'Name', type: 'text', placeholder: 'Search by name...' },
  {
    key: 'searchByStatus',
    label: 'Status',
    type: 'status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Suspended', value: 'suspended' },
    ],
  },
  { key: 'searchByDate', label: 'Created Date', type: 'date' },
]

export const RBAC_ROLE_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Role ID', type: 'text', placeholder: 'Search by Role ID...' },
  { key: 'searchByName', label: 'Role Name', type: 'text', placeholder: 'Search by role name...' },
  {
    key: 'searchByStatus',
    label: 'Status',
    type: 'status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  { key: 'searchByDate', label: 'Created Date', type: 'date' },
]

export const RBAC_USER_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Admin ID', type: 'text', placeholder: 'Search by Admin ID...' },
  { key: 'searchByName', label: 'Name', type: 'text', placeholder: 'Search by name...' },
  {
    key: 'searchByStatus',
    label: 'Status',
    type: 'status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Suspended', value: 'suspended' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  { key: 'searchByDate', label: 'Created Date', type: 'date' },
]

export const RBAC_INVITES_SEARCH_COLUMNS: SearchableColumn[] = [
  {
    key: 'searchById',
    label: 'Invite Code',
    type: 'text',
    placeholder: 'Search by Invite Code...',
  },
  { key: 'searchByName', label: 'Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: INVITE_STATUS_OPTIONS },
  { key: 'searchByDate', label: 'Invited Date', type: 'date' },
]
export const RBAC_INVITE_SEARCH_COLUMNS = RBAC_INVITES_SEARCH_COLUMNS

export const RBAC_ADMIN_LOGS_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Log ID', type: 'text', placeholder: 'Search by Log ID...' },
  { key: 'searchByName', label: 'Admin Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByCategory', label: 'Module', type: 'category' },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const RBAC_ROLE_USERS_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'User ID', type: 'text', placeholder: 'Search by User ID...' },
  { key: 'searchByName', label: 'Name', type: 'text', placeholder: 'Search by name...' },
]

export const SETTINGS_LOGS_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Log ID', type: 'text', placeholder: 'Search by Log ID...' },
  { key: 'searchByName', label: 'Admin Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const LOGIN_TRAILS_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Trail ID', type: 'text', placeholder: 'Search by Trail ID...' },
  { key: 'searchByName', label: 'User Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Login Date', type: 'date' },
]
export const SETTINGS_LOGIN_TRAILS_SEARCH_COLUMNS = LOGIN_TRAILS_SEARCH_COLUMNS

export const INCIDENT_TRACKING_SEARCH_COLUMNS: SearchableColumn[] = [
  {
    key: 'searchById',
    label: 'Incident ID',
    type: 'text',
    placeholder: 'Search by Incident ID...',
  },
  { key: 'searchByName', label: 'Title', type: 'text', placeholder: 'Search by title...' },
  { key: 'searchByStatus', label: 'Severity', type: 'status', options: INCIDENT_SEVERITY_OPTIONS },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]
export const SETTINGS_INCIDENTS_SEARCH_COLUMNS = INCIDENT_TRACKING_SEARCH_COLUMNS

export const BACKUP_RESTORE_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Backup ID', type: 'text', placeholder: 'Search by Backup ID...' },
  { key: 'searchByName', label: 'Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]
export const SETTINGS_BACKUPS_SEARCH_COLUMNS = BACKUP_RESTORE_SEARCH_COLUMNS

export const ESCALATION_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Escalation ID', type: 'text', placeholder: 'Search by ID...' },
  { key: 'searchByName', label: 'Title', type: 'text', placeholder: 'Search by title...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: ESCALATION_STATUS_OPTIONS },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]
export const SETTINGS_ESCALATIONS_SEARCH_COLUMNS = ESCALATION_SEARCH_COLUMNS

export const SUPPORT_TICKETS_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Ticket ID', type: 'text', placeholder: 'Search by Ticket ID...' },
  { key: 'searchByName', label: 'Subject', type: 'text', placeholder: 'Search by subject...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: TICKET_STATUS_OPTIONS },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
  { key: 'searchByDate', label: 'Created Date', type: 'date' },
]
export const SUPPORT_TICKET_SEARCH_COLUMNS = SUPPORT_TICKETS_SEARCH_COLUMNS

export const PAST_TICKETS_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Ticket ID', type: 'text', placeholder: 'Search by Ticket ID...' },
  { key: 'searchByName', label: 'Subject', type: 'text', placeholder: 'Search by subject...' },
  { key: 'searchByDate', label: 'Closed Date', type: 'date' },
]

export const REFERRAL_MANAGEMENT_SEARCH_COLUMNS: SearchableColumn[] = [
  {
    key: 'searchById',
    label: 'Referral ID',
    type: 'text',
    placeholder: 'Search by Referral ID...',
  },
  { key: 'searchByName', label: 'Referrer Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByStatus', label: 'Status', type: 'status', options: REFERRAL_STATUS_OPTIONS },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]
export const REFERRALS_SEARCH_COLUMNS = REFERRAL_MANAGEMENT_SEARCH_COLUMNS

export const EXPERT_MEMBERSHIPS_SEARCH_COLUMNS: SearchableColumn[] = [
  {
    key: 'searchById',
    label: 'Membership ID',
    type: 'text',
    placeholder: 'Search by Membership ID...',
  },
  { key: 'searchByName', label: 'Expert Name', type: 'text', placeholder: 'Search by name...' },
  {
    key: 'searchByStatus',
    label: 'Status',
    type: 'status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Expired', value: 'expired' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const EXPERT_CLIENTELE_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Booking ID', type: 'text', placeholder: 'Search by Booking ID...' },
  {
    key: 'searchByName',
    label: 'Client Name',
    type: 'text',
    placeholder: 'Search by client name...',
  },
  {
    key: 'searchByStatus',
    label: 'Status',
    type: 'status',
    options: [
      { label: 'Completed', value: 'completed' },
      { label: 'In Progress', value: 'in progress' },
      { label: 'Scheduled', value: 'scheduled' },
      { label: 'Disputed', value: 'disputed' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
  { key: 'searchByDate', label: 'Date', type: 'date' },
]

export const LEADERBOARD_SEARCH_COLUMNS: SearchableColumn[] = [
  { key: 'searchById', label: 'Expert ID', type: 'text', placeholder: 'Search by Expert ID...' },
  { key: 'searchByName', label: 'Expert Name', type: 'text', placeholder: 'Search by name...' },
  { key: 'searchByCategory', label: 'Category', type: 'category' },
]

export const COMMUNICATION_SEARCH_COLUMNS: SearchableColumn[] = [
  {
    key: 'searchById',
    label: 'Campaign ID',
    type: 'text',
    placeholder: 'Search by Campaign ID...',
  },
  { key: 'searchByName', label: 'Campaign Title', type: 'text', placeholder: 'Search by title...' },
  {
    key: 'searchByStatus',
    label: 'Status',
    type: 'status',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Scheduled', value: 'scheduled' },
      { label: 'Sent', value: 'sent' },
      { label: 'Failed', value: 'failed' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
  { key: 'searchByDate', label: 'Created Date', type: 'date' },
]
