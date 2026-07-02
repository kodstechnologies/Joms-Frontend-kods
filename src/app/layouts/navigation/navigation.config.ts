import type { LucideIcon } from 'lucide-react'
import {
  BadgePercent,
  Bell,
  Boxes,
  Building2,
  ChartNoAxesCombined,
  CreditCard,
  LifeBuoy,
  Megaphone,
  MessageCircle,
  Settings,
  Shield,
  Users,
} from 'lucide-react'

export type NavBadge =
  | {
    label: string
    variant?: 'default' | 'success' | 'warning'
  }
  | undefined

export type NavItem = {
  key: string
  label: string
  icon?: LucideIcon
  to?: string
  badge?: NavBadge
  roles?: Array<'admin' | 'manager'>
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
    key: 'user-application',
    label: 'User Application',
    icon: Users,
    children: [
      { key: 'user.dashboard', label: 'Dashboard', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'user.management', label: 'User Management', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'user.connection', label: 'Connection Request', badge: { label: 'Soon', variant: 'warning' } },
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
    key: 'content-moderation',
    label: 'Content Moderation',
    icon: Boxes,
    children: [
      { key: 'content.overview', label: 'Content Overview', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'content.community', label: 'Community Chat', badge: { label: 'Soon', variant: 'warning' } },
      { key: 'content.media', label: 'Media Library', badge: { label: 'Soon', variant: 'warning' } },
    ],
  },
  {
    key: 'communication',
    label: 'Communication',
    icon: MessageCircle,
    children: [{ key: 'communication.notifications', label: 'Broadcasts', badge: { label: 'Soon', variant: 'warning' } }],
  },
  {
    key: 'membership',
    label: 'Membership',
    icon: Building2,
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
    children: [{ key: 'referral.dashboard', label: 'Dashboard', badge: { label: 'Soon', variant: 'warning' } }],
  },
  {
    key: 'promotion',
    label: 'In-App Promotion',
    icon: Megaphone,
    children: [{ key: 'promotion.dashboard', label: 'Dashboard', badge: { label: 'Soon', variant: 'warning' } }],
  },
  {
    key: 'finance',
    label: 'Payment & Finance',
    icon: CreditCard,
    children: [{ key: 'finance.dashboard', label: 'Dashboard', badge: { label: 'Soon', variant: 'warning' } }],
  },
  {
    key: 'support',
    label: 'Support',
    icon: LifeBuoy,
    children: [{ key: 'support.tickets', label: 'Tickets', badge: { label: 'Soon', variant: 'warning' } }],
  },
  {
    key: 'resources',
    label: 'Resources',
    icon: Boxes,
    children: [{ key: 'resources.docs', label: 'Documentation', badge: { label: 'Soon', variant: 'warning' } }],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    children: [{ key: 'settings.general', label: 'General', badge: { label: 'Soon', variant: 'warning' } }],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: Bell,
    children: [{ key: 'notifications.center', label: 'Notification Center', badge: { label: 'Soon', variant: 'warning' } }],
  },
]
