import { Plus } from 'lucide-react'

import { Input } from '@/shared/components/ui/input'

export function LocationFilters() {
    return (
        <section className="mt-8 rounded-xl bg-[#0B0B0B] p-6">

            <div className="mb-8 flex items-center justify-between">

                <p className="text-sm text-slate-400">
                    By Location
                </p>

                <Plus className="h-5 w-5 text-white" />

            </div>

            <div className="space-y-6">

                <div>

                    <h3 className="mb-3 text-base font-semibold text-white">
                        Location
                    </h3>

                    <div className="grid grid-cols-2 gap-8">

                        <Input
                            placeholder="State / Region"
                            className="h-12 border-white/10 bg-[#1A1A1A] text-white placeholder:text-slate-500"
                        />

                        <Input
                            placeholder="City"
                            className="h-12 border-white/10 bg-[#1A1A1A] text-white placeholder:text-slate-500"
                        />

                    </div>

                </div>

            </div>

        </section>
    )
}