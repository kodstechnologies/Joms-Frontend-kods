import {
  ArrowUpDown,
  BarChart3,
  Crown,
  Download,
  Search,
  SlidersHorizontal,
  Star,
  UserRound,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

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
  { rank: 1, expertId: 'EXP-0003', name: 'Sara Johnson', category: 'Legal', events: 116, rating: 4.8, score: 999 },
  { rank: 2, expertId: 'EXP-0003', name: 'Sara Johnson', category: 'Legal', events: 67, rating: 4.8, score: 995 },
  { rank: 3, expertId: 'EXP-0003', name: 'Sara Johnson', category: 'Legal', events: 90, rating: 4.8, score: 991 },
  { rank: 4, expertId: 'EXP-0003', name: 'Sara Johnson', category: 'Legal', events: 101, rating: 4.8, score: 986 },
  { rank: 5, expertId: 'EXP-0003', name: 'Sara Johnson', category: 'Legal', events: 18, rating: 4.8, score: 981 },
  { rank: 6, expertId: 'EXP-0003', name: 'Sara Johnson', category: 'Legal', events: 38, rating: 4.8, score: 975 },
  { rank: 7, expertId: 'EXP-0003', name: 'Sara Johnson', category: 'Legal', events: 38, rating: 4.8, score: 970 },
  { rank: 8, expertId: 'EXP-0003', name: 'Sara Johnson', category: 'Legal', events: 38, rating: 4.8, score: 964 },
  { rank: 9, expertId: 'EXP-0003', name: 'Sara Johnson', category: 'Legal', events: 38, rating: 4.8, score: 959 },
  { rank: 10, expertId: 'EXP-0003', name: 'Sara Johnson', category: 'Legal', events: 38, rating: 4.8, score: 953 },
]

const RANK_BADGE_STYLES: Record<number, string> = {
  1: 'bg-brand-accent text-brand-text-dark',
  2: 'bg-brand-gold-from text-brand-text-dark',
  3: 'bg-[#C88A4B] text-black',
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span
        className={cn(
          'inline-flex h-6 w-7 items-center justify-center rounded-md text-[11px] font-bold',
          RANK_BADGE_STYLES[rank],
        )}
      >
        {rank}
      </span>
    )
  }
  return (
    <span className="inline-flex h-6 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[11px] font-semibold text-slate-300">
      {String(rank).padStart(2, '0')}
    </span>
  )
}

function Avatar({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <div
      className={cn(
        'grid place-items-center rounded-full bg-gradient-to-br from-brand-accent/30 to-[#222] ring-2 ring-white/10',
        size === 'lg' ? 'size-16' : 'size-12',
      )}
    >
      <UserRound className={cn('text-white/80', size === 'lg' ? 'size-7' : 'size-5')} />
    </div>
  )
}

function PodiumCard({ expert }: { expert: PodiumExpert }) {
  const isFirst = expert.rank === 1
  return (
    <div className={cn('flex flex-col items-center', isFirst ? 'pt-0' : 'pt-10')}>
      <div className="relative">
        {isFirst && (
          <Crown className="absolute -top-6 left-1/2 size-6 -translate-x-1/2 fill-brand-accent text-brand-accent" />
        )}
        <Avatar size={isFirst ? 'lg' : 'md'} />
      </div>
      <p className="mt-3 text-[13px] font-bold text-white">{expert.name}</p>
      <p className="text-[11px] text-[#888888]">{expert.profession}</p>

      <div
        className={cn(
          'mt-3 flex w-full flex-col items-center gap-2 rounded-xl border bg-[#161616] px-4 py-5',
          isFirst ? 'border-brand-accent/40' : 'border-white/[0.06]',
        )}
      >
        <div className="grid size-12 place-items-center rounded-full bg-black/40">
          <UserRound className="size-6 text-brand-accent" />
        </div>
        <span className="text-[10px] font-medium tracking-wide text-[#888888] uppercase">Score</span>
        <span className="text-[20px] font-bold text-white">{expert.score}</span>
      </div>
    </div>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Expert Leader board</h1>
          <p className="mt-1 text-[13px] text-[#888888]">
            Top ranked experts based on platform performance
          </p>
        </div>
        <Button onClick={() => navigate(metricsPath)}>
          <BarChart3 className="size-4" />
          Manage Metrics
        </Button>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0f0f0f] px-6 py-8">
        <div className="mx-auto grid max-w-3xl grid-cols-3 items-end gap-4">
          {PODIUM.map((expert, index) => (
            <PodiumCard key={index} expert={expert} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              placeholder="Search by name, ID or profession"
              className="h-10 w-full rounded-lg border border-white/10 bg-black pl-9 pr-3 text-[12px] text-white outline-none transition-colors placeholder:text-[#555555] focus:border-brand-accent/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" className="gap-2">
              <SlidersHorizontal className="size-4" />
              Advance Filters
            </Button>
            <Button onClick={() => toast.message('Export coming soon')} className="gap-2">
              <Download className="size-4" />
              Export Data
            </Button>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-[#777777]">Showing 1-10 of 20 users</p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-semibold tracking-wide text-[#777777] uppercase">
                <th className="px-3 py-3">
                  <input type="checkbox" aria-label="Select all" className="rounded border-slate-700 bg-transparent" />
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
                  className="border-b border-white/5 text-[12px] text-slate-200 transition-colors hover:bg-white/[0.02]"
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
                  <td className="px-3 py-3 text-[#999999]">{row.expertId}</td>
                  <td className="px-3 py-3 font-semibold text-white">{row.name}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-slate-200">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-3 py-3">{row.events}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5 fill-brand-accent text-brand-accent" />
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
          <Button variant="secondary" className="px-4">
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {['01', '02'].map((page, index) => (
              <button
                key={page}
                type="button"
                className={cn(
                  'grid size-8 place-items-center rounded-md text-[11px] font-bold transition-colors',
                  index === 0
                    ? 'bg-brand-accent text-brand-text-dark'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
                )}
              >
                {page}
              </button>
            ))}
          </div>
          <Button variant="secondary" className="px-4">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
