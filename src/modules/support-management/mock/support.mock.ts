import type { ActivityItem, ChatMessage, QueueTicket, SupportTicket } from '../types/support'

export const supportDashboardStats = [
  { title: 'Total Open Tickets', value: '487,650', change: '+6.7%', changeType: 'up' as const },
  { title: 'New Tickets Today', value: '487,650', change: '+6.7%', changeType: 'up' as const },
  { title: 'Tickets In-Progress', value: '487,650', change: '+6.7%', changeType: 'up' as const },
  { title: 'Escalated Tickets', value: '487,650', change: '+6.7%', changeType: 'up' as const },
  { title: 'Resolved Today', value: '487,650', change: '+6.7%', changeType: 'up' as const },
  { title: 'Priority Tickets', value: '487,650', change: '+6.7%', changeType: 'up' as const },
  { title: 'Avg. Response Time', value: '2.03 mins', change: '+6.7%', changeType: 'up' as const },
  {
    title: 'Avg. Resolution Time',
    value: '2 hr 30 mins',
    change: '+6.7%',
    changeType: 'up' as const,
  },
]

export const ticketManagementStats = [
  { title: 'My Open Tickets', value: '43', change: '+6.7%', changeType: 'up' as const },
  { title: 'Tickets In-Progress', value: '34', change: '+6.7%', changeType: 'up' as const },
  { title: 'Avg. Response Time', value: '2.03 mins', change: '+6.7%', changeType: 'up' as const },
  {
    title: 'Avg. Resolution Time',
    value: '2 hr 30 mins',
    change: '+6.7%',
    changeType: 'up' as const,
  },
]

export const ticketTrendsMock = [
  { day: 'Jan 1', total: 32000, resolved: 28000 },
  { day: 'Jan 3', total: 35000, resolved: 30000 },
  { day: 'Jan 5', total: 42000, resolved: 38000 },
  { day: 'Jan 7', total: 39000, resolved: 36000 },
  { day: 'Jan 9', total: 45000, resolved: 42000 },
]

export const ticketsByUserTypeMock = [
  { name: 'Users', value: 1233, percent: 45 },
  { name: 'Experts', value: 1235, percent: 28 },
  { name: 'Event Hosts', value: 180, percent: 18 },
  { name: 'Venue Partners', value: 1234, percent: 9 },
]

export const ticketsByModuleMock = [
  { month: 'Sep', networking: 40, events: 55, services: 48, venues: 35 },
  { month: 'Oct', networking: 45, events: 60, services: 52, venues: 38 },
  { month: 'Nov', networking: 50, events: 58, services: 55, venues: 42 },
  { month: 'Dec', networking: 48, events: 62, services: 50, venues: 45 },
  { month: 'Jan', networking: 52, events: 65, services: 58, venues: 48 },
  { month: 'Feb', networking: 55, events: 68, services: 60, venues: 50 },
]

export const ticketsByReasonMock = [
  { label: 'User Accounts Glitch', count: 12, color: '#FBBF24' },
  { label: 'Events Booking Failed', count: 14, color: '#60A5FA' },
  { label: 'Service Disputes', count: 34, color: '#F87171' },
  { label: 'Membership Issues', count: 35, color: '#34D399' },
]

export const escalationsMock = [
  { day: 'Mon', teamA: 8, teamB: 6, teamC: 4 },
  { day: 'Tue', teamA: 12, teamB: 9, teamC: 7 },
  { day: 'Wed', teamA: 10, teamB: 8, teamC: 6 },
  { day: 'Thu', teamA: 14, teamB: 11, teamC: 8 },
  { day: 'Fri', teamA: 9, teamB: 7, teamC: 5 },
  { day: 'Sat', teamA: 6, teamB: 4, teamC: 3 },
  { day: 'Sun', teamA: 5, teamB: 3, teamC: 2 },
]

