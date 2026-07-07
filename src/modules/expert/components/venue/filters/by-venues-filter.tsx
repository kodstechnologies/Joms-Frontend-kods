import { Plus } from "lucide-react";

import { Input } from "@/shared/components/ui/input";

export function ByVenuesFilter() {
  return (
    <section className="rounded-xl border border-white/10 bg-brand-surface-2 p-8 space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <h2 className="text-sm font-medium text-brand-text">
          By Venues
        </h2>

        <Plus className="h-5 w-5 cursor-pointer text-brand-text" />

      </div>

      {/* Category */}

      <div className="space-y-2">

        <label className="text-sm font-medium text-brand-text">
          Category
        </label>

        <Input
          placeholder="Search by name"
          className="bg-brand-surface border-white/10"
        />

      </div>

      {/* Sub Category */}

      <div className="space-y-2">

        <label className="text-sm font-medium text-brand-text">
          Sub-category
        </label>

        <Input
          placeholder="Search by name"
          className="bg-brand-surface border-white/10"
        />

      </div>

      {/* Location */}

      <div className="space-y-3">

        <h3 className="text-sm font-medium text-brand-text">
          Location
        </h3>

        <div className="grid grid-cols-2 gap-6">

          <Input
            placeholder="State/Region"
            className="bg-brand-surface border-white/10"
          />

          <Input
            placeholder="City"
            className="bg-brand-surface border-white/10"
          />

        </div>

      </div>

      {/* Venue Type */}

      <div className="space-y-3">

        <h3 className="text-sm font-medium text-brand-text">
          Venue Type
        </h3>

        <div className="flex gap-8 text-sm text-brand-text">

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

        <h3 className="text-sm font-medium text-brand-text">
          Venue Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">

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

        <h3 className="text-sm font-medium text-brand-text">
          Approval Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">

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

        <h3 className="text-sm font-medium text-brand-text">
          Type
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">

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

        <h3 className="text-sm font-medium text-brand-text">
          Availability
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">

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

        <h3 className="text-sm font-medium text-brand-text">
          Amenities
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">

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

        <h3 className="text-sm font-medium text-brand-text">
          Number of Spaces
        </h3>

        <div className="grid grid-cols-2 gap-6">

          <div className="space-y-2">

            <label className="text-xs text-brand-muted-light">
              Max
            </label>

            <Input
              placeholder="Enter Number"
              className="bg-brand-surface border-white/10"
            />

          </div>

          <div className="space-y-2">

            <label className="text-xs text-brand-muted-light">
              Min
            </label>

            <Input
              placeholder="Enter Number"
              className="bg-brand-surface border-white/10"
            />

          </div>

        </div>

      </div>

    </section>
  );
}