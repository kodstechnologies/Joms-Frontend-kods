export const incidentMetricsMock = [
  {
    title: 'Active Incidents',
    value: '10',
    trend: { direction: 'up' as const, percentage: 12, label: 'vs last month' },
  },
  {
    title: 'Critical Errors',
    value: '03',
    trend: { direction: 'down' as const, percentage: 6.7, label: 'vs last month' },
  },
  {
    title: 'Resolved',
    value: '18',
    trend: { direction: 'up' as const, percentage: 6.7, label: 'vs last month' },
  },
  { title: 'Avg. Resolution Time', value: '42m', hint: 'Target: 60m' },
]

export const incidentsMock = [
  {
    id: '1',
    incidentId: 'INC_5521',
    severity: 'Medium' as const,
    module: 'Payment',
    status: 'Investigating' as const,
    assignee: 'Sara Johnson',
    createdOn: '01/01/2026',
  },
  {
    id: '2',
    incidentId: 'INC_5520',
    severity: 'Low' as const,
    module: 'Data Pipeline',
    status: 'Open' as const,
    assignee: 'John Doe',
    createdOn: '01/01/2026',
  },
  {
    id: '3',
    incidentId: 'INC_5519',
    severity: 'Critical' as const,
    module: 'Auth Service',
    status: 'Resolved' as const,
    assignee: 'Sarah Smith',
    createdOn: '31/12/2025',
  },
  {
    id: '4',
    incidentId: 'INC_5518',
    severity: 'High' as const,
    module: 'Notifications',
    status: 'Investigating' as const,
    assignee: 'Mike Chen',
    createdOn: '31/12/2025',
  },
  {
    id: '5',
    incidentId: 'INC_5517',
    severity: 'Medium' as const,
    module: 'Venue Booking',
    status: 'Open' as const,
    assignee: 'Emily Davis',
    createdOn: '30/12/2025',
  },
  {
    id: '6',
    incidentId: 'INC_5516',
    severity: 'Low' as const,
    module: 'Reports',
    status: 'Resolved' as const,
    assignee: 'Sara Johnson',
    createdOn: '30/12/2025',
  },
  {
    id: '7',
    incidentId: 'INC_5515',
    severity: 'High' as const,
    module: 'Payment',
    status: 'Investigating' as const,
    assignee: 'John Doe',
    createdOn: '29/12/2025',
  },
  {
    id: '8',
    incidentId: 'INC_5514',
    severity: 'Critical' as const,
    module: 'Database',
    status: 'Open' as const,
    assignee: 'Sarah Smith',
    createdOn: '29/12/2025',
  },
]

export const departmentOptions = ['Engineering', 'Support', 'Operations', 'Security']

export const userOptionsByDepartment: Record<string, string[]> = {
  Engineering: ['Sara Johnson', 'Mike Chen', 'John Doe'],
  Support: ['Emily Davis', 'Sarah Smith'],
  Operations: ['Alex Turner', 'Priya Sharma'],
  Security: ['David Wilson', 'Sara Johnson'],
}
