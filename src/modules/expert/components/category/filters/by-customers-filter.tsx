import { Input } from '@/shared/components/ui/input'

export function ByCustomersFilter() {
  return (
    <section className="bg-brand-surface-2 space-y-8 rounded-xl border border-white/10 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-brand-text text-sm font-medium">By Customers</h2>
      </div>

      {/* Customer Lifetime Spend */}

      <div className="space-y-4">
        <h3 className="text-brand-text text-sm font-medium">Customer Lifetime Spend</h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-brand-muted-light text-xs">From</label>

            <Input placeholder="Enter Number" className="bg-brand-surface border-white/10" />
          </div>

          <div className="space-y-2">
            <label className="text-brand-muted-light text-xs">To</label>

            <Input placeholder="Enter Number" className="bg-brand-surface border-white/10" />
          </div>
        </div>
      </div>

      {/* Customer Cancellation */}

      <div className="space-y-4">
        <h3 className="text-brand-text text-sm font-medium">Customer Cancellation Rate %</h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-brand-muted-light text-xs">From</label>

            <Input placeholder="Enter Number" className="bg-brand-surface border-white/10" />
          </div>

          <div className="space-y-2">
            <label className="text-brand-muted-light text-xs">To</label>

            <Input placeholder="Enter Number" className="bg-brand-surface border-white/10" />
          </div>
        </div>
      </div>
    </section>
  )
}
