// A price that is not a number is treated as zero.
export const parsePrice = (value: string) => {
  const numeric = value.replace(/[^\d.]/g, '')
  const parsed = Number.parseFloat(numeric)
  return Number.isNaN(parsed) ? 0 : parsed
}

export const DISCOUNT_PRESET_PCTS = [10, 15, 20] as const

export const formatDiscountChip = (pct: number) => `${pct}%`

// A blank or non-numeric discount is treated as zero.
export const parseDiscountPct = (value: string) =>
  Number.parseInt(String(value).replace('%', ''), 10) || 0

// The discount is taken off first. The platform fee and GST are then taken from that price, and earnings never go below zero.
export const computeListingFeeBreakdown = (
  price: number,
  discountPct: number,
  platformFeePct: number,
  gstPct: number,
) => {
  const discounted = Math.round(Math.max(0, price) * (1 - Math.max(0, discountPct) / 100))
  const platformFee = Math.round(discounted * (platformFeePct / 100))
  const gst = Math.round(discounted * (gstPct / 100))
  return {
    discounted_price: discounted,
    platform_fee: platformFee,
    platform_fee_pct: platformFeePct,
    gst,
    gst_pct: gstPct,
    estimated_earnings: Math.max(discounted - platformFee - gst, 0),
  }
}

// A singular day, week, or month is stored in the plural. Anything else is stored as days.
export const normalizeTimelineUnit = (unit: string): 'days' | 'weeks' | 'months' => {
  const normalized = unit.trim().toLowerCase().replace(/s$/, '')
  switch (normalized) {
    case 'week':
      return 'weeks'
    case 'month':
      return 'months'
    case 'day':
    default:
      return 'days'
  }
}

export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const

export const CONSULTATION_MODES = [{ label: 'Audio', value: 'audio' }] as const
