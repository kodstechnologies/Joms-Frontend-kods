import { Plus } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'

import { FilterCheckboxGroup } from './FilterCheckboxGroup'
import { FilterInputRange } from './FilterInputRange'

export function ExpertFilters() {
    return (
        <section className="mt-8 rounded-xl bg-[#0B0B0B] p-6">

            <div className="mb-8 flex items-center justify-between">

                <p className="text-sm text-slate-400">
                    By Experts
                </p>

                <Plus className="h-5 w-5 text-white" />

            </div>

            <div className="space-y-10">

                {/* Category */}

                <div className="space-y-3">

                    <h3 className="text-base font-semibold text-white">
                        Category
                    </h3>

                    <Input
                        placeholder="Search by name"
                        className="h-12 border-white/10 bg-[#1A1A1A] text-white placeholder:text-slate-500"
                    />

                    {/* Temporary chips */}
                    <div className="flex flex-wrap gap-2">

                        <span className="rounded-full bg-[#1E1E1E] px-3 py-1 text-xs text-white">
                            Sarah Johnson ✕
                        </span>

                        <span className="rounded-full bg-[#1E1E1E] px-3 py-1 text-xs text-white">
                            David Kim ✕
                        </span>

                    </div>

                </div>

                <FilterCheckboxGroup
                    title="Category Status"
                    options={[
                        'Active',
                        'Inactive',
                        'Draft',
                        'Deleted',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Service Performance"
                    options={[
                        'Trending',
                        'Top Performing',
                        'Low Performing',
                        'No Sales',
                    ]}
                />

                <FilterInputRange
                    title="Revenue Generated"
                />

                {/* Profession */}

                <div className="space-y-3">

                    <h3 className="text-base font-semibold text-white">
                        Profession
                    </h3>

                    <Input
                        placeholder="Search by name"
                        className="h-12 border-white/10 bg-[#1A1A1A] text-white placeholder:text-slate-500"
                    />

                    <div className="flex flex-wrap gap-2">

                        <span className="rounded-full bg-[#1E1E1E] px-3 py-1 text-xs text-white">
                            Sarah Johnson ✕
                        </span>

                        <span className="rounded-full bg-[#1E1E1E] px-3 py-1 text-xs text-white">
                            David Kim ✕
                        </span>

                    </div>

                </div>

                <FilterCheckboxGroup
                    title="Organisation Type"
                    options={[
                        'Individual',
                        'Company',
                        'Agency',
                        'Others',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Pending Payouts"
                    options={[
                        'Yes',
                        'No',
                        'Disputed',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Membership Purchased"
                    options={[
                        'Yes',
                        'No',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Membership Type"
                    options={[
                        'Basic',
                        'Premium',
                        'Standard',
                        'Curators',
                        "Founder's circle",
                    ]}
                />

            </div>

        </section>
    )
}