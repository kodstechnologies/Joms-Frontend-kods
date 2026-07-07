import { Plus } from 'lucide-react'

import { FilterInputRange } from './FilterInputRange'

export function CustomerFilters() {
    return (
        <section className="mt-8 rounded-xl bg-[#0B0B0B] p-6">

            <div className="mb-8 flex items-center justify-between">

                <p className="text-sm text-slate-400">
                    By Customers
                </p>

                <Plus className="h-5 w-5 text-white" />

            </div>

            <div className="space-y-10">

                <FilterInputRange
                    title="Customer Lifetime Spend"
                />

                <FilterInputRange
                    title="Customer Cancellation Rate %"
                />

            </div>

        </section>
    )
}