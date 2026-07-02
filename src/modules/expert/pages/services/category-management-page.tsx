import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/table/data-table";
import type { CategoryTableRow } from "../../components/category/category-table-columns";
import { StatCard } from "../../components/stat-card";
import { SummaryCard } from "../../components/summary-card";
import { categoryColumns } from "../../components/category/category-table-columns";
//import { useCategoryStore } from "../../store/category-store";
import { useCategories } from "../../hooks/use-categories";

export function CategoryManagementPage() {
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(1);

    const navigate = useNavigate();

    const { data, isLoading, error } = useCategories({
        page: 1,
        limit: 10,
    });

    const categories: CategoryTableRow[] = (data?.data ?? []).map((category) => ({
  _id: category._id,
  categoryId: category.categoryId ?? "",
  name: category.name,
  description: category.description,

  icon3D: category.icon3D,
  image: category.image,

  status: category.status,

  services: 0,
  experts: 0,
  revenue: "₹0",

  createdAt: category.createdAt,
  updatedAt: category.updatedAt,

  createdBy: "",
  adminNotes: "",

  subCategories: category.subCategories.map((sub) => ({
    _id: sub._id,
    name: sub.name,
    description: sub.description,
    vectorIcon: sub.vectorIcon,
    status: sub.status,

    services: 0,
    experts: 0,

    createdBy: "",
    adminNotes: "",
    addedOn: "",
    updatedAt: "",
  })),
}));
    const tableCategories = categories.filter(
        (category) => category.status !== "PAUSED"
    );

    const activeCount = categories.filter(
        (category) => category.status === "ACTIVE"
    ).length;

    const pausedCount = categories.filter(
        (category) => category.status === "PAUSED"
    ).length;

    const deletedCount = categories.filter(
        (category) => category.status === "DELETED"
    ).length;

    const totalCategories = categories.length;
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Failed to load categories.</div>;
    }
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
                    <Button className="w-full md:w-auto">
                        Manage Metrics
                    </Button>

                    <Button
                        onClick={() =>
                            navigate("/categories/management/create")
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
                        navigate("/categories/management/paused")
                    }
                    title="Paused Category"
                    value={pausedCount.toString()}
                    color="yellow"
                />

                <SummaryCard
                    onClick={() =>
                        navigate("/categories/management/deleted")
                    }
                    title="Deleted Category"
                    value={deletedCount.toString()}
                    color="red"
                />
            </div>


            <div className="w-full rounded-2xl border border-[#242424] bg-[#171717] p-6">
                <DataTable
                    columns={categoryColumns}
                    data={tableCategories}
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder="Search by name, ID or profession"
                    onAdvancedFilter={() => { }}
                    onExport={() => { }}
                    pagination={{
                        page,
                        pageSize: data?.meta.pagination.limit ?? 10,
                        totalItems: data?.meta.pagination.total ?? 0,
                        totalPages: data?.meta.pagination.pages ?? 1,
                        onPageChange: setPage,
                    }}
                    resourceLabel="users"
                />
            </div>
        </div>
    );
}