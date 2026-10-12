import type { PolicyNotificationsResult, PolicyNotifyVia } from '../types/settings'

export type EffectiveTiming = 'today' | 'future'

export type { PolicyNotifyVia }

export type PolicyEditorValues = {
  title: string
  slug: string
  currentVersion: string
  newVersion: string
  effectiveSince: string
  content: string
  changeSummary: string
  effectiveTiming: EffectiveTiming
  futureEffectiveDate: string
  requireReConsent: boolean
  blockAppUsageUntilAccepted: boolean
  notifyVia: PolicyNotifyVia
}

// Email, in-app, and push all start switched on.
export const defaultNotifyVia = (): PolicyNotifyVia => ({
  email: true,
  inApp: true,
  push: true,
})

export const formatPolicyDate = (value: Date) => {
  const day = String(value.getDate()).padStart(2, '0')
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const year = value.getFullYear()
  return `${day}/${month}/${year}`
}

export const formatPolicyDateUs = (value: Date | string) => {
  const date =
    typeof value === 'string' ? new Date(value.includes('T') ? value : `${value}T00:00:00`) : value
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

export const toDateInputValue = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// The minor number goes up by one. A version that is not major.minor becomes V1.0.
export const bumpPolicyVersion = (version: string) => {
  const match = version.trim().match(/^v?(\d+)\.(\d+)$/i)
  if (!match) return 'V1.0'
  const major = Number(match[1])
  const minor = Number(match[2]) + 1
  return `V${major}.${minor}`
}

// A skipped send shows its note, or nothing when there is no note.
export const formatPolicyNotificationToast = (notifications?: PolicyNotificationsResult | null) => {
  if (!notifications || notifications.skipped) {
    return notifications?.note || null
  }
  return notifications.note || 'Partner notifications dispatched.'
}

// Today uses the current time. A future date starts at midnight on that day.
export const resolveEffectivePayload = (values: PolicyEditorValues) => {
  if (values.effectiveTiming === 'today') {
    const now = new Date()
    return {
      effectiveDate: formatPolicyDate(now),
      effectiveAt: now.toISOString(),
    }
  }

  const futureDate = values.futureEffectiveDate
    ? new Date(`${values.futureEffectiveDate}T00:00:00`)
    : new Date()

  return {
    effectiveDate: formatPolicyDate(futureDate),
    effectiveAt: futureDate.toISOString(),
  }
}
