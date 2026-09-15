export type TicketStatus = 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed'
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low'
export type TicketTab = 'my_tickets' | 'escalated' | 'all'
export type WorkspaceTab = 'intelligence' | 'messages'
export type ReporterType = 'user' | 'expert' | 'service_partner' | 'event_host' | 'venue_partner'

export type EscalationStatus = 'pending' | 'accepted' | 'rejected' | 'completed'

export type SupportTicket = {
  id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  category: string
  reporter: string
  reporterId?: string
  reporterType: ReporterType
  reporterAvatarUrl?: string
  assignedTo: string
  assignedToId?: string | null
  assignedToAvatarUrl?: string
  assignedBy?: string | null
  assignedById?: string | null
  slaTimer: string
  slaDueAt?: string | null
  firstResponseDueAt?: string | null
  resolutionDueAt?: string | null
  module: string
  issueType: string
  createdAt: string
  createdAtIso?: string | null
  dueIn?: string
  description?: string
  resolution?: string
  comments?: string
  tags?: string[]
  escalationPathway?: string
  isEscalated?: boolean
  escalatedAt?: string | null
  escalatedFor?: string | null
  escalatedTo?: string | null
  escalatedBy?: string | null
  escalationStatus?: EscalationStatus | string | null
  pastTicketsCount?: number
  eventContext?: { name?: string; date?: string } | null
  issueContext?: { name?: string; detail?: string } | null
  assignedAt?: string | null
  resolvedAt?: string | null
  resolvedBy?: string | null
  resolvedById?: string | null
  resolutionTime?: string | null
  lastUpdatedAt?: string | null
}

export type QueueTicket = Pick<
  SupportTicket,
  'id' | 'subject' | 'status' | 'priority' | 'reporter' | 'reporterType' | 'createdAt'
>

export type ChatMessage = {
  id: string
  sender: string
  senderAvatarUrl?: string
  role: 'user' | 'agent'
  content: string
  time: string
  online?: boolean
  attachments?: Array<{
    url: string
    publicId?: string
    name?: string
    mimeType?: string
  }>
}

export type ActivityItem = {
  id: string
  title: string
  subtitle: string
  time: string
}
