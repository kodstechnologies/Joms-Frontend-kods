import { Filter, RotateCcw, X } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { ExpertFilters } from './ExpertFilters'
import { ServiceFilters } from './ServiceFilters'
import { OrderFilters } from './OrderFilters'
import { CustomerFilters } from './CustomerFilters'
import { LocationFilters } from './LocationFilters'

type ServiceAdvancedFilterModalProps = {
    open: boolean
    onClose: () => void
}

export function ServiceAdvancedFilterModal({
    open,
    onClose,
}: ServiceAdvancedFilterModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex h-[90vh] w-full max-w-[1150px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-brand-surface shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">

                    <h2 className="text-xl font-semibold text-brand-text">
                        Advanced Filters - Service Management
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 text-white transition hover:bg-white/10"
                    >
                        <X className="h-5 w-5" />
                    </button>

                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-8 py-6">

                    <>
                        <ServiceFilters />

                        <ExpertFilters />

                        <OrderFilters />

                        <CustomerFilters />

                        <LocationFilters />
                    </>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-white/10 px-8 py-5">

                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={() => console.log('Reset')}
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset Filters
                    </Button>

                    <Button
                        className="flex items-center gap-2"
                        onClick={() => console.log('Apply')}
                    >
                        <Filter className="h-4 w-4" />
                        Apply Filters
                    </Button>

                </div>

            </div>
        </div>
    )
}