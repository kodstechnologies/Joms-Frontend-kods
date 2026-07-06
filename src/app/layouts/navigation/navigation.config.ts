import type { LucideIcon } from 'lucide-react'
import {
  BadgePercent,
  Building2,
  ChartNoAxesCombined,
  CreditCard,
  LifeBuoy,
  MessageCircle,
  Settings,
  Shield,
} from 'lucide-react'

export type NavBadge =
  | {
    label: string
    variant?: 'default' | 'success' | 'warning'
  }
  | undefined

export type PermissionModule = 'venues' | 'services'

export type NavItem = {
  key: string
  label: string
  icon?: LucideIcon
  to?: string
  badge?: NavBadge
  roles?: Array<'admin' | 'manager'>
  superAdminOnly?: boolean
  permissionModule?: PermissionModule
  children?: NavItem[]
}

export const navigationConfig: NavItem[] = [
  {
    key: 'executive',
    label: 'Executive Dashboard',
    icon: ChartNoAxesCombined,
    children: [
      { key: 'executive.overview', label: 'Executive Overview', to: '/dashboard/executive' },
      { key: 'executive.metrics', label: 'Manage Metrics', badge: { label: 'Soon', variant: 'warning' } },
    ],
  },
  {
    key: 'expert-application',
    label: 'Expert Application',
    icon: Shield,
    children: [
      {
        key: 'expert.management-group',
        label: 'Expert',
        superAdminOnly: true,
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
          { key: 'expert.services.management', label: 'Service Management', to: '/services/management' },
          {
            key: "expert.services.categories",
            label: "Category Management",
            to: "/categories/management",
          },],
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
            key: "expert.venues.categories",
            label: "Category Management",
            to: "/venues/categories/management",
          },
        ],
      },
    ],
  },
  {
    key: "communication",
    label: "Communication",
    icon: MessageCircle,
    superAdminOnly: true,
    children: [
      {
        key: "communication.management",
        label: "Communication Management",
        to: "/communication/management",
      },
    ],
  },
  {
    key: 'membership',
    label: 'Membership',
    icon: Building2,
    superAdminOnly: true,
    children: [
      { key: 'membership.plans', label: 'Membership Plans', to: '/memberships/plans' },
      {
        key: 'membership.experts',
        label: 'Expert Memberships Management',
        to: '/memberships/experts',
      },
      { key: 'membership.paused', label: 'Paused Plans', to: '/memberships/plans/paused' },
      { key: 'membership.inactive', label: 'Inactive Plans', to: '/memberships/plans/inactive' },
      { key: 'membership.deleted', label: 'Deleted Plans', to: '/memberships/plans/deleted' },
    ],
  },
  {
    key: 'referral',
    label: 'Referral & Rewards',
    icon: BadgePercent,
    superAdminOnly: true,
    children: [
      { key: 'referral.management', label: 'Referral Management', to: '/referrals/management' },
    ],
  },
  {
    key: 'finance',
    label: 'Payment & Finance',
    icon: CreditCard,
    superAdminOnly: true,
    children: [{ key: 'finance.dashboard', label: 'Dashboard', badge: { label: 'Soon', variant: 'warning' } }],
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
