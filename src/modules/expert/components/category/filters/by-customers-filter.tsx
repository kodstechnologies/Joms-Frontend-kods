import { Input } from "@/shared/components/ui/input";

export function ByCustomersFilter() {
  return (
    <section className="rounded-xl border border-white/10 bg-brand-surface-2 p-8 space-y-8">

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-brand-text">
          By Customers
        </h2>
      </div>

      {/* Customer Lifetime Spend */}

      <div className="space-y-4">

        <h3 className="text-sm font-medium text-brand-text">
          Customer Lifetime Spend
        </h3>

        <div className="grid grid-cols-2 gap-6">

          <div className="space-y-2">
            <label className="text-xs text-brand-muted-light">
              From
            </label>

            <Input
              placeholder="Enter Number"
              className="bg-brand-surface border-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-brand-muted-light">
              To
            </label>

            <Input
              placeholder="Enter Number"
              className="bg-brand-surface border-white/10"
            />
          </div>

        </div>

      </div>

      {/* Customer Cancellation */}

      <div className="space-y-4">

        <h3 className="text-sm font-medium text-brand-text">
          Customer Cancellation Rate %
        </h3>

        <div className="grid grid-cols-2 gap-6">

          <div className="space-y-2">
            <label className="text-xs text-brand-muted-light">
              From
            </label>

            <Input
              placeholder="Enter Number"
              className="bg-brand-surface border-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-brand-muted-light">
              To
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