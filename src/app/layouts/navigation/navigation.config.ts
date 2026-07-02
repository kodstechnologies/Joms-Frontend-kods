import type { LucideIcon } from 'lucide-react'
import {
  BadgePercent,
  Building2,
  ChartNoAxesCombined,
  CreditCard,
  LifeBuoy,
  Megaphone,
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
            badge: { label: 'Soon', variant: 'warning' },
          },
          {
            key: 'expert.management.list',
            label: 'Expert Management',
            to: '/experts/management',
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
          { key: 'expert.services.leaderboard', label: 'Leaderboard', to: '/services/leaderboard' },
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
        ],
      },
    ],
  },
  {
    key: 'communication',
    label: 'Communication',
    icon: MessageCircle,
    superAdminOnly: true,
    children: [{ key: 'communication.notifications', label: 'Broadcasts', badge: { label: 'Soon', variant: 'warning' } }],
  },
  {
    key: 'membership',
    label: 'Membership',
    icon: Building2,
    superAdminOnly: true,
    children: [
      { key: 'membership.plans', label: 'Membership Plans', to: '/memberships/plans' },
      {
        key: 'membership.users',
        label: 'Users Memberships Management',
        badge: { label: 'Soon', variant: 'warning' },
      },
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
    key: 'promotion',
    label: 'In-App Promotion',
    icon: Megaphone,
    superAdminOnly: true,
    children: [{ key: 'promotion.dashboard', label: 'Dashboard', badge: { label: 'Soon', variant: 'warning' } }],
  },
  {
    key: 'finance',
    label: 'Payment & Finance',
    icon: CreditCard,
    superAdminOnly: true,
    children: [
      { key: 'finance.dashboard', label: 'Dashboard', to: '/finance/dashboard' },
      { key: 'finance.revenue', label: 'Revenue Overview', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'finance.events', label: 'Events', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'finance.services', label: 'Services', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'finance.venues', label: 'Venues', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'finance.memberships', label: 'Memberships', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'finance.payment', label: 'Payment Management', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'finance.refunds', label: 'Refunds & Chargebacks', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'finance.tax', label: 'Tax & Compliance', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'finance.invoices', label: 'Invoices & Billing', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'finance.reconciliation', label: 'Financial Reconciliation', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'finance.category', label: 'Category Management', badge: { label: 'Soon', variant: 'warning' } },
    ],
  },
  {
    key: 'support',
    label: 'Support',
    icon: LifeBuoy,
    superAdminOnly: true,
    children: [{ key: 'support.tickets', label: 'Tickets', badge: { label: 'Soon', variant: 'warning' } }],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    superAdminOnly: true,
    children: [
      {
        key: 'settings.access',
        label: 'Role Based Access',
        to: '/settings/access',
      },
      { key: 'settings.general', label: 'General', badge: { label: 'Soon', variant: 'warning' } },
    ],
  },
]
