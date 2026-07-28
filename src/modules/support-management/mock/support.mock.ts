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
  { day: 'Jan 1', total: 32000, resolved: 5000 },
  { day: 'Jan 3', total: 35000, resolved: 8000 },
  { day: 'Jan 5', total: 42000, resolved: 12000 },
  { day: 'Jan 7', total: 39000, resolved: 16000 },
  { day: 'Jan 9', total: 45000, resolved: 22000 },
]

export const ticketsByUserTypeMock = [
  { name: 'Users', value: 1233, percent: 45 },
  { name: 'Experts', value: 1235, percent: 28 },
  { name: 'Event Hosts', value: 180, percent: 18 },
  { name: 'Venue Partners', value: 1234, percent: 9 },
]

export const ticketsByModuleMock = [
  { month: 'Sep', networking: 40000, events: 55000, services: 48000, venues: 90000 },
  { month: 'Oct', networking: 45000, events: 15000, services: 52000, venues: 55000 },
  { month: 'Nov', networking: 20000, events: 30000, services: 60000, venues: 95000 },
  { month: 'Dec', networking: 48000, events: 62000, services: 50000, venues: 60000 },
  { month: 'Jan', networking: 25000, events: 65000, services: 20000, venues: 62000 },
  { month: 'Feb', networking: 55000, events: 68000, services: 60000, venues: 20000 },
]

export const ticketsByReasonMock = [
  { label: 'User Accounts Glitch', count: 12, color: '#F6CB86' },
  { label: 'Events Booking Failed', count: 14, color: '#155DFC' },
  { label: 'Service Disputes', count: 34, color: '#F54900' },
  { label: 'Membership Issues', count: 35, color: '#00A63E' },
]

export const escalationsMock = [
  { day: 'Mon', teamA: 60000, teamB: 20000, teamC: 30000 },
  { day: 'Tue', teamA: 65000, teamB: 22000, teamC: 32000 },
  { day: 'Wed', teamA: 28000, teamB: 18000, teamC: 35000 },
  { day: 'Thu', teamA: 10000, teamB: 8000, teamC: 12000 },
  { day: 'Fri', teamA: 62000, teamB: 20000, teamC: 30000 },
  { day: 'Sat', teamA: 15000, teamB: 22000, teamC: 30000 },
  { day: 'Sun', teamA: 18000, teamB: 15000, teamC: 32000 },
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
