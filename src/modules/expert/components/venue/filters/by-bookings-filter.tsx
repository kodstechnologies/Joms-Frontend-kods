import { Plus } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'

export function ByBookingsFilter() {
  return (
    <section className="bg-brand-surface-2 space-y-8 rounded-xl border border-white/10 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-brand-text text-sm font-medium">By Bookings</h2>

        <Plus className="text-brand-text h-5 w-5 cursor-pointer" />
      </div>

      <div className="space-y-4">
        <h3 className="text-brand-text text-sm font-medium">Total Number Of Bookings</h3>

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

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Booking Status</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Confirmed
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Completed
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Cancelled
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Pending
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Refunded
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            No Show
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Payment Status</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Paid
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Partial
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Failed
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Refunded
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Payment Method</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Card
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            UPI
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Bank Transfer
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Refunded Status</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Pending
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Failed
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Partial
          </label>
        </div>
      </div>
    </section>
  )
}
