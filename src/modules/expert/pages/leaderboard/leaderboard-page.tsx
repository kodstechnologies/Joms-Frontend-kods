import { useCallback } from 'react'
import {
  ArrowUpDown,
  BarChart3,
  Download,
  Search,
  SlidersHorizontal,
  Star,
  UserRound,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useModuleExportFilters } from '@/shared/components/advanced-filter'
import { exportDataToFile, exportDisplayValue } from '@/shared/utils/export-utils'
import type { FilterValues } from '@/shared/types/data-filter'

const EXPORT_COLUMN_MAP: Record<string, { header: string; accessor: (r: LeaderRow) => string }> = {
  rank: { header: 'Rank', accessor: (r) => exportDisplayValue(r.rank) },
  expertId: { header: 'Expert ID', accessor: (r) => exportDisplayValue(r.expertId) },
  name: { header: 'Expert Name', accessor: (r) => exportDisplayValue(r.name) },
  category: { header: 'Category', accessor: (r) => exportDisplayValue(r.category) },
  events: { header: 'No. Of Events', accessor: (r) => exportDisplayValue(r.events) },
  rating: { header: 'Ratings', accessor: (r) => exportDisplayValue(r.rating) },
  score: { header: 'Score', accessor: (r) => exportDisplayValue(r.score) },
}

import rank2Icon from '@/assets/JOMS_ADMIN_PANEL_3D_ICONS/change-the-engraved-gold-number--1--on-the-circula (1).png'
import rank3Icon from '@/assets/JOMS_ADMIN_PANEL_3D_ICONS/change-the-engraved-gold-number--2--on-the-circula (1).png'
import rank1Icon from '@/assets/JOMS_ADMIN_PANEL_3D_ICONS/create-a-high-quality-3d-icon-of-a-gold-trophy-wit 2.png'

type PodiumExpert = {
  rank: 1 | 2 | 3
  name: string
  profession: string
  score: number
}

const PODIUM: PodiumExpert[] = [
  { rank: 2, name: 'Sara Johnson', profession: 'Travel - Bangalore', score: 992 },
  { rank: 1, name: 'Sara Johnson', profession: 'Travel - Bangalore', score: 999 },
  { rank: 3, name: 'Sara Johnson', profession: 'Travel - Bangalore', score: 992 },
]

type LeaderRow = {
  rank: number
  expertId: string
  name: string
  category: string
  events: number
  rating: number
  score: number
}

const ROWS: LeaderRow[] = [
  {
    rank: 1,
    expertId: 'EXP-0003',
    name: 'Sara Johnson',
    category: 'Legal',
    events: 116,
    rating: 4.8,
    score: 999,
  },
  {
    rank: 2,
    expertId: 'EXP-0003',
    name: 'Sara Johnson',
    category: 'Legal',
    events: 67,
    rating: 4.8,
    score: 995,
  },
  {
    rank: 3,
    expertId: 'EXP-0003',
    name: 'Sara Johnson',
    category: 'Legal',
    events: 90,
    rating: 4.8,
    score: 991,
  },
  {
    rank: 4,
    expertId: 'EXP-0003',
    name: 'Sara Johnson',
    category: 'Legal',
    events: 101,
    rating: 4.8,
    score: 986,
  },
  {
    rank: 5,
    expertId: 'EXP-0003',
    name: 'Sara Johnson',
    category: 'Legal',
    events: 18,
    rating: 4.8,
    score: 981,
  },
  {
    rank: 6,
    expertId: 'EXP-0003',
    name: 'Sara Johnson',
    category: 'Legal',
    events: 38,
    rating: 4.8,
    score: 975,
  },
  {
    rank: 7,
    expertId: 'EXP-0003',
    name: 'Sara Johnson',
    category: 'Legal',
    events: 38,
    rating: 4.8,
    score: 970,
  },
  {
    rank: 8,
    expertId: 'EXP-0003',
    name: 'Sara Johnson',
    category: 'Legal',
    events: 38,
    rating: 4.8,
    score: 964,
  },
  {
    rank: 9,
    expertId: 'EXP-0003',
    name: 'Sara Johnson',
    category: 'Legal',
    events: 38,
    rating: 4.8,
    score: 959,
  },
  {
    rank: 10,
    expertId: 'EXP-0003',
    name: 'Sara Johnson',
    category: 'Legal',
    events: 38,
    rating: 4.8,
    score: 953,
  },
]

const RANK_BADGE_STYLES: Record<number, string> = {
  1: 'bg-brand-accent text-brand-text-dark',
  2: 'bg-brand-gold-from text-brand-text-dark',
  3: 'bg-brand-gold-to text-brand-text-dark',
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
        {rank}
      </span>
    )
  }
  return (
    <span className="text-body-sm text-muted inline-flex h-6 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 font-semibold">
      {String(rank).padStart(2, '0')}
    </span>
  )
}

