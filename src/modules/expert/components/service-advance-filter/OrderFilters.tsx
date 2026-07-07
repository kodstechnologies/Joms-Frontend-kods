import { Plus } from 'lucide-react'

import { FilterCheckboxGroup } from './FilterCheckboxGroup'

export function OrderFilters() {
    return (
        <section className="mt-8 rounded-xl bg-[#0B0B0B] p-6">

            <div className="mb-8 flex items-center justify-between">

                <p className="text-sm text-slate-400">
                    By Orders
                </p>

                <Plus className="h-5 w-5 text-white" />

            </div>

            <div className="space-y-10">

                <FilterCheckboxGroup
                    title="Service Order Status"
                    options={[
                        'Completed',
                        'In-Progress',
                        'Cancelled',
                        'Refunded',
                        'Disputed',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Delays Beyond SLA (Service Timelines Extended)"
                    options={[
                        'Yes',
                        'No',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Payment Status"
                    options={[
                        'Paid',
                        'Partially Paid (Milestone)',
                        'Unpaid (Milestone)',
                        'Refunded',
                        'Disputed',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Payment Method"
                    options={[
                        'Card',
                        'UPI/Wallet',
                        'Bank Transfer',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Payout Status"
                    options={[
                        'Pending',
                        'Processed',
                        'Failed',
                        'Successful',
                        'Disputed',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Dispute Status"
                    options={[
                        'Pending',
                        'Resolved',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Refund Status"
                    options={[
                        'Pending',
                        'Processed',
                        'Failed',
                        'Successful',
                        'Disputed',
                    ]}
                />

                <FilterCheckboxGroup
                    title="Risk based (Service Timelines Extended)"
                    options={[
                        'SEV1',
                        'SEV2',
                    ]}
                />

            </div>

        </section>
    )
}