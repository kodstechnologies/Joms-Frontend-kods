import calendarIcon from '@/assets/JOMS_ICONS-2/icons8-calendar.svg'
import supportIcon from '@/assets/JOMS_ICONS-2/icons8-customer-support-24.svg'
import documentIcon from '@/assets/JOMS_ICONS-2/icons8-document_FAQ_digilocker.svg'
import disputeIcon from '@/assets/JOMS_ICONS-2/icons8-dispute-24.svg'
import moneyIcon from '@/assets/JOMS_ICONS-2/icons8-money-bag-rupee-24.svg'
import usersIcon from '@/assets/JOMS_ICONS-2/icons8-users.svg'
import fileSearchIcon from '@/assets/JOMS_ICONS-2/file search.svg'
import type { InAppNotification } from '../api/notifications-api'

export const getNotificationCategory = (item: InAppNotification) =>
  String(item.metadata?.category || item.metadata?.typeLabel || item.eventType || 'Communication')

export const getNotificationCategoryLabel = (item: InAppNotification) => {
  const category = getNotificationCategory(item)
  const labels: Record<string, string> = {
    'critical.accountSecurity': 'Account & Security',
    'critical.paymentsTransaction': 'Payments',
    'critical.reportsAbuseModeration': 'Content Moderation',
    'critical.userAccountSuspension': 'User Management',
    'critical.rolePermissionModification': 'Access',
    'critical.paymentGatewayConfiguration': 'Payments',
    'adminPanel.coverageSupport': 'Customer Support',
    'adminPanel.permanentUserDeletion': 'User Management',
    'adminPanel.systemMaintenanceMode': 'System',
    'adminPanel.databaseOperations': 'Database',
  }
  if (labels[category]) return labels[category]
  if (/report|moderation|abuse/i.test(category)) return 'Content Moderation'
  if (/payment|refund|finance/i.test(category)) return 'Payments'
  if (/support|ticket/i.test(category)) return 'Customer Support'
  if (/user|expert|partner|account/i.test(category)) return 'User Management'
  if (/event/i.test(category)) return 'Events'
  return (
    category
      .replace(/^[a-z]+\./, '')
      .replace(/([A-Z])/g, ' $1')
      .trim() || 'Notification'
  )
}

export const getInboxRowIcon = (item: InAppNotification) => {
  const category = `${getNotificationCategory(item)} ${item.eventType || ''} ${item.title}`
  if (/payment|refund|gateway|finance|transaction/i.test(category)) return moneyIcon
  if (/dispute|chargeback/i.test(category)) return disputeIcon
  if (/report|moderation|abuse|content/i.test(category)) return fileSearchIcon
  if (/support|ticket|coverage/i.test(category)) return supportIcon
  if (/role|permission|rbac|access/i.test(category)) return documentIcon
  if (/event|calendar/i.test(category)) return calendarIcon
  if (/user|expert|partner|account|security|login|delet|suspend/i.test(category)) return usersIcon
  return supportIcon
}
