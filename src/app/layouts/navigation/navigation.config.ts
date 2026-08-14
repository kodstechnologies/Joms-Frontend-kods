import type { LucideIcon } from 'lucide-react'
import {
  BadgePercent,
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  CreditCard,
  LifeBuoy,
  Settings,
  Shield,
  ShieldAlert,
} from 'lucide-react'

export type NavBadge =
  | {
      label: string
      variant?: 'default' | 'success' | 'warning'
    }
  | undefined

export type PermissionModule = 'venues' | 'services' | 'experts'

export type NavItem = {
  key: string
  label: string
  icon?: LucideIcon
  to?: string
  badge?: NavBadge
  roles?: Array<'admin' | 'manager'>
  superAdminOnly?: boolean
  permissionModule?: PermissionModule
  matchPaths?: string[]
  children?: NavItem[]
}

export const navigationConfig: NavItem[] = [
  {
    key: 'executive',
    label: 'Executive Dashboard',
    icon: ChartNoAxesCombined,
    to: '/dashboard/executive',
  },
  {
    key: 'my-task',
    label: 'My Task',
    icon: ClipboardList,
    to: '/my-tasks',
  },
  {
    key: 'expert-application',
    label: 'Expert Application',
    icon: Shield,
    children: [
      {
        key: 'expert.management-group',
        label: 'Expert',
        permissionModule: 'experts',
        children: [
          {
            key: 'expert.management.dashboard',
            label: 'Dashboard',
            to: '/experts/dashboard',
          },
          {
            key: 'expert.management.list',
            label: 'Expert Management',
            to: '/experts/management',
            matchPaths: [
              '/experts/pending-approvals',
              '/experts/suspended',
              '/experts/reported',
              '/experts/deleted',
            ],
          },
          {
            key: 'expert.management.leaderboard',
            label: 'Leaderboard',
            to: '/experts/leaderboard',
          },
        ],
      },
      {
        key: 'expert.services-group',
        label: 'Services',
        permissionModule: 'services',
        children: [
          { key: 'expert.services.dashboard', label: 'Dashboard', to: '/services/dashboard' },
          {
            key: 'expert.services.management',
            label: 'Service Management',
            to: '/services/management',
          },
          {
            key: 'expert.services.categories',
            label: 'Category Management',
            to: '/categories/management',
          },
        ],
      },
      {
        key: 'expert.venues-group',
        label: 'Venues',
        permissionModule: 'venues',
        children: [
          { key: 'expert.venues.dashboard', label: 'Dashboard', to: '/venues/dashboard' },
          { key: 'expert.venue.management', label: 'Venue Management', to: '/venues/management' },
          { key: 'expert.venues.leaderboard', label: 'Leaderboard', to: '/venues/leaderboard' },
          {
            key: 'expert.venues.categories',
            label: 'Category Management',
            to: '/venues/categories/management',
          },
        ],
      },
    ],
  },
  {
    key: 'content-moderation',
    label: 'Content Moderation',
    icon: ShieldAlert,
    superAdminOnly: true,
    children: [
      {
        key: 'content-moderation.communication',
        label: 'Communication',
        to: '/communication/management',
        matchPaths: ['/communication/create', '/communication/view/:id', '/communication/view'],
      },
      {
        key: 'content-moderation.templates',
        label: 'Templates',
        to: '/content-moderation/templates',
        matchPaths: ['/settings/templates'],
      },
    ],
  },
  {
    key: 'membership',
    label: 'Membership',
    icon: Building2,
    to: '/memberships/plans',
    superAdminOnly: true,
  },
  {
    key: 'referral',
    label: 'Referral Management',
    icon: BadgePercent,
    to: '/referrals/management',
    superAdminOnly: true,
  },
  {
    key: 'finance',
    label: 'Payment & Finance',
    icon: CreditCard,
    superAdminOnly: true,
    children: [
      { key: 'finance.dashboard', label: 'Dashboard', to: '/finance/dashboard' },
      { key: 'finance.revenue', label: 'Revenue Overview', to: '/finance/revenue' },
      // Events muted — no finance event payment pipeline yet (route kept, hidden from nav)
      { key: 'finance.services', label: 'Services', to: '/finance/services' },
      { key: 'finance.venues', label: 'Venues', to: '/finance/venues' },
      { key: 'finance.memberships', label: 'Memberships', to: '/finance/memberships' },
      { key: 'finance.payouts', label: 'Payout Management', to: '/finance/payouts' },
      { key: 'finance.refunds', label: 'Refunds & Chargebacks', to: '/finance/refunds' },
      { key: 'finance.tax', label: 'Tax & Compliance', to: '/finance/tax' },
      { key: 'finance.invoices', label: 'Invoices & Billing', to: '/finance/invoices' },
      {
        key: 'finance.reconciliation',
        label: 'Financial Reconciliation',
        to: '/finance/reconciliation',
      },
      // Category Management muted — mock-only, no finance category API (route kept, hidden from nav)
    ],
  },
  {
    key: 'support',
    label: 'Support',
    icon: LifeBuoy,
    superAdminOnly: true,
    children: [
      { key: 'support.dashboard', label: 'Dashboard', to: '/support/dashboard' },
      { key: 'support.tickets', label: 'Ticket Management', to: '/support/tickets' },
      { key: 'support.workspace', label: 'Support Workspace', to: '/support/workspace' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    superAdminOnly: true,
    children: [
      {
        key: 'settings.health',
        label: 'Platform Health Dashboard',
        to: '/settings/health',
      },
      {
        key: 'settings.main',
        label: 'Main Settings',
        to: '/settings/main',
      },
      {
        key: 'settings.access',
        label: 'Role Based Access Control',
        to: '/settings/access',
      },
      {
        key: 'settings.categories',
        label: 'Category Management',
        to: '/settings/categories',
      },
      {
        key: 'settings.system',
        label: 'System Configuration',
        to: '/settings/system',
      },
      {
        key: 'settings.escalations',
        label: 'Escalations',
        to: '/settings/escalations',
      },
      {
        key: 'settings.api-keys',
        label: 'API Key Management',
        to: '/settings/api-keys',
      },
    ],
  },
]
