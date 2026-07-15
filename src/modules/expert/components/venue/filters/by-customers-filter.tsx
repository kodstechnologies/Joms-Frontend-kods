import { Plus } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'

export function ByCustomersFilter() {
  return (
    <section className="bg-brand-surface-2 space-y-8 rounded-xl border border-white/10 p-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h2 className="text-brand-text text-sm font-medium">By Customers</h2>

        <Plus className="text-brand-text h-5 w-5 cursor-pointer" />
      </div>

      {/* Registration Date */}

      <div className="space-y-4">
        <h3 className="text-brand-text text-sm font-medium">Registration Date</h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-brand-muted-light text-xs">From</label>

            <Input placeholder="0" className="bg-brand-surface border-white/10" />
          </div>

          <div className="space-y-2">
            <label className="text-brand-muted-light text-xs">To</label>

            <Input placeholder="500" className="bg-brand-surface border-white/10" />
          </div>
        </div>
      </div>

      {/* Customer Total Bookings */}

      <div className="space-y-4">
        <h3 className="text-brand-text text-sm font-medium">Customer Total Bookings</h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-brand-muted-light text-xs">From</label>

            <Input placeholder="0" className="bg-brand-surface border-white/10" />
          </div>

          <div className="space-y-2">
            <label className="text-brand-muted-light text-xs">To</label>

            <Input placeholder="500" className="bg-brand-surface border-white/10" />
          </div>
        </div>
      </div>
    </section>
  )
}
