import { Plus } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'

export function ByServicesFilter() {
  return (
    <section className="space-y-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h2 className="text-brand-text text-sm font-medium">By Services</h2>

        <Plus className="text-brand-text h-5 w-5 cursor-pointer" />
      </div>

      {/* Category */}

      <div className="space-y-2">
        <label className="text-brand-text text-sm font-medium">Category</label>

        <Input placeholder="Search by name" className="bg-brand-surface border-white/10" />
      </div>

      {/* Sub Category */}

      <div className="space-y-2">
        <label className="text-brand-text text-sm font-medium">Sub-category</label>

        <Input placeholder="Search by name" className="bg-brand-surface border-white/10" />
      </div>

      {/* Category Status */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Category Status</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Active
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" /> Inactive
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" /> Draft
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" /> Deleted
          </label>
        </div>
      </div>

      {/* Service Performance */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Service Performance</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Trending
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" /> Top Performing
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" /> Low Performing
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" /> No Sales
          </label>
        </div>
      </div>

      {/* Service Listing Status */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Service Listing Status</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Active
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Inactive
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Draft
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Rejected
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Pending Approval
          </label>
        </div>
      </div>

      {/* Service Promoted */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Service Promoted</h3>

        <div className="text-brand-text flex gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Yes
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            No
          </label>
        </div>
      </div>

      {/* Pricing */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Service Pricing Model</h3>

        <div className="text-brand-text flex gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Fixed
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" /> Tiered
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" /> Custom
          </label>
        </div>
      </div>

      {/* Revenue */}

      <div className="space-y-4">
        <h3 className="text-brand-text text-sm font-medium">Total Revenue Generated</h3>

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

      {/* Discount Applied */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Discount Applied</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Yes
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            No
          </label>
        </div>
      </div>
    </section>
  )
}
