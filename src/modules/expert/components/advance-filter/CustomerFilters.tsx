import { FilterDateRange } from './FilterDateRange'
import { FilterInputRange } from './FilterInputRange'

export function CustomerFilters() {
    return (
        <section className="mt-8 rounded-xl bg-[#0B0B0B] p-6">

            <p className="mb-8 text-sm text-slate-400">
                By Customers
            </p>

            <div className="space-y-10">

                <FilterInputRange
                    title="Customer Total Orders"
                />

                <FilterDateRange
                    title="Customer Onboarding Date"
                />

                <FilterInputRange
                    title="Customer Cancellation Rate %"
                />

                <FilterInputRange
                    title="Customer Lifetime Spend"
                />

            </div>

        </section>
    )
}