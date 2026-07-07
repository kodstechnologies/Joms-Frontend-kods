import { Plus } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'

import { FilterCheckboxGroup } from './FilterCheckboxGroup'

export function ServiceFilters() {
    return (
        <section className="rounded-xl bg-[#0B0B0B] p-6">

            <div className="mb-8 flex items-center justify-between">

                <p className="text-sm text-slate-400">
                    By Services
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

                </div>

                {/* Sub Category */}

                <div className="space-y-3">

                    <h3 className="text-base font-semibold text-white">
                        Sub-category
                    </h3>

                    <Input
                        placeholder="Search by name"
                        className="h-12 border-white/10 bg-[#1A1A1A] text-white placeholder:text-slate-500"
                    />

                </div>

                <FilterCheckboxGroup
                    title="Service Listing Status"
                    options={[
                        'Active',
                        'Inactive',
                        'Draft',
                        'Rejected',
                        'Pending Approval',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Service Promoted"
                    options={[
                        'Yes',
                        'No',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Service Pricing Model"
                    options={[
                        'Fixed',
                        'Tiered',
                        'Custom',
                    ]}
                />

                {/* Second Service Listing Status */}

                <FilterCheckboxGroup
                    title="Service Listing Status"
                    options={[
                        'Active',
                        'Inactive',
                        'Draft',
                        'Rejected',
                        'Pending Approval',
                    ]}
                />

                {/* Second Service Promoted */}

                <FilterCheckboxGroup
                    title="Service Promoted"
                    options={[
                        'Yes',
                        'No',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Discount Applied"
                    options={[
                        'Yes',
                        'No',
                    ]}
                />

            </div>

        </section>
    )
}