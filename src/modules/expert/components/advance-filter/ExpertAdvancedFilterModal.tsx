import { X, RotateCcw, Filter } from 'lucide-react'
import { ServiceFilters } from './ServiceFilters'
import { Button } from '@/shared/components/ui/button'
import { ExpertFilters } from './ExpertFilters'
import { OrderFilters } from './OrderFilters'
import { CustomerFilters } from './CustomerFilters'
import { LocationFilters } from './LocationFilters'

type ExpertAdvancedFilterModalProps = {
    open: boolean
    onClose: () => void
}

export function ExpertAdvancedFilterModal({
    open,
    onClose,
}: ExpertAdvancedFilterModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex h-[90vh] w-full max-w-[1150px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl">

                <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
                    <h2 className="text-xl font-semibold text-white">
                        Advanced Filters - Expert Management
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 text-white transition hover:bg-white/10"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <>
                        <ExpertFilters />

                        <ServiceFilters />

                        <OrderFilters />

                        <CustomerFilters />

                        <LocationFilters />
                    </>

                </div>

                <div className="flex items-center justify-between border-t border-white/10 px-8 py-5">

                    <Button
                        variant="secondary"
                        onClick={() => console.log('Reset')}
                        className="flex items-center gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset Filters
                    </Button>

                    <Button
                        onClick={() => console.log('Apply')}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Apply Filters
                    </Button>

                </div>

            </div>
        </div>
    )
}