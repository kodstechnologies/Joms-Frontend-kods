import { useMemo, useState } from 'react'

import { useNotificationCatalog } from '../hooks/use-settings'
import type { NotificationCatalogGroup, NotificationSettings } from '../types/settings'
import { NotificationGroupCard } from './notification-group-card'
import { settingsControlClass } from './settings-control-classes'

type NotificationSettingsPanelProps = {
  value: NotificationSettings
  onChange: (value: NotificationSettings) => void
}

const FALLBACK_CATALOG: NotificationCatalogGroup[] = [
  {
    key: 'general',
    title: 'General Notifications',
    tone: 'general',
    audience: 'partnerApp',
    items: [
      {
        key: 'inApp',
        label: 'In-App Notifications',
        description: 'Show notifications within the application',
      },
      {
        key: 'push',
        label: 'Push Notifications',
        description: 'Send push notifications to mobile devices',
      },
      {
        key: 'email',
        label: 'Email Notifications',
        description: 'Send email notifications to partners',
      },
      {
        key: 'venue',
        label: 'Venue Notifications',
        description: 'Notifications for venue bookings, approvals, and availability updates',
      },
    ],
  },
  {
    key: 'timeSensitive',
    title: 'Time-sensitive notification',
    tone: 'timeSensitive',
    audience: 'partnerApp',
    items: [
      {
        key: 'sms',
        label: 'SMS Notifications',
        description:
          'Send SMS text messages to partners. Login and verification OTPs are always sent.',
      },
      {
        key: 'membershipSubscription',
        label: 'Membership & Subscription Notifications',
        description: 'Partner plan activation, renewals, expiry, and subscription alerts',
      },
      {
        key: 'bulkEmail',
        label: 'Bulk Email Operations',
        description: 'Send mass emails to partner audiences',
      },
    ],
  },
  {
    key: 'critical',
    title: 'Critical Notification',
    tone: 'critical',
    audience: 'adminPanel',
    items: [
      {
        key: 'accountSecurity',
        label: 'Account & Security Notifications',
        description: 'Alerts related to login activity, account status, and security actions',
      },
      {
        key: 'paymentsTransaction',
        label: 'Payments & Transaction Notifications',
        description: 'Updates on payments, refunds, invoices, and transaction status',
      },
      {
        key: 'reportsAbuseModeration',
        label: 'Reports, Abuse & Moderation Notifications',
        description: 'Notifications triggered by user reports and moderation actions',
      },
      {
        key: 'userAccountSuspension',
        label: 'User Account Suspension',
        description: 'Alerts when a partner or admin account is suspended or blocked',
      },
      {
        key: 'rolePermissionModification',
        label: 'Role & Permission Modification',
        description: 'Alerts when admin roles or access permissions change',
      },
      {
        key: 'paymentGatewayConfiguration',
        label: 'Payment Gateway Configuration',
        description: 'Alerts when payment processing settings or integrations change',
      },
    ],
  },
  {
    key: 'adminPanel',
    title: 'Admin Panel Notification',
    tone: 'adminPanel',
    audience: 'adminPanel',
    items: [
      {
        key: 'coverageSupport',
        label: 'Coverage & Support Notifications',
        description: 'Updates on customer support requests and helpdesk tickets',
      },
      {
        key: 'permanentUserDeletion',
        label: 'Permanent User Deletion',
        description: 'Alerts when partner accounts are permanently deleted',
      },
      {
        key: 'databaseOperations',
        label: 'Database Operations',
        description: 'Notifications for executing direct database queries and bulk operations',
      },
      {
        key: 'systemMaintenanceMode',
        label: 'System Maintenance Mode',
        description: 'Alerts when maintenance mode is enabled or disabled',
      },
    ],
  },
]

export function NotificationSettingsPanel({ value, onChange }: NotificationSettingsPanelProps) {
  const [search, setSearch] = useState('')
  const catalogQuery = useNotificationCatalog()
  const catalog = catalogQuery.data?.length ? catalogQuery.data : FALLBACK_CATALOG

  const query = search.trim().toLowerCase()

  const groups = useMemo(() => {
    return catalog
      .map((group) => {
        const items = query
          ? group.items.filter(
              (item) =>
                item.label.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query),
            )
          : group.items

        return {
          key: group.key,
          title: group.title,
          tone: group.tone,
          items,
          values: value[group.key],
          onChange: (key: string, checked: boolean) =>
            onChange({
              ...value,
              [group.key]: {
                ...value[group.key],
                [key]: checked,
              },
            }),
        }
      })
      .filter((group) => group.items.length > 0)
  }, [catalog, onChange, query, value])

  return (
    <div className="space-y-6">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search notifications"
        className={settingsControlClass}
      />

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 text-center text-sm text-slate-400">
          No notification settings match your search.
        </div>
      ) : (
        groups.map((group) => (
          <NotificationGroupCard
            key={group.key}
            title={group.title}
            tone={group.tone}
            items={group.items}
            values={group.values}
            onChange={group.onChange}
          />
        ))
      )}
    </div>
  )
}
