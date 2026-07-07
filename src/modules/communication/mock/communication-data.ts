export type CommunicationStatus = 'Sent' | 'Scheduled' | 'Active' | 'Draft' | 'Failed'

export type Communication = {
  id: string
  title: string
  channel: 'Email' | 'Push' | 'In App'
  type: 'Transactional' | 'Marketing' | 'Announcement'
  audience: string
  status: CommunicationStatus
  createdBy: string
  createdAt: string
}

const titles = [
  'Order Confirmation',
  'Festival Offer',
  'Password Reset',
  'Welcome Message',
  'Booking Reminder',
  'Payment Receipt',
  'Profile Update',
  'Service Launch',
  'Weekly Digest',
  'Account Verification',
]

const channels: Communication['channel'][] = ['Email', 'Push', 'In App']
const types: Communication['type'][] = ['Transactional', 'Marketing', 'Announcement']
const audiences = ['Users', 'Experts', 'Venues', 'All Users']
const statuses: CommunicationStatus[] = ['Sent', 'Scheduled', 'Active', 'Draft', 'Failed']
const creators = ['System Auto', 'Admin', 'Marketing Team']

export const communicationData: Communication[] = Array.from({ length: 20 }, (_, index) => ({
  id: 'SER001',
  title: titles[index % titles.length],
  channel: channels[index % channels.length],
  type: types[index % types.length],
  audience: audiences[index % audiences.length],
  status: statuses[index % statuses.length],
  createdBy: creators[index % creators.length],
  createdAt: `${12 + (index % 18)} Jul 2026`,
}))
