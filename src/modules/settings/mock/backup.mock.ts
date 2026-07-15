export const backupMetricsMock = [
  {
    title: 'Total storage',
    value: '128 GB',
    trend: { direction: 'up' as const, percentage: 2.5, label: 'vs last month' },
  },
  {
    title: 'Used storage',
    value: '102 GB',
    trend: { direction: 'up' as const, percentage: 1.8, label: 'vs last month' },
  },
  {
    title: 'Storage limit',
    value: '1.5 TB',
    trend: { direction: 'up' as const, percentage: 0, label: 'vs last month' },
  },
  {
    title: 'Backups pending',
    value: '8 pending',
    trend: { direction: 'up' as const, percentage: 2.1, label: 'vs last month' },
  },
]

export const backupHistoryMock = [
  {
    id: '1',
    name: 'Sarah Johnson',
    type: 'Automatic' as const,
    scope: 'Full System' as const,
    createdBy: 'System',
    timestamp: '07/01/2026 02:30 AM',
    size: '2.4 GB',
    status: 'Completed' as const,
  },
  {
    id: '2',
    name: 'Daily Backup',
    type: 'Automatic' as const,
    scope: 'Partial' as const,
    createdBy: 'System',
    timestamp: '06/01/2026 02:30 AM',
    size: '1.1 GB',
    status: 'Completed' as const,
  },
  {
    id: '3',
    name: 'Pre-deploy Snapshot',
    type: 'Manual' as const,
    scope: 'Full System' as const,
    createdBy: 'Admin',
    timestamp: '05/01/2026 04:15 PM',
    size: '2.6 GB',
    status: 'Completed' as const,
  },
  {
    id: '4',
    name: 'Weekly Archive',
    type: 'Automatic' as const,
    scope: 'Partial' as const,
    createdBy: 'System',
    timestamp: '04/01/2026 02:30 AM',
    size: '980 MB',
    status: 'Pending' as const,
  },
  {
    id: '5',
    name: 'Settings Export',
    type: 'Manual' as const,
    scope: 'Partial' as const,
    createdBy: 'Admin',
    timestamp: '03/01/2026 11:00 AM',
    size: '420 MB',
    status: 'Completed' as const,
  },
]

export const backupFrequencyOptions = ['30 Seconds', 'Hourly', 'Daily', 'Weekly', 'Monthly']

export const backupRetentionOptions = ['7 Days', '14 Days', '30 Days', '60 Days', '90 Days']

export const backupStorageOptions = ['Cloud Storage', 'Local Storage', 'Hybrid Storage']
