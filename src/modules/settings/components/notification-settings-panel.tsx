import { useMemo, useState } from 'react'

import { NotificationGroupCard } from './notification-group-card'
import type { NotificationSettings } from '../types/settings'
import { settingsControlClass } from './settings-field-row'

type NotificationSettingsPanelProps = {
  value: NotificationSettings
  onChange: (value: NotificationSettings) => void
}

const GENERAL_ITEMS = [
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
  { key: 'email', label: 'Email Notifications', description: 'Send email notifications to users' },
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
]

const TIME_SENSITIVE_ITEMS = [
  {
    key: 'sms',
    label: 'SMS Notifications',
    description: 'Send SMS text messages (requires SMS provider)',
  },
  {
    key: 'event',
    label: 'Event Notifications',
    description: 'Updates about event creation, approvals, changes, and live status',
  },
  {
    key: 'networking',
    label: 'Networking Notifications',
    description: 'Connection requests, messages, and profile interaction alerts',
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
  { key: 'dataExport', label: 'Data Export', description: 'Allow exporting user and system data' },
]

const CRITICAL_ITEMS = [
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
    description: 'Temporarily disable user account',
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
]

const ADMIN_PANEL_ITEMS = [
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
]

export function NotificationSettingsPanel({ value, onChange }: NotificationSettingsPanelProps) {
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()

  const groups = useMemo(() => {
    const filterItems = (items: typeof GENERAL_ITEMS) =>
      query
        ? items.filter(
            (item) =>
              item.label.toLowerCase().includes(query) ||
              item.description.toLowerCase().includes(query),
          )
        : items

    return [
      {
        key: 'general' as const,
        title: 'General Notifications',
        tone: 'general' as const,
        items: filterItems(GENERAL_ITEMS),
        values: value.general,
        onChange: (key: string, checked: boolean) =>
          onChange({
            ...value,
            general: { ...value.general, [key]: checked },
          }),
      },
      {
        key: 'timeSensitive' as const,
        title: 'Time-sensitive notification',
        tone: 'timeSensitive' as const,
        items: filterItems(TIME_SENSITIVE_ITEMS),
        values: value.timeSensitive,
        onChange: (key: string, checked: boolean) =>
          onChange({
            ...value,
            timeSensitive: { ...value.timeSensitive, [key]: checked },
          }),
      },
      {
        key: 'critical' as const,
        title: 'Critical Notification',
        tone: 'critical' as const,
        items: filterItems(CRITICAL_ITEMS),
        values: value.critical,
        onChange: (key: string, checked: boolean) =>
          onChange({
            ...value,
            critical: { ...value.critical, [key]: checked },
          }),
      },
      {
        key: 'adminPanel' as const,
        title: 'Admin Panel Notification',
        tone: 'adminPanel' as const,
        items: filterItems(ADMIN_PANEL_ITEMS),
        values: value.adminPanel,
        onChange: (key: string, checked: boolean) =>
          onChange({
            ...value,
            adminPanel: { ...value.adminPanel, [key]: checked },
          }),
      },
    ]
  }, [value, onChange, query])

  const visibleGroups = groups.filter((group) => group.items.length > 0)

  return (
    <div className="space-y-6">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by name, ID or profession"
        className={settingsControlClass}
      />

      {visibleGroups.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 text-center text-sm text-slate-400">
          No notification settings match your search.
        </div>
      ) : (
        visibleGroups.map((group) => (
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
