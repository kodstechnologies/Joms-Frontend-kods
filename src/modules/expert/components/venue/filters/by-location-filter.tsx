import { Plus } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'

export function ByLocationFilter() {
  return (
    <section className="bg-brand-surface-2 space-y-8 rounded-xl border border-white/10 p-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h2 className="text-brand-text text-sm font-medium">By Location</h2>

        <Plus className="text-brand-text h-5 w-5 cursor-pointer" />
      </div>

      {/* Location */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Location</h3>

        <div className="grid grid-cols-2 gap-6">
          <Input placeholder="State/Region" className="bg-brand-surface border-white/10" />

          <Input placeholder="City" className="bg-brand-surface border-white/10" />
        </div>
      </div>
    </section>
  )
}
