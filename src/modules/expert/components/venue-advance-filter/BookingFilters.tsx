import { Plus } from 'lucide-react'

import { FilterCheckboxGroup } from './FilterCheckboxGroup'
import { FilterInputRange } from './FilterInputRange'

export function BookingFilters() {
    return (
        <section className="mt-8 rounded-xl bg-brand-bg p-6">

            <div className="mb-8 flex items-center justify-between">

                <p className="text-sm text-brand-muted">
                    By Bookings
                </p>

                <Plus className="h-5 w-5 text-brand-text" />

            </div>

            <div className="space-y-10">

                <FilterInputRange
                    title="Total Number Of Bookings"
                />

                <FilterCheckboxGroup
                    title="Booking Status"
                    options={[
                        'Pending',
                        'Confirmed',
                        'Completed',
                        'Cancelled',
                        'No Show',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Payment Status"
                    options={[
                        'Paid',
                        'Pending',
                        'Failed',
                        'Refunded',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Payment Method"
                    options={[
                        'Card',
                        'UPI',
                        'Net Banking',
                        'Wallet',
                        'Cash',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Refund Status"
                    options={[
                        'Pending',
                        'Processed',
                        'Failed',
                        'Successful',
                    ]}
                />

            </div>

        </section>
    )
}