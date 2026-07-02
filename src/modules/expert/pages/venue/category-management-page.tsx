import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/table/data-table";

import { StatCard } from "../../components/stat-card";
import { SummaryCard } from "../../components/summary-card";
import { venueCategoryColumns } from "../../components/category/venue-category-table-columns";
import { useVenueCategoryStore } from "../../store/venue-category-store";

export function VenueCategoryManagementPage() {
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(1);

    const navigate = useNavigate();

    const categories = useVenueCategoryStore(
        (state) => state.categories
    );

    const tableCategories = categories.filter(
        (category) => category.status !== "Paused"
    );

    const activeCount = categories.filter(
        (category) => category.status === "Accepted"
    ).length;

    const pausedCount = categories.filter(
        (category) => category.status === "Paused"
    ).length;

    const deletedCount = categories.filter(
        (category) => category.status === "Deleted"
    ).length;

    const totalCategories = categories.length;

    return (
        <div className="flex flex-col gap-4 p-0 md:gap-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white md:text-3xl">
                        Category Management
                    </h1>

                    <p className="mt-1 text-sm text-slate-400 md:text-base">
                        Monitor and manage all categories & sub-category
                    </p>
                </div>

                <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
          <Button className="w-full md:w-auto" onClick={() => navigate('/venues/dashboard/metrics')}>
                        Manage Metrics
                    </Button>

                    <Button
                        onClick={() =>
                            navigate("/venues/categories/management/create")
                        }
                        className="w-full md:w-auto"
                    >
                        Add New Category
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
                <StatCard
                    title="Total Categories"
                    value={totalCategories.toString()}
                />

                <StatCard
                    title="Active Categories"
                    value={activeCount.toString()}
                />

                <StatCard
                    title="Total Sub Category"
                    value="156"
                />

                <StatCard
                    title="Top Category"
                    value="Technology"
                />
            </div>


            <div className="grid grid-cols-2 gap-5">
                <SummaryCard
                    onClick={() =>
                        navigate("/venues/categories/management/paused")
                    }
                    title="Paused Category"
                    value={pausedCount.toString()}
                    color="yellow"
                />

                <SummaryCard
                    onClick={() =>
                        navigate("/venues/categories/management/deleted")
                    }
                    title="Deleted Category"
                    value={deletedCount.toString()}
                    color="red"
                />
            </div>


            <div className="w-full rounded-2xl border border-[#242424] bg-[#171717] p-6">
                <DataTable
                    columns={venueCategoryColumns}
                    data={tableCategories}
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder="Search by name, ID or profession"
                    onAdvancedFilter={() => { }}
                    onExport={() => { }}
                    pagination={{
                        page,
                        pageSize: 10,
                        totalItems: tableCategories.length,
                        totalPages: 2,
                        onPageChange: setPage,
                    }}
                    resourceLabel="users"
                />
            </div>
        </div>
    );
}