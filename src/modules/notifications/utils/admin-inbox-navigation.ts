import type { InAppNotification } from '../api/notifications-api'

export type AdminInboxNavigation = {
  path: string
  state?: Record<string, unknown>
}

const FIRST_PATH = (value?: unknown) => {
  const path = String(value || '').trim()
  return path.startsWith('/') ? path : null
}

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    const normalized = String(value ?? '').trim()
    if (normalized) return normalized
  }
  return ''
}

const inferEventTypeFromBody = (body: string) => {
  const text = body.toLowerCase()
  if (text.includes('incident was opened') || text.includes('production incident')) {
    return 'INCIDENT_OPENED'
  }
  if (text.includes('admin account was locked') || text.includes('account was locked after')) {
    return 'ADMIN_ACCOUNT_LOCKED'
  }
  if (text.includes('razorpay api') || text.includes('payment gateway not responding')) {
    return 'PAYMENT_GATEWAY_DOWN'
  }
  if (text.includes('breached sla') || text.includes('support sla')) {
    return 'SUPPORT_SLA_BREACH'
  }
  if (text.includes('chargeback')) {
    return 'CHARGEBACK_OPENED'
  }
  if (text.includes('listing is being reported') || text.includes('content reported by')) {
    return 'CONTENT_REPORT_THRESHOLD'
  }
  if (text.includes('expert has been reported') || text.includes('reported 10+ times')) {
    return 'EXPERT_REPORT_THRESHOLD'
  }
  if (text.includes('payment transaction failed') || text.includes('payment failed')) {
    return 'PAYMENT_FAILED'
  }
  return ''
}

const buildIds = (item: InAppNotification, params: Record<string, string>) => ({
  partnerId: pickString(item.metadata?.partnerId, params.partnerId),
  paymentId: pickString(item.metadata?.paymentId, params.paymentId),
  roleId: pickString(item.metadata?.roleId, params.roleId),
  ticketId: pickString(
    item.metadata?.ticketId,
    item.metadata?.zohoTicketId,
    params.ticketId,
    params.zohoTicketId,
  ),
  refundId: pickString(item.metadata?.refundId, params.refundId),
  disputeId: pickString(item.metadata?.disputeId, params.disputeId),
  serviceId: pickString(
    item.metadata?.serviceId,
    item.metadata?.listingId,
    params.serviceId,
    params.listingId,
  ),
  reportId: pickString(item.metadata?.reportId, params.reportId),
  incidentId: pickString(item.metadata?.incidentId, params.incidentId),
})

const resolveByEventType = (
  eventType: string,
  ids: ReturnType<typeof buildIds>,
): AdminInboxNavigation | null => {
  if (eventType === 'PAYMENT_FAILED') {
    return {
      path: ids.paymentId ? `/finance/revenue/${ids.paymentId}` : '/finance/revenue',
    }
  }

  if (eventType === 'EXPERT_REPORT_THRESHOLD' || eventType === 'EXPERT_REPORT_SUBMITTED') {
    if (ids.partnerId) {
      return { path: `/experts/management/profile/${ids.partnerId}` }
    }
    if (ids.reportId) {
      return {
        path: '/experts/reported',
        state: { openReportId: ids.reportId },
      }
    }
    return { path: '/experts/reported' }
  }

  if (eventType === 'CONTENT_REPORT_THRESHOLD') {
    if (ids.serviceId) {
      return { path: `/services/management/view/${ids.serviceId}` }
    }
    return { path: '/experts/reported' }
  }

  if (eventType === 'CHARGEBACK_OPENED') {
    if (ids.disputeId) {
      return { path: `/finance/refunds/${ids.disputeId}/dispute` }
    }
    if (ids.refundId) {
      return { path: `/finance/refunds/${ids.refundId}` }
    }
    return { path: '/finance/refunds' }
  }

  if (eventType === 'SUPPORT_SLA_BREACH') {
    return {
      path: ids.ticketId ? `/support/tickets/${ids.ticketId}` : '/support/tickets',
    }
  }

  if (eventType === 'PAYMENT_GATEWAY_DOWN') {
    return { path: '/settings/health' }
  }

  if (eventType === 'INCIDENT_OPENED') {
    if (ids.ticketId) {
      return { path: `/support/tickets/${ids.ticketId}` }
    }
    const search = ids.incidentId
      ? `?tab=incident&incidentId=${encodeURIComponent(ids.incidentId)}`
      : '?tab=incident'
    return { path: `/settings/main${search}` }
  }

  if (eventType === 'ADMIN_ACCOUNT_LOCKED') {
    return { path: '/settings/security/locked-accounts' }
  }

  if (eventType === 'ADMIN_ESCALATION_ASSIGNED' || eventType.includes('ESCALATION')) {
    if (ids.ticketId) {
      return { path: `/support/tickets/${ids.ticketId}` }
    }
    return { path: '/my-tasks' }
  }

  if (eventType.startsWith('EXPERT_REPORT')) {
    if (ids.partnerId) {
      return { path: `/experts/management/profile/${ids.partnerId}` }
    }
    return { path: '/experts/reported' }
  }

  if (eventType.startsWith('SUPPORT_')) {
    return {
      path: ids.ticketId ? `/support/tickets/${ids.ticketId}` : '/support/tickets',
    }
  }

  if (eventType === 'ADMIN_LOGIN_ALERT') {
    return { path: '/settings/security/login-trails' }
  }

  if (eventType.startsWith('ADMIN_ROLE_')) {
    return {
      path: ids.roleId ? `/settings/access/roles/${ids.roleId}/edit` : '/settings/access',
    }
  }

  if (eventType === 'SYSTEM_MAINTENANCE_MODE' || eventType === 'PAYMENT_GATEWAY_CONFIG_CHANGED') {
    return { path: '/settings/main?tab=platform' }
  }

  if (eventType.includes('SUSPEND') || eventType.includes('BLOCK') || eventType.includes('DELET')) {
    return {
      path: ids.partnerId ? `/experts/management/profile/${ids.partnerId}` : '/experts/management',
    }
  }

  return null
}

export const resolveAdminInboxNavigation = (item: InAppNotification): AdminInboxNavigation => {
  const params = item.deepLink?.params || {}
  const fromLink = FIRST_PATH(params.path)
  const ids = buildIds(item, params)

  if (fromLink && fromLink !== '/my-tasks') {
    return { path: fromLink }
  }

  const eventType = pickString(
    item.eventType,
    item.metadata?.eventType,
    inferEventTypeFromBody(item.body),
  )
  const resolved = eventType ? resolveByEventType(eventType, ids) : null
  if (resolved) return resolved

  if (item.kind === 'alert') {
    const fallback = FIRST_PATH(params.fallbackPath)
    if (fallback) return { path: fallback }
  }

  return { path: '/my-tasks' }
}

export const resolveAdminInboxPath = (item: InAppNotification): string =>
  resolveAdminInboxNavigation(item).path
