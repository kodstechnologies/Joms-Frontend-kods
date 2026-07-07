import { ArrowLeft, Funnel, RotateCcw, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";

import {
    ByCustomersFilter,
    ByExpertsFilter,
    ByLocationFilter,
    ByOrdersFilter,
    ByServicesFilter,
} from "./filters";

export function CategoryAdvancedFilter() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-brand-bg text-brand-text">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="h-10 w-10 p-0"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={18} />
                    </Button>

                    <h1 className="text-2xl font-semibold">
                        Advanced Filters - Service Category Management
                    </h1>
                </div>

                <Button
                    variant="ghost"
                    className="h-10 w-10 p-0"
                    onClick={() => navigate(-1)}
                >
                    <X size={20} />
                </Button>
            </div>

            {/* Body */}
            <div className="mx-auto max-w-7xl space-y-6 px-8 py-8">
                {/* Services + Experts */}
                <div className="rounded-brand-lg border border-white/10 bg-brand-surface p-8">
                    <ByServicesFilter />

                    <div className="mt-10">
                        <ByExpertsFilter />
                    </div>
                </div>

                {/* Orders */}
                <ByOrdersFilter />

                {/* Customers */}
                <ByCustomersFilter />

                {/* Location */}
                <ByLocationFilter />
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-white/10 bg-brand-bg px-8 py-5">
                <div className="flex items-center justify-between">
                    <Button
                        variant="secondary"
                        className="border border-white/10 bg-transparent text-brand-text hover:bg-brand-surface"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Filters
                    </Button>

                    <Button className="bg-gradient-to-r from-brand-gold-from to-brand-gold-to text-brand-text-dark hover:opacity-90">
                        <Funnel className="mr-2 h-4 w-4" />
                        Apply Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}