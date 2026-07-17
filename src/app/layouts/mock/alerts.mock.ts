export type AlertSeverity = 'warning' | 'info'

export type AlertItem = {
  id: string
  severity: AlertSeverity
  title: string
  message: string
  createdAt: string
  group: 'today' | 'older'
  /** Optional avatar initials shown on report-style alerts */
  avatars?: string[]
}

/**
 * Static operations alerts (Figma Alerts panel).
 * Includes Payment API / Razorpay unavailability until live health checks are wired.
 */
export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alert-content-report',
    severity: 'warning',
    title: 'Content Report Alert',
    message: 'A content is being reported by 10+ users. Please pay attention immediately.',
    createdAt: 'Now',
    group: 'today',
    avatars: ['S', 'S'],
  },
  {
    id: 'alert-user-report',
    severity: 'warning',
    title: 'User Report Alert',
    message: 'A User is being reported by 10+ users. Please pay attention immediately.',
    createdAt: 'Now',
    group: 'today',
  },
  {
    id: 'alert-payment-api',
    severity: 'warning',
    title: 'Payment API Alert',
    message: 'Razor Pay API is not responding to the calls . Please pay attention immediately.',
    createdAt: 'Now',
    group: 'today',
  },
  {
    id: 'alert-membership-fulfill',
    severity: 'warning',
    title: 'Payment Fulfillment Alert',
    message:
      'Membership payment verification is delayed. Check payment-service and Razorpay webhook.',
    createdAt: '2 hr ago',
    group: 'today',
  },
  {
    id: 'alert-gateway-toggle',
    severity: 'info',
    title: 'Payment Gateway Notice',
    message: 'Razorpay is enabled in Finance settings. Monitor gateway health during peak hours.',
    createdAt: '1 day ago',
    group: 'older',
  },
]
