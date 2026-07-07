import { Plus } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'

import { FilterCheckboxGroup } from './FilterCheckboxGroup'

export function VenueFilters() {
    return (
        <section className="rounded-xl bg-brand-bg p-6">

            <div className="mb-8 flex items-center justify-between">

                <p className="text-sm text-brand-muted">
                    By Venues
                </p>

                <Plus className="h-5 w-5 text-brand-text" />

            </div>

            <div className="space-y-10">

                {/* Location */}

                <div className="space-y-4">

                    <h3 className="text-base font-semibold text-brand-text">
                        Location
                    </h3>

                    <div className="grid grid-cols-2 gap-6">

                        <Input
                            placeholder="State/Region"
                            className="h-12 bg-brand-surface text-brand-text placeholder:text-brand-muted"
                        />

                        <Input
                            placeholder="City"
                            className="h-12 bg-brand-surface text-brand-text placeholder:text-brand-muted"
                        />

                    </div>

                </div>

                {/* Category */}

                <div className="space-y-3">

                    <h3 className="text-base font-semibold text-brand-text">
                        Category
                    </h3>

                    <Input
                        placeholder="Search by name"
                        className="h-12 bg-brand-surface text-brand-text placeholder:text-brand-muted"
                    />

                </div>

                {/* Sub Category */}

                <div className="space-y-3">

                    <h3 className="text-base font-semibold text-brand-text">
                        Sub-category
                    </h3>

                    <Input
                        placeholder="Search by name"
                        className="h-12 bg-brand-surface text-brand-text placeholder:text-brand-muted"
                    />

                </div>

                <FilterCheckboxGroup
                    title="Venue Type"
                    options={[
                        'Indoor',
                        'Outdoor',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Venue Status"
                    options={[
                        'Active',
                        'Inactive',
                        'Suspended',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Approval Status"
                    options={[
                        'Approved',
                        'Pending',
                        'Rejected',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Availability"
                    options={[
                        'Available Now',
                        'Weekdays',
                        'Weekends',
                        '24/7',
                        'By Appointment',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Amenities"
                    options={[
                        'Wifi',
                        'Parking',
                        'Catering',
                        'Kitchen',
                        'AV Equipment',
                    ]}
                />

            </div>

        </section>
    )
}