import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { CategoryActionsDropdown } from "./category-actions-dropdown";

export type Category = {
  id: string;
  name: string;
  status: string;
  previousStatus?: string;
  subCategory: number;
  services: number;
  experts: number;
  revenue: string;
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Accepted: "bg-green-900/40 text-green-400",
    Pending: "bg-yellow-900/40 text-yellow-400",
    Deleted: "bg-red-900/40 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
        styles[status as keyof typeof styles]
      }`}
    >
      {status}
    </span>
  );
};

export const categoryColumns: ColumnDef<Category>[] = [
  {
    accessorKey: "id",
    header: "Category ID",
  },
  {
    accessorKey: "name",
    header: "Category Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.original.status} />
    ),
  },
  {
    accessorKey: "subCategory",
    header: "No. Of Sub Category",
  },
  {
    accessorKey: "services",
    header: "No.Of Services",
  },
  {
    accessorKey: "experts",
    header: "No.Of Experts",
  },
  {
    accessorKey: "revenue",
    header: "Revenue Generated",
  },
  {
    id: "view",
    header: "",
    cell: () => (
      <button>
        <Eye className="size-4 text-white" />
      </button>
    ),
  },
  {
  id: "actions",
  header: "Actions",
  cell: ({ row }) => (
    <CategoryActionsDropdown
      category={row.original}
    />
  ),
},
];