export const uiTokens = {
  radiusCard: 'rounded-brand-lg',
  radiusSoft: 'rounded-brand-md',
  radiusPill: 'rounded-brand-pill',
  radiusPopup: 'rounded-brand-popup',
  borderSubtle: 'border border-white/10 dark:border-white/10',
  borderSoft: 'border border-white/8',
  borderStrong: 'border border-brand-accent-muted',
  shellBg: 'bg-brand-bg',
  sidebarBg: 'bg-brand-surface',
  headerBg: 'bg-brand-surface/90',
  surface0: 'bg-brand-surface-2',
  surface1: 'bg-brand-surface',
  surface2: 'bg-white/7',
  surfaceCardBg: 'bg-brand-surface',
  surfaceCardHover: 'hover:border-brand-accent-muted',
  shadowCard: 'shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
  shadowElevated: 'shadow-[0_18px_60px_rgba(0,0,0,0.55)]',
  focusRing: 'focus-visible:ring-2 focus-visible:ring-brand-accent/40',
  goldGradient: 'bg-gradient-to-b from-brand-gold-from to-brand-gold-to',
} as const

export const statusCardTones = {
  warning: {
    background: 'bg-[color-mix(in_srgb,var(--brand-gold-from)_22%,black)]',
    border: 'border-brand-accent-muted',
  },
  danger: {
    background: 'bg-[color-mix(in_srgb,var(--brand-danger)_18%,black)]',
    border: 'border-brand-danger-muted',
  },
} as const
