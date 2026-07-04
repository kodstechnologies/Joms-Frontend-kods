import type { ColumnDef } from "@tanstack/react-table";

import CategoryTableActions from "./CategoryTableActions";
import { categoryManagementTheme } from "./category-management.theme";
import type { Category } from "./category-table-columns";

const statusStyles = {
  Accepted: categoryManagementTheme.statusAccepted,
  Pending: categoryManagementTheme.statusPending,
  Deleted: categoryManagementTheme.statusDeleted,
} as const;

function StatusBadge({ status }: { status: string }) {
  const style =
    statusStyles[status as keyof typeof statusStyles] ??
    "border border-white/10 bg-white/5 text-[#CCCCCC]";

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ${style}`}
    >
      {status}
    </span>
  );
}

function getDisplayStatus(category: Category) {
  return category.previousStatus ?? category.status;
}

export const pausedCategoryColumns: ColumnDef<Category>[] = [
  {
    id: "categoryId",
    header: "Category ID",
    accessorFn: (row) => row.categoryId || row.id,
    meta: { cellClassName: "text-white font-medium" },
  },
  {
    accessorKey: "name",
    header: "Category Name",
    meta: { cellClassName: "text-white" },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={getDisplayStatus(row.original)} />
    ),
  },
  {
    accessorKey: "subCategory",
    header: "No. of Sub Category",
    meta: { cellClassName: "text-white" },
  },
  {
    accessorKey: "services",
    header: "No.Of Services",
    meta: { cellClassName: "text-white" },
  },
  {
    accessorKey: "experts",
    header: "No.Of Experts",
    meta: { cellClassName: "text-white" },
  },
  {
    accessorKey: "revenue",
    header: "Revenue Generated",
    meta: { cellClassName: "text-white font-medium" },
  },
  {
    id: "actions",
    header: "Actions",
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <CategoryTableActions category={row.original} />,
  },
];

export type { Category as PausedCategory };
