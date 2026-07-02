import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "../../type/category";
import DeletedCategoryActions from "./DeletedCategoryActions";

// export interface DeletedCategory {
//   id: string;
//   name: string;
//   status: string;
//   subCategory: number;
//   services: number;
//   experts: number;
//   revenue: string;
// }

const StatusBadge = ({
  status,
}: {
  status: string;
}) => {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-500/20 text-green-400",
    PAUSED: "bg-yellow-500/20 text-yellow-400",
    DELETED: "bg-red-500/20 text-red-400",
    
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        styles[status] ?? "bg-slate-500/20 text-slate-300"
      }`}
    >
      {status}
    </span>
  );
};

export const deletedCategoryColumns: ColumnDef<Category>[] = [
  {
     accessorKey: "categoryId",
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
    id: "actions",
    header: "Actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <DeletedCategoryActions
        category={row.original}
      />
    ),
  },
];