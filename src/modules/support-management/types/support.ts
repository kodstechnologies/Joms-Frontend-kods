export type TicketStatus = 'open' | 'in_progress' | 'on_hold' | 'closed'
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low'
export type TicketTab = 'my_tickets' | 'escalated' | 'all'
export type WorkspaceTab = 'intelligence' | 'messages'
export type ReporterType = 'user' | 'expert' | 'event_host' | 'venue_partner'

export type SupportTicket = {
  id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  category: string
  reporter: string
  reporterType: ReporterType
  assignedTo: string
  slaTimer: string
  module: string
  issueType: string
  createdAt: string
  dueIn?: string
  description?: string
  resolution?: string
  comments?: string
  tags?: string[]
}

export type QueueTicket = Pick<
  SupportTicket,
  'id' | 'subject' | 'status' | 'priority' | 'reporter' | 'reporterType' | 'createdAt'
>

export type ChatMessage = {
  id: string
  sender: string
  role: 'user' | 'agent'
  content: string
  time: string
  online?: boolean
}

export type ActivityItem = {
  id: string
  title: string
  subtitle: string
  time: string
}
