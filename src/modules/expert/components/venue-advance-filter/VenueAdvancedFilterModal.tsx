import { Filter, RotateCcw, X } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'

import { VenueFilters } from './VenueFilters'
import { BookingFilters } from './BookingFilters'
import { CustomerFilters } from './CustomerFilters'
import { LocationFilters } from './LocationFilters'

type VenueAdvancedFilterModalProps = {
    open: boolean
    onClose: () => void
}

export function VenueAdvancedFilterModal({
    open,
    onClose,
}: VenueAdvancedFilterModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">

            <div className="flex h-[90vh] w-full max-w-[1150px] flex-col overflow-hidden rounded-xl bg-brand-surface shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">

                    <h2 className="text-xl font-semibold text-brand-text">
                        Advanced Filters - Venue Management
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 text-brand-text hover:bg-brand-bg"
                    >
                        <X className="h-5 w-5" />
                    </button>

                </div>

                {/* Body */}

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

                    <VenueFilters />

                    <BookingFilters />

                    <CustomerFilters />

                    <LocationFilters />

                </div>

                {/* Footer */}

                <div className="flex items-center justify-between border-t border-white/10 px-8 py-5">

                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset Filters
                    </Button>

                    <Button
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