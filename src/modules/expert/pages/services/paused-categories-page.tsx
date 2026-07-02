import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../../hooks/use-categories";
import CategoryHeader from "../../components/category/CategoryHeader";
import {
  pausedCategoryColumns,
 
} from "../../components/category/PausedCategoryColumns";

import { DataTable } from "@/shared/components/table/data-table";
import { Button } from "@/shared/components/ui/button";



export const PausedCategoriesPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  
const { data, isLoading, error } = useCategories({
  page,
  limit: 10,
  status: "PAUSED",
});
const pausedCategories = data?.data ?? [];
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <CategoryHeader
          title="Paused Categories"
          breadcrumb="Paused Categories"
        />

        <div className="flex items-center gap-3">
          <Button className="bg-[#F0C27B] text-black hover:bg-[#f4cc91]">
            Manage Metrics
          </Button>

          <Button
            className="gap-2 bg-[#F0C27B] text-black hover:bg-[#f4cc91]"
            onClick={() =>
              navigate("/categories/management/create")
            }
          >
            <Plus size={16} />
            Add New Category
          </Button>
        </div>
      </div>

      <DataTable
        columns={pausedCategoryColumns}
        data={pausedCategories}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, ID or profession"
        onAdvancedFilter={() =>
          console.log("Advanced Filter")
        }
        onExport={() =>
          console.log("Export")
        }
        pagination={{
          page,
          pageSize: 10,
          totalItems: data?.meta?.pagination?.total ?? 0,
          totalPages: data?.meta?.pagination?.pages ?? 1,
          onPageChange: setPage,
        }}
        resourceLabel="categories"
      />
    </div>
  );
};

