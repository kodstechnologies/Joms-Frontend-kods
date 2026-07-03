import { useMemo, useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/table/data-table";

import { StatCard } from "../../components/stat-card";
import { SummaryCard } from "../../components/summary-card";
import { venueCategoryColumns } from "../../components/category/venue-category-table-columns";
import { categoryManagementTheme } from "../../components/category/category-management.theme";
import { useVenueCategoryStore } from "../../store/venue-category-store";

const PAGE_SIZE = 10;

export function VenueCategoryManagementPage() {
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const categories = useVenueCategoryStore((state) => state.categories);

  const tableCategories = useMemo(() => {
    const visible = categories.filter((category) => category.status !== "Paused");
    const query = searchValue.trim().toLowerCase();

    if (!query) return visible;

    return visible.filter(
      (category) =>
        category.id.toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query),
    );
  }, [categories, searchValue]);

  const totalPages = Math.max(1, Math.ceil(tableCategories.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return tableCategories.slice(start, start + PAGE_SIZE);
  }, [currentPage, tableCategories]);

  return (
    <div
      className="flex flex-col gap-5 pb-6 md:gap-6"
      style={{ backgroundColor: categoryManagementTheme.pageBg }}
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-white md:text-[28px]">
            Category Management
          </h1>
          <p className="mt-1.5 text-[13px] text-[#888888]">
            Monitor and manage all categories & sub-category
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Button
            variant="secondary"
            className="h-10 w-full gap-2 rounded-xl border border-[#FFC16B] bg-transparent px-4 text-[13px] font-semibold text-[#FFC16B] shadow-none hover:bg-[#FFC16B]/10 sm:w-auto"
            onClick={() => navigate("/venues/dashboard/metrics")}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Manage Metrics
          </Button>

          <Button
            className="h-10 w-full gap-2 rounded-xl bg-[#FFC16B] px-4 text-[13px] font-semibold text-black shadow-none hover:bg-[#F5C27B] sm:w-auto"
            onClick={() => navigate("/venues/categories/management/create")}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add New Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total categories" value="247" />
        <StatCard title="Active Categories" value="38" />
        <StatCard title="Total Sub-Category" value="156" />
        <StatCard title="Top Category" value="Technology" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SummaryCard
          onClick={() => navigate("/venues/categories/management/paused")}
          title="Paused Category"
          value="08"
          color="yellow"
        />

        <SummaryCard
          onClick={() => navigate("/venues/categories/management/deleted")}
          title="Deleted Category"
          value="09"
          color="red"
        />
      </div>

      <DataTable
        columns={venueCategoryColumns}
        data={paginatedCategories}
        getRowId={(row) => row.id}
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value);
          setPage(1);
        }}
        searchPlaceholder="Search by name, ID or profession"
        onAdvancedFilter={() => {}}
        advancedFiltersLabel="Advance Filters"
        onExport={() => {}}
        showSortIcons={false}
        tone="category"
        pagination={{
          page: currentPage,
          pageSize: PAGE_SIZE,
          totalItems: tableCategories.length,
          totalPages,
          onPageChange: setPage,
        }}
        resourceLabel="users"
      />
    </div>
  );
}
