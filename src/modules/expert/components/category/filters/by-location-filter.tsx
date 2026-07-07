import { Plus } from "lucide-react";

import { Input } from "@/shared/components/ui/input";

export function ByLocationFilter() {
  return (
    <section className="rounded-xl border border-white/10 bg-brand-surface-2 p-8 space-y-8">

      <div className="flex items-center justify-between">

        <h2 className="text-sm font-medium text-brand-text">
          By Location
        </h2>

        <Plus className="h-5 w-5 cursor-pointer text-brand-text" />

      </div>

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

    </section>
  );
}