export const LeaderboardPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const metricsPath = location.pathname.startsWith('/venues')
    ? '/venues/dashboard/metrics'
    : location.pathname.startsWith('/services')
      ? '/services/dashboard/metrics'
      : '/experts/dashboard/metrics'

  const handleApplyFilters = useCallback(() => {
    // Handle filter application
  }, [])

  const handleExportData = useCallback((values: FilterValues, format: string) => {
    const exportCols = Object.values(EXPORT_COLUMN_MAP)
    const headers = exportCols.map((c) => c.header)
    const exportRows = ROWS.map((row) => exportCols.map((c) => c.accessor(row)))

    exportDataToFile(headers, exportRows, format, 'leaderboard_export')
  }, [])

  const {
    onAdvancedFilter,
    onExport,
    modals: exportFilterModals,
  } = useModuleExportFilters({
    moduleKey: 'leaderboard-management',
    onApplyFilters: handleApplyFilters,
    onExportData: handleExportData,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Expert Leader board</h1>
          <p className="text-body-md text-muted mt-1">
            Top ranked experts based on platform performance
          </p>
        </div>
        <Button className="ui-manage-metrics" onClick={() => navigate(metricsPath)}>
          <BarChart3 className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="bg-brand-bg rounded-2xl border border-white/[0.06] px-6 py-8">
        <div className="mx-auto grid max-w-3xl grid-cols-3 items-end gap-4">
          {[
            [...PODIUM].sort((a, b) => b.score - a.score)[1], // 2nd place
            [...PODIUM].sort((a, b) => b.score - a.score)[0], // 1st place
            [...PODIUM].sort((a, b) => b.score - a.score)[2], // 3rd place
          ].map((expert, index) => {
            if (!expert) return null
            const isFirst = index === 1
            const calculatedRank = isFirst ? 1 : index === 0 ? 2 : 3

            let iconSrc = rank3Icon
            if (calculatedRank === 1) iconSrc = rank1Icon
            else if (calculatedRank === 2) iconSrc = rank2Icon

            return (
              <div
                key={index}
                className={cn('flex flex-col items-center', isFirst ? 'pt-0' : 'pt-10')}
              >
                <div className="relative grid place-items-center">
                  <img
                    src={iconSrc}
                    alt={`Rank ${calculatedRank}`}
                    className={cn('object-contain drop-shadow-xl', isFirst ? 'h-24' : 'h-16')}
                  />
                </div>
                <p className="text-body-md mt-3 font-bold text-white">{expert.name}</p>
                <p className="text-body-sm text-muted">{expert.profession}</p>

                <div
                  className={cn(
                    'bg-brand-surface mt-3 flex w-full flex-col items-center gap-2 rounded-xl border px-4 py-5',
                    isFirst ? 'border-brand-accent/40' : 'border-white/[0.06]',
                  )}
                >
                  <div className="grid size-12 place-items-center rounded-full bg-black/40">
                    <UserRound className="text-brand-accent size-6" />
                  </div>
                  <span className="text-muted text-[10px] font-medium tracking-wide uppercase">
                    Score
                  </span>
                  <span className="text-h3 font-bold text-white">{expert.score}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-brand-lg bg-brand-surface border border-white/[0.06] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="ui-table-search-wrap">
            <Search className="ui-table-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name, ID or profession"
              className="ui-table-search"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="ui-advance-filters gap-2"
              onClick={onAdvancedFilter}
            >
              <SlidersHorizontal className="size-4" />
              Advance Filters
            </Button>
            <Button onClick={onExport} className="ui-export-data gap-2">
              <Download className="size-4" />
              Export Data
            </Button>
          </div>
        </div>

        <p className="text-body-sm text-muted mt-4">Showing 1-10 of 20 users</p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="text-muted text-[10px] font-semibold tracking-wide uppercase">
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    className="rounded border-slate-700 bg-transparent"
                  />
                </th>
                <th className="px-3 py-3">Rank</th>
                <th className="px-3 py-3">Expert ID</th>
                <th className="px-3 py-3">Expert Name</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">
                  <span className="inline-flex items-center gap-1">
                    No.Of Events <ArrowUpDown className="size-3" />
                  </span>
                </th>
                <th className="px-3 py-3">
                  <span className="inline-flex items-center gap-1">
                    Ratings <ArrowUpDown className="size-3" />
                  </span>
                </th>
                <th className="px-3 py-3">
                  <span className="inline-flex items-center gap-1">
                    Score <ArrowUpDown className="size-3" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, index) => (
                <tr
                  key={index}
                  className="text-body-sm text-brand-text border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.expertId}`}
                      defaultChecked={row.rank <= 4}
                      className="rounded border-slate-700 bg-transparent"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <RankBadge rank={row.rank} />
                  </td>
                  <td className="text-muted px-3 py-3">{row.expertId}</td>
                  <td className="px-3 py-3 font-semibold text-white">{row.name}</td>
                  <td className="px-3 py-3">
                    <span className="text-body-sm text-brand-text inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-1 font-semibold">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-3 py-3">{row.events}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1">
                      <Star className="fill-brand-accent text-brand-accent size-3.5" />
                      <span className="font-semibold text-white">{row.rating}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-white">{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button type="button" className="ui-pagination-btn ui-pagination-prev">
            Previous
          </button>
          <div className="flex items-center gap-2">
            {['01', '02'].map((page, index) => (
              <button
                key={page}
                type="button"
                className={cn(
                  'ui-pagination-btn ui-pagination-page',
                  index === 0 && 'ui-pagination-page-active',
                )}
              >
                {page}
              </button>
            ))}
          </div>
          <button type="button" className="ui-pagination-btn ui-pagination-next">
            Next
          </button>
        </div>
      </div>
      {exportFilterModals}
    </div>
  )
}
