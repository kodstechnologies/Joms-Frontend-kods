import { Plus } from 'lucide-react'

import { FilterDateRange } from './FilterDateRange'

export function CustomerFilters() {
    return (
        <section className="mt-8 rounded-xl bg-brand-bg p-6">

            <div className="mb-8 flex items-center justify-between">

                <p className="text-sm text-brand-muted">
                    By Customers
                </p>

                <Plus className="h-5 w-5 text-brand-text" />

            </div>

            <div className="space-y-10">

                <FilterDateRange
                    title="Registration Date"
                />

            </div>

        </section>
    )
}