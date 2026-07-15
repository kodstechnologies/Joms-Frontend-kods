import { Button } from '@/shared/components/ui/button'

export function CategoryFilterForm() {
  return (
    <div className="bg-brand-surface rounded-xl border border-white/10 p-6">
      <h2 className="text-brand-text mb-6 text-xl font-semibold">By Service</h2>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-brand-text mb-2 block text-sm">Service Name</label>

          <input className="bg-brand-surface-2 text-brand-text h-11 w-full rounded-lg border border-white/10 px-3" />
        </div>

        <div>
          <label className="text-brand-text mb-2 block text-sm">Category</label>

          <input className="bg-brand-surface-2 text-brand-text h-11 w-full rounded-lg border border-white/10 px-3" />
        </div>
      </div>

      <div className="mt-10 flex justify-end gap-4">
        <Button
          variant="secondary"
          className="text-brand-text hover:bg-brand-surface border border-white/10 bg-transparent"
        >
          Reset Filters
        </Button>

        <Button className="from-brand-gold-from to-brand-gold-to text-brand-text-dark bg-gradient-to-r hover:opacity-90">
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
