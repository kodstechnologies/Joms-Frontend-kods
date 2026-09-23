import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  ExternalLink,
  Search,
  Star,
  TrendingUp,
  Trophy,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import {
  AdvanceFilterIcon,
  ExportDataIcon,
  ManageMetricsIcon,
  SortOutlineIcon,
} from '@/shared/components/icons/action-button-icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useServerTableSort } from '@/shared/hooks/use-server-table-sort'
import { exportDataToFile } from '@/shared/utils/export-utils'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import { getExportFormatLabel } from '@/modules/settings/utils/export-format'

import rank2Icon from '@/assets/JOMS_ADMIN_PANEL_3D_ICONS/rank-2-medal.png'
import rank3Icon from '@/assets/JOMS_ADMIN_PANEL_3D_ICONS/rank-3-medal.png'
import rank1Icon from '@/assets/JOMS_ADMIN_PANEL_3D_ICONS/rank-1-trophy.png'
import totalRevenueIcon from '@/assets/JOMS_ICONS-2/icons8-money-bag-rupee-24.svg'

import { fetchExpertLeaderboard } from '../../api/leaderboard-api'
import { useExpertLeaderboard, useExpertLeaderboardProfile } from '../../hooks/use-leaderboard'
import { openPartnerProfile } from '../../utils/expert-application-navigation'
import {
  DEFAULT_EXPERT_LEADERBOARD_VISIBLE_COLUMN_IDS,
  EXPERT_LEADERBOARD_LEGACY_COLUMN_ID_MAP,
  EXPERT_LEADERBOARD_MODULE_KEY,
  EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG,
} from '../../config/expert-leaderboard-table-columns.config'
import {
  DEFAULT_VENUE_LEADERBOARD_VISIBLE_COLUMN_IDS,
  VENUE_LEADERBOARD_LEGACY_COLUMN_ID_MAP,
  VENUE_LEADERBOARD_MODULE_KEY,
  VENUE_LEADERBOARD_TABLE_COLUMNS_CATALOG,
} from '../../config/venue-leaderboard-table-columns.config'
import { useTableColumnPreferences } from '../../hooks/use-ui-preferences'
import { sortIdsByCatalogOrder } from '@/shared/lib/dedupe-ids'
import type {
  ExpertLeaderboardQuery,
  LeaderboardDateRange,
  LeaderboardRankingMetric,
  LeaderboardRow,
} from '../../type/leaderboard'
import { toast } from 'sonner'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'

const RANK_BADGE_STYLES: Record<number, string> = {
  1: 'bg-brand-accent text-brand-text-dark',
  2: 'bg-brand-gold-from text-brand-text-dark',
  3: 'bg-brand-gold-to text-brand-text-dark',
}

const RANKING_OPTIONS: Array<{ value: LeaderboardRankingMetric; label: string }> = [
  { value: 'score', label: 'Performance Score' },
  { value: 'ordersCompleted', label: 'Orders Completed' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'rating', label: 'Rating' },
  { value: 'clientSatisfaction', label: 'Client Satisfaction' },
  { value: 'profileHealth', label: 'Profile Health' },
  { value: 'repeatClientRate', label: 'Repeat Client Rate' },
]

const DATE_OPTIONS: Array<{ value: LeaderboardDateRange; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All Time' },
]

const MEMBERSHIP_OPTIONS = ['Free', 'Pro', 'Premium', 'Enterprise']

function ShimmerBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-white/10', className)} />
}

