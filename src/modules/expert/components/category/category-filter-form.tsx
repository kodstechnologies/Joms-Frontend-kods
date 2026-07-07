import { Button } from "@/shared/components/ui/button";

export function CategoryFilterForm() {
    return (
        <div className="rounded-xl border border-white/10 bg-brand-surface p-6">

            <h2 className="mb-6 text-xl font-semibold text-brand-text">
                By Service
            </h2>

            <div className="grid grid-cols-2 gap-6">

                <div>
                    <label className="mb-2 block text-sm text-brand-text">
                        Service Name
                    </label>

                    <input
                        className="h-11 w-full rounded-lg border border-white/10 bg-brand-surface-2 px-3 text-brand-text"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-brand-text">
                        Category
                    </label>

                    <input
                        className="h-11 w-full rounded-lg border border-white/10 bg-brand-surface-2 px-3 text-brand-text"
                    />
                </div>

            </div>

            <div className="mt-10 flex justify-end gap-4">

                <Button
                    variant="secondary"
                    className="border border-white/10 bg-transparent text-brand-text hover:bg-brand-surface"
                >
                    Reset Filters
                </Button>

                <Button
                    className="bg-gradient-to-r from-brand-gold-from to-brand-gold-to text-brand-text-dark hover:opacity-90"
                >
                    Apply Filters
                </Button>

            </div>

        </div>
    );
}