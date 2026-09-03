/** Admin Logs metrics for the RBAC / access settings surface. */

export const ADMIN_LOGS_MODULE_KEY = 'admin-logs'

export const ADMIN_LOGS_METRICS_CATALOG = [
  {
    id: 'events-today',
    label: 'Events Today',
    type: 'Count',
    description: 'Log events today',
    defaultActive: true,
  },
  {
    id: 'critical',
    label: 'Critical',
    type: 'Count',
    description: 'Critical events',
    defaultActive: true,
  },
  {
    id: 'warnings',
    label: 'Warnings',
    type: 'Count',
    description: 'Warning events',
    defaultActive: true,
  },
  {
    id: 'unique-actors',
    label: 'Unique Actors',
    type: 'Count',
    description: 'Distinct actors',
    defaultActive: true,
  },
] as const

export const ADMIN_LOGS_MAX_ACTIVE_METRICS = ADMIN_LOGS_METRICS_CATALOG.length