function PodiumShimmer() {
  return (
    <div className="mx-auto flex max-w-[980px] items-end justify-center gap-6">
      {[0, 1, 2].map((index) => {
        const isFirst = index === 1
        return (
          <div
            key={`podium-shimmer-${index}`}
            className={cn('flex w-[298px] flex-col items-center', isFirst ? 'pb-8' : 'pt-10')}
          >
            <ShimmerBlock className="size-[50px] rounded-full" />
            <ShimmerBlock className="mt-3 h-4 w-32" />
            <ShimmerBlock className="mt-2 h-3 w-28 bg-white/5" />
            <div className="mt-6 flex h-[231px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-[#141414] px-4">
              <ShimmerBlock className={cn(isFirst ? 'size-[100px]' : 'size-20', 'rounded-full')} />
              <ShimmerBlock className="h-3 w-12 bg-white/5" />
              <ShimmerBlock className="h-8 w-16" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TableRowsShimmer({ rows = 8, columnCount = 7 }: { rows?: number; columnCount?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={`leaderboard-row-shimmer-${index}`} className="border-b border-white/5">
          <td className="px-3 py-3">
            <ShimmerBlock className="size-4" />
          </td>
          {Array.from({ length: columnCount }).map((__, cellIndex) => (
            <td key={`leaderboard-row-shimmer-${index}-${cellIndex}`} className="px-3 py-3">
              <ShimmerBlock className="h-4 w-20 bg-white/5" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `${Number(value).toFixed(1)}%`
}

function formatLastActive(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getLeaderboardExportValue(columnId: string, row: LeaderboardRow): string {
  switch (columnId) {
    case 'rank':
      return String(row.rank)
    case 'expert-id':
    case 'venue-id':
      return row.expertId || ''
    case 'expert-name':
    case 'venue-name':
      return row.name || ''
    case 'category':
      return row.category || ''
    case 'membership-type':
      return row.membershipType || ''
    case 'orders-completed':
    case 'events-count':
      return String(row.ordersCompleted ?? row.eventsCompleted ?? '')
    case 'average-rating':
    case 'ratings':
      return row.averageRating != null ? String(row.averageRating) : ''
    case 'score':
      return String(row.score ?? '')
    case 'profile-health-score':
      return String(row.profileHealth ?? '')
    case 'client-satisfaction-score':
      return row.ratingsAvailable ? formatPercent(row.clientSatisfaction) : '—'
    case 'total-revenue':
      return row.totalRevenueLabel || (row.totalRevenue != null ? String(row.totalRevenue) : '—')
    case 'services-listed':
      return String(row.servicesListed ?? '')
    case 'consultations-listed':
      return String(row.consultationsListed ?? '')
    case 'repeat-client-rate':
      return formatPercent(row.repeatClientRate)
    case 'order-completion-rate':
      return formatPercent(row.orderCompletionRate)
    case 'last-active':
      return formatLastActive(row.lastActiveAt)
    default:
      return ''
  }
}

function renderLeaderboardCell(
  columnId: string,
  row: LeaderboardRow,
  onOpenProfile: (row: LeaderboardRow) => void,
) {
  switch (columnId) {
    case 'rank':
      return <RankBadge rank={row.rank} />
    case 'expert-id':
    case 'venue-id':
      return <span className="text-muted">{row.expertId}</span>
    case 'expert-name':
    case 'venue-name':
      return (
        <button
          type="button"
          className="hover:text-brand-accent font-semibold text-white"
          onClick={() => onOpenProfile(row)}
        >
          {row.name}
        </button>
      )
    case 'category':
      return (
        <span className="text-body-sm text-brand-text inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-1 font-semibold">
          {row.category}
        </span>
      )
    case 'membership-type':
      return row.membershipType || '—'
    case 'orders-completed':
    case 'events-count':
      return row.ordersCompleted ?? row.eventsCompleted ?? 0
    case 'average-rating':
    case 'ratings':
      return (
        <span className="inline-flex items-center gap-1">
          <Star className="fill-brand-accent text-brand-accent size-3.5" />
          <span className="font-semibold text-white">
            {row.averageRating != null ? row.averageRating.toFixed(1) : '—'}
          </span>
        </span>
      )
    case 'score':
      return <span className="font-semibold text-white">{row.score}</span>
    case 'profile-health-score':
      return <span className="font-semibold text-white">{row.profileHealth ?? '—'}</span>
    case 'client-satisfaction-score':
      return row.ratingsAvailable ? formatPercent(row.clientSatisfaction) : '—'
    case 'total-revenue':
      return (
        <span className="font-semibold text-white">
          {row.totalRevenueLabel ||
            (row.totalRevenue != null
              ? `₹${Number(row.totalRevenue).toLocaleString('en-IN')}`
              : '—')}
        </span>
      )
    case 'services-listed':
      return row.servicesListed ?? 0
    case 'consultations-listed':
      return row.consultationsListed ?? 0
    case 'repeat-client-rate':
      return formatPercent(row.repeatClientRate)
    case 'order-completion-rate':
      return formatPercent(row.orderCompletionRate)
    case 'last-active':
      return (
        <span className="text-muted whitespace-nowrap">{formatLastActive(row.lastActiveAt)}</span>
      )
    default:
      return '—'
  }
}

const SORTABLE_LEADERBOARD_COLUMN_IDS = new Set([
  'rank',
  'expert-id',
  'venue-id',
  'expert-name',
  'venue-name',
  'category',
  'membership-type',
  'orders-completed',
  'events-count',
  'average-rating',
  'ratings',
  'score',
  'profile-health-score',
  'client-satisfaction-score',
  'total-revenue',
  'services-listed',
  'consultations-listed',
  'repeat-client-rate',
  'order-completion-rate',
  'last-active',
])

const LEADERBOARD_SORT_FIELD_MAP: Record<string, string> = {
  rank: 'rank',
  'expert-id': 'expertId',
  'venue-id': 'expertId',
  'expert-name': 'name',
  'venue-name': 'name',
  category: 'category',
  'membership-type': 'membershipType',
  'orders-completed': 'ordersCompleted',
  'events-count': 'ordersCompleted',
  'average-rating': 'averageRating',
  ratings: 'averageRating',
  score: 'score',
  'profile-health-score': 'profileHealth',
  'client-satisfaction-score': 'clientSatisfaction',
  'total-revenue': 'totalRevenue',
  'services-listed': 'servicesListed',
  'consultations-listed': 'consultationsListed',
  'repeat-client-rate': 'repeatClientRate',
  'order-completion-rate': 'orderCompletionRate',
  'last-active': 'lastActiveAt',
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span
        className={cn(
          'text-body-sm inline-flex h-6 w-7 items-center justify-center rounded-md font-bold',
          RANK_BADGE_STYLES[rank],
        )}
      >
        #{rank}
      </span>
    )
  }
  return (
    <span className="text-body-sm text-muted inline-flex h-6 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 font-semibold">
      {String(rank).padStart(2, '0')}
    </span>
  )
}

function SafeAvatar({
  src,
  name,
  sizeClassName = 'size-12',
  iconClassName = 'size-6',
}: {
  src?: string | null
  name: string
  sizeClassName?: string
  iconClassName?: string
}) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  if (showImage) {
    return (
      <img
        src={src as string}
        alt={name}
        className={cn(sizeClassName, 'rounded-full object-cover ring-2 ring-white/10')}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <div
      className={cn(
        sizeClassName,
        'grid place-items-center rounded-full bg-black/40 ring-2 ring-white/10',
      )}
    >
      <UserRound className={cn('text-brand-accent', iconClassName)} />
    </div>
  )
}

function podiumSubtitle(expert: {
  category?: string | null
  city?: string | null
  profession?: string | null
}) {
  const parts = [expert.category, expert.city].map((value) => value?.trim()).filter(Boolean)
  if (parts.length) return parts.join(' • ')
  return expert.profession?.trim() || '—'
}

function Stars({ rating }: { rating: number | null | undefined }) {
  const value = Number(rating) || 0
  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = value >= index + 1
        const half = !filled && value >= index + 0.5
        return (
          <Star
            key={index}
            className={cn(
              'size-3.5',
              filled || half ? 'fill-brand-accent text-brand-accent' : 'text-white/20',
            )}
          />
        )
      })}
      <span className="ml-1 font-semibold text-white">{value ? value.toFixed(1) : '—'}</span>
    </span>
  )
}

type FiltersState = {
  rankingMetric: LeaderboardRankingMetric
  dateRange: LeaderboardDateRange
  category: string
  membershipType: string
  state: string
  city: string
  minRating: string
  revenueMin: string
  revenueMax: string
}

const DEFAULT_FILTERS: FiltersState = {
  rankingMetric: 'score',
  dateRange: 'last30',
  category: '',
  membershipType: '',
  state: '',
  city: '',
  minRating: '',
  revenueMin: '',
  revenueMax: '',
}

function buildLeaderboardQuery(
  filters: FiltersState,
  extras: {
    page?: number
    limit?: number
    search?: string
    serviceType: 'venue' | 'concierge'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  },
): ExpertLeaderboardQuery {
  return {
    page: extras.page,
    limit: extras.limit,
    search: extras.search || undefined,
    rankingMetric: filters.rankingMetric,
    dateRange: filters.dateRange,
    category: filters.category || undefined,
    membershipType: filters.membershipType || undefined,
    state: filters.state || undefined,
    city: filters.city || undefined,
    minRating: filters.minRating || undefined,
    revenueMin: filters.revenueMin || undefined,
    revenueMax: filters.revenueMax || undefined,
    serviceType: extras.serviceType,
    sortBy: extras.sortBy,
    sortOrder: extras.sortOrder,
  }
}

function ExpertProfileModal({
  partnerId,
  query,
  onClose,
}: {
  partnerId: string
  query: ExpertLeaderboardQuery
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useExpertLeaderboardProfile(partnerId, query)
  const profile = data?.data

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="flex flex-col overflow-hidden px-9 py-6"
        style={{ width: 774, height: 464, borderRadius: 16, background: '#141414' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] leading-7 font-semibold tracking-normal text-white">
            {query.serviceType === 'venue' ? 'Venue Profile' : 'Expert Profile'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-3 h-px bg-white/10" />

        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          {isLoading && <p className="text-muted text-sm">Loading profile…</p>}
          {isError && (
            <p className="text-sm text-red-400">
              {query.serviceType === 'venue'
                ? 'Failed to load venue profile.'
                : 'Failed to load expert profile.'}
            </p>
          )}
          {profile && (
            <>
              <div className="relative flex items-start gap-4">
                <SafeAvatar
                  src={profile.profileImage}
                  name={profile.name}
                  sizeClassName="size-16"
                />
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    className="hover:text-brand-accent inline-flex items-center gap-2 text-left text-base font-semibold text-white"
                    onClick={() =>
                      void openPartnerProfile(
                        { id: profile.partnerId, serviceType: query.serviceType },
                        navigate,
                      )
                    }
                  >
                    {profile.name.replace(/\s+/g, '')}
                    <ExternalLink className="size-3.5" />
                  </button>
                  <p className="mt-0.5 text-xs text-white/50">{profile.expertId}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#050505] px-2 py-1 text-xs font-semibold text-white">
                      {profile.category}
                    </span>
                    {profile.city && (
                      <span className="text-xs font-medium text-white/80">{profile.city}</span>
                    )}
                  </div>
                  <div className="mt-2">
                    <Stars rating={profile.averageRating} />
                  </div>
                </div>
                <span className="absolute top-0 right-0 rounded-lg bg-[#E0A263] px-3 py-1 text-xs font-semibold text-[#050505]">
                  Rank #{profile.rank}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                {[
                  {
                    label: 'Total Events',
                    value: String(profile.eventsCompleted || 0),
                    icon: CalendarDays,
                  },
                  {
                    label: 'Completion Rate',
                    value: `${Number(profile.orderCompletionRate || 0).toFixed(1)}%`,
                    icon: TrendingUp,
                  },
                  {
                    label: 'Repeat Customers',
                    value: String(profile.repeatClients || 0),
                    icon: Users,
                  },
                  {
                    label: 'Total Revenue',
                    value: profile.totalRevenueLabel || '₹0',
                    iconSrc: totalRevenueIcon,
                  },
                  {
                    label: 'Performance Score',
                    value: String(profile.score || 0),
                    icon: Trophy,
                  },
                ].map((card) => (
                  <div key={card.label} className="rounded-[10px] bg-[#050505] px-3 py-3">
                    <div className="flex items-center gap-2">
                      {'iconSrc' in card && card.iconSrc ? (
                        <img
                          src={card.iconSrc}
                          alt=""
                          className="size-4 shrink-0 opacity-70 brightness-0 invert"
                          aria-hidden="true"
                        />
                      ) : 'icon' in card && card.icon ? (
                        <card.icon className="size-4 text-white/70" />
                      ) : null}
                      <p className="text-[12px] leading-4 font-medium text-white/70">
                        {card.label}
                      </p>
                    </div>
                    <p className="mt-2 text-[20px] leading-6 font-semibold text-white">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex h-[67px] w-[699px] max-w-full shrink-0 items-center gap-3 self-center rounded-[10px] border border-[#E0A263] bg-[#F6CB8633] px-4">
                <AlertTriangle
                  className="size-5 shrink-0 text-[#E0A263]"
                  fill="#E0A263"
                  stroke="#141414"
                  aria-hidden="true"
                />
                <p className="text-[16px] leading-6 font-normal tracking-normal text-white">
                  {profile.notice ||
                    'This is a read-only profile view. Rankings are calculated automatically based on expert’s performance.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FiltersPanel({
  open,
  mode = 'filter',
  title,
  value,
  onChange,
  onApply,
  onClose,
  onExport,
  isExporting = false,
}: {
  open: boolean
  mode?: 'filter' | 'export'
  title: string
  value: FiltersState
  onChange: (next: FiltersState) => void
  onApply?: () => void
  onClose: () => void
  onExport?: (format: string) => void
  isExporting?: boolean
}) {
  const { fileFormat } = useDefaultExportFormat()

  if (!open) return null

  const isExport = mode === 'export'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-brand-surface w-full max-w-xl rounded-2xl border border-white/10 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs text-white/70">
            Ranking Metric
            <select
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={value.rankingMetric}
              onChange={(e) =>
                onChange({ ...value, rankingMetric: e.target.value as LeaderboardRankingMetric })
              }
            >
              {RANKING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-white/70">
            Date Range
            <select
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={value.dateRange}
              onChange={(e) =>
                onChange({ ...value, dateRange: e.target.value as LeaderboardDateRange })
              }
            >
              {DATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-white/70">
            Category
            <input
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={value.category}
              onChange={(e) => onChange({ ...value, category: e.target.value })}
              placeholder="Legal, Technology…"
            />
          </label>

          <label className="space-y-1 text-xs text-white/70">
            Membership Type
            <select
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={value.membershipType}
              onChange={(e) => onChange({ ...value, membershipType: e.target.value })}
            >
              <option value="">All</option>
              {MEMBERSHIP_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs text-white/70">
            State
            <input
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={value.state}
              onChange={(e) => onChange({ ...value, state: e.target.value })}
            />
          </label>

          <label className="space-y-1 text-xs text-white/70">
            City
            <input
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={value.city}
              onChange={(e) => onChange({ ...value, city: e.target.value })}
            />
          </label>

          <label className="space-y-1 text-xs text-white/70">
            Minimum Rating
            <input
              type="number"
              min={1}
              max={5}
              step={0.1}
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={value.minRating}
              onChange={(e) => onChange({ ...value, minRating: e.target.value })}
            />
          </label>

          <label className="space-y-1 text-xs text-white/70">
            Revenue Min (₹)
            <input
              type="number"
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={value.revenueMin}
              onChange={(e) => onChange({ ...value, revenueMin: e.target.value })}
            />
          </label>

          <label className="space-y-1 text-xs text-white/70 sm:col-span-2">
            Revenue Max (₹)
            <input
              type="number"
              className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={value.revenueMax}
              onChange={(e) => onChange({ ...value, revenueMax: e.target.value })}
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          {isExport ? (
            <>
              <Button variant="secondary" onClick={onClose} disabled={isExporting}>
                Cancel
              </Button>
              <Button
                className="ui-export-data"
                disabled={isExporting}
                onClick={() => onExport?.(fileFormat)}
              >
                <ExportDataIcon className="size-5 shrink-0" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  onChange(DEFAULT_FILTERS)
                }}
              >
                Reset
              </Button>
              <Button
                className="ui-export-data"
                onClick={() => {
                  onApply?.()
                  onClose()
                }}
              >
                Apply Filters
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export const LeaderboardPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isVenueLeaderboard = location.pathname.startsWith('/venues')
  const isServiceLeaderboard = location.pathname.startsWith('/services')
  const leaderboardModuleKey = isVenueLeaderboard
    ? VENUE_LEADERBOARD_MODULE_KEY
    : EXPERT_LEADERBOARD_MODULE_KEY
  const tableColumnsCatalog = isVenueLeaderboard
    ? VENUE_LEADERBOARD_TABLE_COLUMNS_CATALOG
    : EXPERT_LEADERBOARD_TABLE_COLUMNS_CATALOG
  const defaultVisibleColumnIds = isVenueLeaderboard
    ? DEFAULT_VENUE_LEADERBOARD_VISIBLE_COLUMN_IDS
    : DEFAULT_EXPERT_LEADERBOARD_VISIBLE_COLUMN_IDS
  const legacyColumnIdMap = isVenueLeaderboard
    ? VENUE_LEADERBOARD_LEGACY_COLUMN_ID_MAP
    : EXPERT_LEADERBOARD_LEGACY_COLUMN_ID_MAP
  const metricsPath = isVenueLeaderboard
    ? '/metrics/venue-leaderboard?section=table'
    : isServiceLeaderboard
      ? '/services/dashboard/metrics'
      : '/metrics/expert-leaderboard?section=table'

  const tableColumnPreferencesQuery = useTableColumnPreferences(
    leaderboardModuleKey,
    !isServiceLeaderboard,
  )

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filtersDraft, setFiltersDraft] = useState<FiltersState>(DEFAULT_FILTERS)
  const [filtersApplied, setFiltersApplied] = useState<FiltersState>(DEFAULT_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [profilePartnerId, setProfilePartnerId] = useState<string | null>(null)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const serverSort = useServerTableSort({
    sortFieldMap: LEADERBOARD_SORT_FIELD_MAP,
    defaultSortBy: 'rank',
    defaultSortOrder: 'asc',
    onPageReset: () => setPage(1),
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const serviceType = isVenueLeaderboard ? 'venue' : 'concierge'

  const query: ExpertLeaderboardQuery = useMemo(
    () =>
      buildLeaderboardQuery(filtersApplied, {
        page,
        limit: 10,
        search,
        serviceType,
        ...serverSort.sortParams,
      }),
    [filtersApplied, page, search, serverSort.sortParams, serviceType],
  )

  const { data, isLoading, isError, isFetching } = useExpertLeaderboard(query)
  const leaderboard = data?.data
  const showShimmer = isLoading || isFetching
  const rows = showShimmer ? [] : leaderboard?.list || []

  const visibleColumnIds = useMemo(() => {
    const catalogIds = tableColumnsCatalog.map((column) => column.id)
    const rawIds = tableColumnPreferencesQuery.data?.visibleColumnIds?.length
      ? tableColumnPreferencesQuery.data.visibleColumnIds
      : defaultVisibleColumnIds
    let mappedIds = rawIds.map((id) => legacyColumnIdMap[id] ?? id)

    // Venue: ensure CSAT + revenue stay visible even with older saved prefs,
    // and drop listing columns that no longer exist for venues.
    if (isVenueLeaderboard) {
      mappedIds = mappedIds.filter(
        (id) => id !== 'services-listed' && id !== 'consultations-listed',
      )
      for (const requiredId of ['client-satisfaction-score', 'total-revenue'] as const) {
        if (catalogIds.includes(requiredId) && !mappedIds.includes(requiredId)) {
          mappedIds.push(requiredId)
        }
      }
    }

    return sortIdsByCatalogOrder(
      [...new Set(mappedIds.filter((id) => catalogIds.includes(id)))],
      catalogIds,
    )
  }, [
    defaultVisibleColumnIds,
    isVenueLeaderboard,
    legacyColumnIdMap,
    tableColumnPreferencesQuery.data,
    tableColumnsCatalog,
  ])

  const visibleColumns = useMemo(
    () =>
      visibleColumnIds
        .map((id) => tableColumnsCatalog.find((column) => column.id === id))
        .filter(Boolean) as typeof tableColumnsCatalog,
    [tableColumnsCatalog, visibleColumnIds],
  )

  const podiumOrdered = useMemo(() => {
    const podium = leaderboard?.podium || []
    const first = podium.find((p) => p.rank === 1)
    const second = podium.find((p) => p.rank === 2)
    const third = podium.find((p) => p.rank === 3)
    return [second, first, third].filter(Boolean) as typeof podium
  }, [leaderboard?.podium])

  const pagination = leaderboard?.pagination
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.partnerId))

  const handleColumnSort = useCallback(
    (columnId: string) => {
      if (!SORTABLE_LEADERBOARD_COLUMN_IDS.has(columnId)) return
      serverSort.onSortingChange((prev) => {
        const current = prev[0]
        if (!current || current.id !== columnId) {
          return [{ id: columnId, desc: false }]
        }
        if (!current.desc) {
          return [{ id: columnId, desc: true }]
        }
        return []
      })
    },
    [serverSort],
  )

  const renderSortIcon = useCallback(
    (columnId: string) => {
      const active = serverSort.sorting[0]
      if (!active || active.id !== columnId) {
        return <SortOutlineIcon className="text-white" />
      }
      return active.desc ? (
        <ArrowDown className="text-brand-primary size-4" aria-hidden="true" />
      ) : (
        <ArrowUp className="text-brand-primary size-4" aria-hidden="true" />
      )
    },
    [serverSort.sorting],
  )

  const handleExportData = useCallback(
    async (format: string) => {
      setIsExporting(true)
      try {
        const pageSize = 100
        const exportQuery = buildLeaderboardQuery(filtersDraft, {
          page: 1,
          limit: pageSize,
          search,
          serviceType,
          ...serverSort.sortParams,
        })
        const firstPage = await fetchExpertLeaderboard(exportQuery)
        const firstList = firstPage.data?.list ?? []
        const totalPages = Math.min(Math.max(firstPage.data?.pagination?.pages || 1, 1), 100)
        const allRows = [...firstList]

        for (let nextPage = 2; nextPage <= totalPages; nextPage += 1) {
          const pageResult = await fetchExpertLeaderboard({
            ...exportQuery,
            page: nextPage,
          })
          allRows.push(...(pageResult.data?.list ?? []))
        }

        if (allRows.length === 0) {
          toast.error('No records found to export')
          return
        }

        const exportCols = visibleColumns.length
          ? visibleColumns
          : tableColumnsCatalog.filter((column) => column.defaultVisible)
        const headers = exportCols.map((column) => column.label)
        const exportRows = allRows.map((row) =>
          exportCols.map((column) => getLeaderboardExportValue(column.id, row)),
        )

        exportDataToFile(
          headers,
          exportRows,
          format,
          isVenueLeaderboard ? 'venue-leaderboard' : 'expert-leaderboard',
        )
        toast.success(`Exported as ${getExportFormatLabel(format)}`)
        setExportOpen(false)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to export leaderboard'))
      } finally {
        setIsExporting(false)
      }
    },
    [
      filtersDraft,
      isVenueLeaderboard,
      search,
      serverSort.sortParams,
      serviceType,
      tableColumnsCatalog,
      visibleColumns,
    ],
  )

  const openProfile = (row: LeaderboardRow | { partnerId: string }) => {
    setProfilePartnerId(row.partnerId)
  }

  const openViewAnalytics = useCallback(
    (row: LeaderboardRow) => {
      const partnerId = String(row.partnerId || '').trim()
      if (!partnerId) {
        toast.error('Partner ID is missing.')
        return
      }
      if (isVenueLeaderboard) {
        navigate(`/venues/management/profile/${partnerId}/analytics`)
        return
      }
      navigate(`/experts/management/profile/${partnerId}/analytics`)
    },
    [isVenueLeaderboard, navigate],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isVenueLeaderboard ? 'Venue Leaderboard' : 'Expert Leaderboard'}
          </h1>
          <p className="ui-page-subtitle mt-1 text-[16px] leading-5 font-medium tracking-normal text-[#FFFFFF80]">
            {isVenueLeaderboard
              ? 'Top ranked venues based on platform performance'
              : 'Top ranked experts based on platform performance'}
          </p>
        </div>
        <Button
          className="ui-manage-metrics ui-cta ui-cta-primary"
          onClick={() => navigate(metricsPath)}
        >
          <ManageMetricsIcon />
          Manage Metrics
        </Button>
      </div>

      <div className="rounded-2xl bg-[#050505] px-6 py-10">
        {showShimmer ? (
          <PodiumShimmer />
        ) : podiumOrdered.length === 0 ? (
          <p className="text-muted text-center text-sm">
            {isVenueLeaderboard ? 'No ranked venues yet.' : 'No ranked experts yet.'}
          </p>
        ) : (
          <div className="mx-auto flex max-w-[980px] items-end justify-center gap-6">
            {podiumOrdered.map((expert, index) => {
              const isFirst = index === 1
              const calculatedRank = expert.rank
              let iconSrc = rank3Icon
              if (calculatedRank === 1) iconSrc = rank1Icon
              else if (calculatedRank === 2) iconSrc = rank2Icon

              return (
                <button
                  key={expert.partnerId}
                  type="button"
                  onClick={() => openProfile(expert)}
                  className={cn(
                    'flex w-[298px] flex-col items-center text-center transition hover:opacity-95',
                    isFirst ? 'pb-8' : 'pt-10',
                  )}
                >
                  <SafeAvatar
                    src={expert.profileImage}
                    name={expert.name}
                    sizeClassName="size-[50px]"
                    iconClassName="size-6"
                  />
                  <p className="mt-3 text-base font-semibold text-white">{expert.name}</p>
                  <p className="mt-1 text-xs text-white/50">{podiumSubtitle(expert)}</p>

                  <div className="mt-6 flex h-[231px] w-full flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#141414] px-4">
                    <img
                      src={iconSrc}
                      alt={`Rank ${calculatedRank}`}
                      className={cn(
                        'object-contain drop-shadow-xl',
                        isFirst ? 'size-[100px]' : 'size-20',
                      )}
                    />
                    <span className="mt-4 text-xs font-medium tracking-wide text-white/45">
                      Score
                    </span>
                    <span className="mt-1 text-3xl font-bold tracking-tight text-white">
                      {expert.score}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="ui-table-search-wrap">
            <Search className="ui-table-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or ID"
              className="ui-table-search"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              className="ui-advance-filters table-advance-filter-btn gap-2"
              onClick={() => setFiltersOpen(true)}
            >
              <AdvanceFilterIcon className="size-4 shrink-0" />
              Advance Filters
            </Button>
            <Button
              onClick={() => {
                setFiltersDraft(filtersApplied)
                setExportOpen(true)
              }}
              className="ui-export-data gap-2"
              disabled={isExporting}
            >
              <ExportDataIcon className="size-5 shrink-0" />
              Export Data
            </Button>
          </div>
        </div>

        <div className="ui-table-showing mt-4">
          {showShimmer ? (
            <ShimmerBlock className="inline-block h-4 w-48 bg-white/5 align-middle" />
          ) : pagination ? (
            <>
              Showing{' '}
              <span className="ui-table-showing-value">
                {pagination.showingFrom}-{pagination.showingTo}
              </span>{' '}
              of <span className="ui-table-showing-value">{pagination.total}</span> users
            </>
          ) : (
            <>
              Showing <span className="ui-table-showing-value">0-0</span> of{' '}
              <span className="ui-table-showing-value">0</span> users
            </>
          )}
        </div>

        {isError && !showShimmer && (
          <p className="mt-3 text-sm text-red-400">Failed to load leaderboard. Please retry.</p>
        )}

        <div className="mt-3 overflow-x-auto">
          <table className="ui-data-table-table min-w-[1100px]">
            <thead className="bg-brand-surface border-white/10">
              <tr className="text-brand-text">
                <th scope="col" className="px-3 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    disabled={showShimmer}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(rows.map((row) => row.partnerId))
                      } else {
                        setSelectedIds([])
                      }
                    }}
                    className="ui-table-checkbox"
                  />
                </th>
                {visibleColumns.map((column) => {
                  const isSortable = SORTABLE_LEADERBOARD_COLUMN_IDS.has(column.id)
                  return (
                    <th key={column.id} scope="col" className="px-3 py-3 whitespace-nowrap">
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5',
                          isSortable && 'cursor-pointer select-none',
                        )}
                        onClick={isSortable ? () => handleColumnSort(column.id) : undefined}
                      >
                        {column.label}
                        {isSortable ? renderSortIcon(column.id) : null}
                      </div>
                    </th>
                  )
                })}
                <th scope="col" className="px-3 py-3 pr-5 text-right whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {showShimmer ? (
                <TableRowsShimmer columnCount={visibleColumns.length + 1} />
              ) : (
                <>
                  {rows.map((row) => (
                    <tr
                      key={row.partnerId}
                      className="text-brand-stroke transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-3 py-3 align-middle">
                        <input
                          type="checkbox"
                          aria-label={`Select ${row.expertId}`}
                          checked={selectedIds.includes(row.partnerId)}
                          onChange={(e) => {
                            setSelectedIds((current) =>
                              e.target.checked
                                ? [...current, row.partnerId]
                                : current.filter((id) => id !== row.partnerId),
                            )
                          }}
                          className="ui-table-checkbox"
                        />
                      </td>
                      {visibleColumns.map((column) => (
                        <td
                          key={`${row.partnerId}-${column.id}`}
                          className="px-3 py-3 align-middle"
                        >
                          {renderLeaderboardCell(column.id, row, openProfile)}
                        </td>
                      ))}
                      <td className="relative px-3 py-3 pr-5 text-right align-middle">
                        <TableActionsDropdown
                          label={`Open actions for ${row.name}`}
                          isOpen={activeDropdownId === row.partnerId}
                          onOpenChange={(open) => setActiveDropdownId(open ? row.partnerId : null)}
                          menuWidth={220}
                          maxVisibleItems={8}
                        >
                          <TableActionsItem
                            icon={<BarChart3 className="size-3.5" aria-hidden="true" />}
                            onClick={() => {
                              setActiveDropdownId(null)
                              openViewAnalytics(row)
                            }}
                          >
                            View Analytics
                          </TableActionsItem>
                        </TableActionsDropdown>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={visibleColumns.length + 2}
                        className="text-muted px-3 py-8 text-center text-sm"
                      >
                        {isVenueLeaderboard
                          ? 'No venues match the selected filters.'
                          : 'No experts match the selected filters.'}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            className="ui-pagination-btn ui-pagination-prev"
            disabled={!pagination || pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(pagination?.pages || 1, 5) }).map((_, index) => {
              const pageNumber = index + 1
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={cn(
                    'ui-pagination-btn ui-pagination-page',
                    pagination?.page === pageNumber && 'ui-pagination-page-active',
                  )}
                >
                  {String(pageNumber).padStart(2, '0')}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="ui-pagination-btn ui-pagination-next"
            disabled={!pagination || pagination.page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <FiltersPanel
        open={filtersOpen}
        mode="filter"
        title="Advance Filters"
        value={filtersDraft}
        onChange={setFiltersDraft}
        onClose={() => setFiltersOpen(false)}
        onApply={() => {
          setFiltersApplied(filtersDraft)
          setPage(1)
        }}
      />

      <FiltersPanel
        open={exportOpen}
        mode="export"
        title={
          isVenueLeaderboard
            ? 'Export Data - Venue Leaderboard'
            : 'Export Data - Expert Leaderboard'
        }
        value={filtersDraft}
        onChange={setFiltersDraft}
        onClose={() => setExportOpen(false)}
        onExport={handleExportData}
        isExporting={isExporting}
      />

      {profilePartnerId && (
        <ExpertProfileModal
          partnerId={profilePartnerId}
          query={query}
          onClose={() => setProfilePartnerId(null)}
        />
      )}
    </div>
  )
}
