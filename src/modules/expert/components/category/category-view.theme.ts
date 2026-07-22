import { categoryFormTheme } from './category-form.theme'
import { categoryManagementTheme } from './category-management.theme'

export const categoryViewTheme = {
  pageBg: categoryManagementTheme.pageBg,
  surface: categoryManagementTheme.surface,
  surfaceBorder: categoryManagementTheme.surfaceBorder,
  textSecondary: categoryManagementTheme.textSecondary,
  accent: 'var(--brand-accent)',
  accentHover: 'var(--brand-gold-from)',
  delete: 'var(--brand-danger)',
  deleteHover: 'var(--brand-danger)',
  sectionTitleClass: categoryFormTheme.sectionTitleClass,
  bodyTextClass: 'text-body-md text-muted',
  labelClass: 'text-body-sm text-muted',
  valueClass: 'text-body-md text-brand-text',
  valueLgClass: 'text-body-lg font-semibold text-brand-text',
  outlineButtonClass: 'ui-cta ui-cta-outline gap-2',
  accentButtonClass: 'ui-cta ui-cta-primary gap-2',
  deleteButtonClass: 'ui-cta ui-cta-negative gap-2',
  statusActive: categoryManagementTheme.statusAccepted,
  statusPaused: categoryManagementTheme.statusPending,
} as const

export const CATEGORY_VIEW_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23081220'/%3E%3Cstop offset='50%25' stop-color='%2312386f'/%3E%3Cstop offset='100%25' stop-color='%230a1628'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='400' fill='url(%23g)'/%3E%3Cpath d='M0 260 Q200 180 400 240 T800 200 L800 400 L0 400 Z' fill='%233b82f6' fill-opacity='0.25'/%3E%3Cpath d='M0 300 Q250 220 500 280 T800 250 L800 400 L0 400 Z' fill='%2360a5fa' fill-opacity='0.18'/%3E%3C/svg%3E"

export const CATEGORY_VIEW_LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
