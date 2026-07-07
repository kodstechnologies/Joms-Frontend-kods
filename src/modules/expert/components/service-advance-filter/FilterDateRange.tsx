type FilterDateRangeProps = {
    title: string
}

export function FilterDateRange({
    title,
}: FilterDateRangeProps) {
    return (
        <div className="space-y-3">

            <h4 className="text-sm font-semibold text-white">
                {title}
            </h4>

            <div className="grid grid-cols-2 gap-8">

                <div>
                    <label className="mb-2 block text-xs text-slate-400">
                        From
                    </label>

                    <input
                        type="date"
                        className="h-12 w-full rounded-lg border border-white/10 bg-[#1B1B1B] px-4 text-white outline-none focus:border-[#FFC849]"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-xs text-slate-400">
                        To
                    </label>

                    <input
                        type="date"
                        className="h-12 w-full rounded-lg border border-white/10 bg-[#1B1B1B] px-4 text-white outline-none focus:border-[#FFC849]"
                    />
                </div>

            </div>

        </div>
    )
}