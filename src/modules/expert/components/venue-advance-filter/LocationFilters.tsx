import { Plus } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'

export function LocationFilters() {
    return (
        <section className="mt-8 rounded-xl bg-brand-bg p-6">

            <div className="mb-8 flex items-center justify-between">

                <p className="text-sm text-brand-muted">
                    By Location
                </p>

                <Plus className="h-5 w-5 text-brand-text" />

            </div>

            <div className="space-y-6">

                <div>

                    <h3 className="mb-3 text-base font-semibold text-brand-text">
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

            </div>

        </section>
    )
}