export const supportTicketsMock: SupportTicket[] = [
  {
    id: 'TKT-2847',
    subject: 'Extra features requested after contract signed',
    status: 'in_progress',
    priority: 'critical',
    category: 'Approval Required',
    reporter: 'Sarah Johnson',
    reporterType: 'user',
    assignedTo: 'John Admin',
    slaTimer: '2h 14m',
    module: 'Events',
    issueType: 'Payment Failed',
    createdAt: '01/01/2026 | 11:23:00 AM IST',
    dueIn: '1hr 59m',
    description:
      'User reported unable to login to their account. Error message "Invalid credentials" appearing even with correct password.',
    comments: 'Verified system configuration no anomalies detected.',
    tags: ['Payment', 'Urgent'],
  },
  {
    id: 'TKT-2848',
    subject: 'Payment gateway timeout during checkout',
    status: 'open',
    priority: 'high',
    category: 'Dispute',
    reporter: 'Michael Chen',
    reporterType: 'expert',
    assignedTo: 'John Admin',
    slaTimer: '4h 02m',
    module: 'Services',
    issueType: 'Payment Failed',
    createdAt: '02/01/2026 | 09:15:00 AM IST',
    dueIn: '3hr 20m',
  },
  {
    id: 'TKT-2849',
    subject: 'Venue listing approval delayed beyond SLA',
    status: 'on_hold',
    priority: 'high',
    category: 'Security',
    reporter: 'Priya Sharma',
    reporterType: 'venue_partner',
    assignedTo: 'Mariam Mah',
    slaTimer: '1h 45m',
    module: 'Venues',
    issueType: 'Approval Pending',
    createdAt: '03/01/2026 | 02:30:00 PM IST',
    dueIn: '45m',
  },
  {
    id: 'TKT-2850',
    subject: 'Membership refund not processed',
    status: 'in_progress',
    priority: 'medium',
    category: 'Policy Violation',
    reporter: 'David Wilson',
    reporterType: 'user',
    assignedTo: 'Sarah John',
    slaTimer: '6h 30m',
    module: 'Membership',
    issueType: 'Refund Issue',
    createdAt: '04/01/2026 | 10:00:00 AM IST',
    dueIn: '5hr 10m',
  },
  {
    id: 'TKT-2851',
    subject: 'Expert profile verification stuck',
    status: 'open',
    priority: 'medium',
    category: 'Approval Required',
    reporter: 'Emma Davis',
    reporterType: 'expert',
    assignedTo: 'John Admin',
    slaTimer: '8h 12m',
    module: 'Experts',
    issueType: 'Verification',
    createdAt: '05/01/2026 | 08:45:00 AM IST',
    dueIn: '7hr 00m',
  },
]

export const queueTicketsMock: QueueTicket[] = [
  {
    id: 'TKT001',
    subject: 'Account Access Issue',
    status: 'in_progress',
    priority: 'high',
    reporter: 'Sarah Johnson',
    reporterType: 'user',
    createdAt: '01/01/2026',
  },
  {
    id: 'TKT002',
    subject: 'Document Verification',
    status: 'open',
    priority: 'medium',
    reporter: 'Sarah Johnson',
    reporterType: 'expert',
    createdAt: '01/01/2026',
  },
  {
    id: 'TKT003',
    subject: 'Payment Failed',
    status: 'in_progress',
    priority: 'high',
    reporter: 'John Doe',
    reporterType: 'user',
    createdAt: '02/01/2026',
  },
  {
    id: 'TKT004',
    subject: 'Venue Booking Issue',
    status: 'open',
    priority: 'medium',
    reporter: 'Mariam Mah',
    reporterType: 'venue_partner',
    createdAt: '02/01/2026',
  },
]

export const activityMock: ActivityItem[] = [
  { id: '1', title: 'Payment Failed', subtitle: 'UPI', time: '2 Hours Ago' },
  { id: '2', title: 'Payment Failed', subtitle: 'Credit Card', time: '2 Hours Ago' },
  { id: '3', title: 'Payment Failed', subtitle: 'Netbanking', time: '2 Hours Ago' },
]

export const chatMessagesMock: ChatMessage[] = [
  {
    id: '1',
    sender: 'John Doe',
    role: 'user',
    content:
      "Hi support team, I am unable to login to my account. I keep getting an 'Invalid credentials' error even though I am sure my password is correct. Can you please help?",
    time: '7:16 PM',
    online: true,
  },
  {
    id: '2',
    sender: 'Sarah John',
    role: 'agent',
    content:
      'Hello Abigail, thank you for reaching out. I can see there was an issue with your account authentication. Let me investigate this for you.',
    time: '7:16 PM',
    online: true,
  },
]

export const closedTicketMock: SupportTicket = {
  id: 'TK001',
  subject: 'Login authentication issue',
  status: 'closed',
  priority: 'high',
  category: 'Technical',
  reporter: 'Abigail Smith',
  reporterType: 'user',
  assignedTo: 'Abigail Smith',
  slaTimer: '—',
  module: 'User Accounts',
  issueType: 'Authentication',
  createdAt: 'Jan 14, 2025',
  description:
    'User reported unable to login to their account. Error message "Invalid credentials" appearing even with correct password.',
  resolution:
    'Issue was caused by authentication server sync problem. Account credentials were reset and user was able to login successfully.',
}

export const pastTicketsMock: SupportTicket[] = supportTicketsMock

export const tagOptions = ['Tag Title', 'Payment Issue', 'Urgent', 'Escalated', 'Internal']
