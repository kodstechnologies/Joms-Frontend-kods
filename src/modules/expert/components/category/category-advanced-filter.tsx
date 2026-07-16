import { ArrowLeft, Funnel, RotateCcw, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

import {
  ByCustomersFilter,
  ByExpertsFilter,
  ByLocationFilter,
  ByOrdersFilter,
  ByServicesFilter,
} from './filters'

export function CategoryAdvancedFilter() {
  const navigate = useNavigate()

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen">
      <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="h-10 w-10 p-0"
            onClick={() => navigateBackOrFallback(navigate, '/categories/management')}
          >
            <ArrowLeft size={18} />
          </Button>

          <h1 className="text-2xl font-semibold">Advanced Filters - Service Category Management</h1>
        </div>

        <Button
          variant="ghost"
          className="h-10 w-10 p-0"
          onClick={() => navigateBackOrFallback(navigate, '/categories/management')}
        >
          <X size={20} />
        </Button>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
        <div className="rounded-brand-lg bg-brand-surface border border-white/10 p-8">
          <ByServicesFilter />

          <div className="mt-10">
            <ByExpertsFilter />
          </div>
        </div>

        <ByOrdersFilter />

        <ByCustomersFilter />

        <ByLocationFilter />
      </div>

      <div className="bg-brand-bg sticky bottom-0 border-t border-white/10 px-8 py-5">
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            className="text-brand-text hover:bg-brand-surface border border-white/10 bg-transparent"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>

          <Button className="from-brand-gold-from to-brand-gold-to text-brand-text-dark bg-gradient-to-r hover:opacity-90">
            <Funnel className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
