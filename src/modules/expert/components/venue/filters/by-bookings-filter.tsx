import { Plus } from "lucide-react";

import { Input } from "@/shared/components/ui/input";

export function ByBookingsFilter() {
  return (
    <section className="rounded-xl border border-white/10 bg-brand-surface-2 p-8 space-y-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-brand-text">
          By Bookings
        </h2>

        <Plus className="h-5 w-5 cursor-pointer text-brand-text" />
      </div>

      {/* Total Number Of Bookings */}

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-brand-text">
          Total Number Of Bookings
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-brand-muted-light">
              From
            </label>

            <Input
              placeholder="0"
              className="bg-brand-surface border-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-brand-muted-light">
              To
            </label>

            <Input
              placeholder="500"
              className="bg-brand-surface border-white/10"
            />
          </div>
        </div>
      </div>

      {/* Booking Status */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Booking Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
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

      {/* Payment Status */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Payment Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
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

      {/* Payment Method */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Payment Method
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
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

      {/* Refunded Status */}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-brand-text">
          Refunded Status
        </h3>

        <div className="flex flex-wrap gap-8 text-sm text-brand-text">
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
  );
}