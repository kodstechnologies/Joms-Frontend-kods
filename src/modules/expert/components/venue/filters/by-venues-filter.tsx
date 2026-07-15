import { Plus } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'

export function ByVenuesFilter() {
  return (
    <section className="bg-brand-surface-2 space-y-8 rounded-xl border border-white/10 p-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h2 className="text-brand-text text-sm font-medium">By Venues</h2>

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

      {/* Location */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Location</h3>

        <div className="grid grid-cols-2 gap-6">
          <Input placeholder="State/Region" className="bg-brand-surface border-white/10" />

          <Input placeholder="City" className="bg-brand-surface border-white/10" />
        </div>
      </div>

      {/* Venue Type */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Venue Type</h3>

        <div className="text-brand-text flex gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Indoor
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Outdoor
          </label>
        </div>
      </div>

      {/* Venue Status */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Venue Status</h3>

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
            Suspended
          </label>
        </div>
      </div>

      {/* Approval Status */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Approval Status</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Approved
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Pending
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Rejected
          </label>
        </div>
      </div>

      {/* Type */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Type</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Conference Rooms
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Auditorium
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Co-Working Space
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Studio
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Hall
          </label>
        </div>
      </div>

      {/* Availability */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Availability</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Available Now
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Weekdays
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Weekends
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            24/7
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            By Appointment
          </label>
        </div>
      </div>

      {/* Amenities */}

      <div className="space-y-3">
        <h3 className="text-brand-text text-sm font-medium">Amenities</h3>

        <div className="text-brand-text flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Wifi
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Parking
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Catering
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Kitchen
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" />
            AV Equipment
          </label>
        </div>
      </div>

      {/* Number of Spaces */}

      <div className="space-y-4">
        <h3 className="text-brand-text text-sm font-medium">Number of Spaces</h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-brand-muted-light text-xs">Max</label>

            <Input placeholder="Enter Number" className="bg-brand-surface border-white/10" />
          </div>

          <div className="space-y-2">
            <label className="text-brand-muted-light text-xs">Min</label>

            <Input placeholder="Enter Number" className="bg-brand-surface border-white/10" />
          </div>
        </div>
      </div>
    </section>
  )
}
