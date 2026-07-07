import {
    ACCOUNT_STATUS,
    MEMBERSHIP_PURCHASED,
    MEMBERSHIP_TYPES,
    ORGANISATION_TYPES,
    PENDING_PAYOUTS,
    VERIFICATION_STATUS,
} from './filter-data'

import { FilterCheckboxGroup } from './FilterCheckboxGroup'

export function ExpertFilters() {
    return (
        <section className="rounded-xl bg-[#0B0B0B] p-6">

            <p className="mb-8 text-sm text-slate-400">
                By Experts
            </p>

            <div className="space-y-8">

                <FilterCheckboxGroup
                    title="Account Status"
                    options={ACCOUNT_STATUS}
                />

                <FilterCheckboxGroup
                    title="Verification Status"
                    options={VERIFICATION_STATUS}
                />

                <FilterCheckboxGroup
                    title="Organisation Type"
                    options={ORGANISATION_TYPES}
                />

                <FilterCheckboxGroup
                    title="Pending Payouts"
                    options={PENDING_PAYOUTS}
                />

                <FilterCheckboxGroup
                    title="Membership Purchased"
                    options={MEMBERSHIP_PURCHASED}
                />

                <FilterCheckboxGroup
                    title="Membership Type"
                    options={MEMBERSHIP_TYPES}
                />

            </div>

        </section>
    )
}