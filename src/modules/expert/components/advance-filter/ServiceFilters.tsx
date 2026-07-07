import {
    DISCOUNT_APPLIED,
    SERVICE_LISTING_STATUS,
    SERVICE_PRICING_MODEL,
    SERVICE_PROMOTED,
} from './filter-data'

import { FilterCheckboxGroup } from './FilterCheckboxGroup'
import { FilterInputRange } from './FilterInputRange'

export function ServiceFilters() {
    return (
        <section className="mt-8 rounded-xl bg-[#0B0B0B] p-6">

            <p className="mb-8 text-sm text-slate-400">
                By Services
            </p>

            <div className="space-y-8">

                <FilterCheckboxGroup
                    title="Service Listing Status"
                    options={SERVICE_LISTING_STATUS}
                />

                <FilterCheckboxGroup
                    title="Service Promoted"
                    options={SERVICE_PROMOTED}
                />

                <FilterCheckboxGroup
                    title="Service Pricing Model"
                    options={SERVICE_PRICING_MODEL}
                />

                <FilterInputRange
                    title="Total Revenue Generated"
                />

                <FilterCheckboxGroup
                    title="Discount Applied"
                    options={DISCOUNT_APPLIED}
                />

            </div>

        </section>
    )
}