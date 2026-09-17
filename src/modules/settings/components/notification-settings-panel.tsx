import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'

import { useNotificationCatalog } from '../hooks/use-settings'
import type { NotificationCatalogGroup, NotificationSettings } from '../types/settings'
import { NotificationGroupCard } from './notification-group-card'

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
        description: 'Send email notifications to users',
      },
      {
        key: 'venue',
        label: 'Venue Notifications',
        description: 'Notifications for venue bookings, approvals, and availability updates',
      },
      {
        key: 'community',
        label: 'Community Notifications',
        description: 'Activity alerts from communities, including posts, joins, and moderation',
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
        description: 'Send SMS text messages (requires SMS provider)',
      },
      {
        key: 'membershipSubscription',
        label: 'Membership & Subscription Notifications',
        description: 'Alerts related to plan activation, renewals, expiry, and suspension',
      },
      {
        key: 'bulkEmail',
        label: 'Bulk Email Operations',
        description: 'Send mass emails to multiple user segments',
      },
      {
        key: 'dataExport',
        label: 'Data Export',
        description: 'Allow exporting user and system data',
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
        key: 'escalations',
        label: 'Escalation Notifications',
        description: 'Alerts when tickets or applications are escalated for review',
      },
      {
        key: 'rolePermissionModification',
        label: 'Role & Permission Modification',
        description: 'Change user roles and access permissions',
      },
      {
        key: 'paymentGatewayConfiguration',
        label: 'Payment Gateway Configuration',
        description: 'Modify payment processing settings and integrations',
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
        description: 'Updates on customer support requests and customer community',
      },
      {
        key: 'permanentUserDeletion',
        label: 'Permanent User Deletion',
        description: 'Permanently delete user accounts and all associated data',
      },
      {
        key: 'databaseOperations',
        label: 'Database Operations',
        description: 'Execute direct database queries and bulk operations',
      },
      {
        key: 'systemMaintenanceMode',
        label: 'System Maintenance Mode',
        description: 'Enable maintenance mode and system-wide shutdowns',
      },
      {
        key: 'rolePermissionModification',
        label: 'Role & Permission Modification',
        description: 'Change user roles and access permissions',
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
    <div className="notif-settings-panel">
      <div className="notif-search-wrap">
        <Search className="notif-search-icon" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, ID or profession"
          aria-label="Search notifications"
          className="notif-search-input"
        />
        {search.trim() ? (
          <button
            type="button"
            className="notif-search-clear"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {groups.length === 0 ? (
        <div className="notif-empty">No notification settings match your search.</div>
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
