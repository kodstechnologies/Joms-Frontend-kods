import { Plus } from "lucide-react";

import { Input } from "@/shared/components/ui/input";

export function ByCustomersFilter() {
  return (
    <section className="rounded-xl border border-white/10 bg-brand-surface-2 p-8 space-y-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-brand-text">
          By Customers
        </h2>

        <Plus className="h-5 w-5 cursor-pointer text-brand-text" />
      </div>

      {/* Registration Date */}

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-brand-text">
          Registration Date
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

      {/* Customer Total Bookings */}

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-brand-text">
          Customer Total Bookings
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
    </section>
  );
}