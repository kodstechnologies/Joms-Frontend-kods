import type { ColumnDef } from "@tanstack/react-table";

import ViewCategoryButton from "./ViewCategoryButton";
import { CategoryActionsDropdown } from "./category-actions-dropdown";
import { categoryManagementTheme } from "./category-management.theme";

export type Category = {
  id: string;
  categoryId?: string;
  name: string;
  description: string;
  icon?: string;
  image?: string;
  status: string;
  previousStatus?: string;
  subCategory: number;
  services: number;
  experts: number;
  revenue: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  adminNotes: string;
  subCategories: {
    id: string;
    subCategoryId?: string;
    name: string;
    status: "Active" | "Paused";
    description: string;
    adminNotes: string;
    icon?: string;
    addedOn: string;
    createdBy: string;
    updatedAt: string;
    services: number;
    experts: number;
  }[];
};

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

export const categoryColumns: ColumnDef<Category>[] = [
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
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <ViewCategoryButton id={row.original.id} />
        <CategoryActionsDropdown category={row.original} />
      </div>
    ),
  },
];
