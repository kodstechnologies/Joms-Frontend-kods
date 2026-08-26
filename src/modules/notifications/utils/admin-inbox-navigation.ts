import type { InAppNotification } from '../api/notifications-api'

const FIRST_PATH = (value?: unknown) => {
  const path = String(value || '').trim()
  return path.startsWith('/') ? path : null
}

export const resolveAdminInboxPath = (item: InAppNotification): string => {
  const params = item.deepLink?.params || {}
  const fromLink = FIRST_PATH(params.path)
  if (fromLink) return fromLink

  const eventType = String(item.eventType || item.metadata?.eventType || '')
  const partnerId = String(item.metadata?.partnerId || params.partnerId || '').trim()
  const paymentId = String(item.metadata?.paymentId || params.paymentId || '').trim()
  const roleId = String(item.metadata?.roleId || params.roleId || '').trim()
  const ticketId = String(
    item.metadata?.ticketId || item.metadata?.zohoTicketId || params.zohoTicketId || '',
  ).trim()

  if (eventType === 'PAYMENT_FAILED') {
    return paymentId ? `/finance/revenue/${paymentId}` : '/finance/revenue'
  }
  if (eventType === 'EXPERT_REPORT_THRESHOLD') {
    return partnerId ? `/experts/management/profile/${partnerId}` : '/my-tasks'
  }
  if (eventType === 'CONTENT_REPORT_THRESHOLD') {
    return '/experts/reported'
  }
  if (eventType === 'CHARGEBACK_OPENED') {
    return '/finance/refunds'
  }
  if (eventType === 'SUPPORT_SLA_BREACH') {
    return ticketId ? `/support/tickets/${ticketId}` : '/support/tickets'
  }
  if (eventType === 'PAYMENT_GATEWAY_DOWN' || eventType === 'INCIDENT_OPENED') {
    return '/settings/health'
  }
  if (eventType === 'ADMIN_ACCOUNT_LOCKED') {
    return '/settings/security/locked-accounts'
  }
  if (eventType.startsWith('EXPERT_REPORT')) {
    return '/experts/reported'
  }
  if (eventType.startsWith('SUPPORT_')) {
    return ticketId ? `/support/tickets/${ticketId}` : '/support/tickets'
  }
  if (eventType === 'ADMIN_LOGIN_ALERT') {
    return '/settings/security/login-trails'
  }
  if (eventType.startsWith('ADMIN_ROLE_')) {
    return roleId ? `/settings/access/roles/${roleId}/edit` : '/settings/access'
  }
  if (eventType === 'SYSTEM_MAINTENANCE_MODE') {
    return '/settings/system'
  }
  if (eventType === 'PAYMENT_GATEWAY_CONFIG_CHANGED') {
    return '/settings/system'
  }
  if (eventType.includes('SUSPEND') || eventType.includes('BLOCK') || eventType.includes('DELET')) {
    return partnerId ? `/experts/management/profile/${partnerId}` : '/experts/management'
  }

  if (item.kind === 'alert') {
    return FIRST_PATH(params.fallbackPath) || '/my-tasks'
  }

  return ''
}
