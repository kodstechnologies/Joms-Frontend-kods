import { Link } from 'react-router-dom'

import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { Button } from '@/shared/components/ui/button'

export function CategoryHubPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Category Management"
        subtitle="Open existing category tools for services and venues. No settings data is changed here."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
          <h2 className="text-lg font-semibold text-white">Service Categories</h2>
          <p className="mt-2 text-sm text-slate-400">
            Manage service listing categories and subcategories.
          </p>
          <Link to="/categories/management" className="mt-4 inline-block">
            <Button>Open Service Categories</Button>
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
          <h2 className="text-lg font-semibold text-white">Venue Categories</h2>
          <p className="mt-2 text-sm text-slate-400">Manage venue categories and subcategories.</p>
          <Link to="/venues/categories/management" className="mt-4 inline-block">
            <Button>Open Venue Categories</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
