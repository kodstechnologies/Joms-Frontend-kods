import type { ColumnDef } from "@tanstack/react-table";
import ViewCategoryButton from "./ViewCategoryButton";
//import type { Category } from "../../type/category";
import { CategoryActionsDropdown } from "./category-actions-dropdown";

export type CategoryTableRow = {
  _id: string;
  categoryId: string;
  name: string;
  description: string;

  icon3D: string | null;
  image: string | null;

  status: "ACTIVE" | "PAUSED" | "DELETED";

  services: number;
  experts: number;
  revenue: string;

  createdAt: string;
  updatedAt: string;

  createdBy: string;
  adminNotes: string;

  subCategories: {
    _id: string;
    name: string;
    description: string;
    vectorIcon: string;
    status: "ACTIVE" | "PAUSED" | "DELETED";

    services: number;
    experts: number;

    createdBy: string;
    adminNotes: string;
    addedOn: string;
    updatedAt: string;
  }[];
};
const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    ACTIVE: "bg-green-900/40 text-green-400",
    PAUSED: "bg-yellow-900/40 text-yellow-400",
    DELETED: "bg-red-900/40 text-red-400",
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

export const categoryColumns: ColumnDef<CategoryTableRow>[] = [
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
    id: "subCategories",
    header: "No. Of Sub Categories",
    cell: ({ row }) => row.original.subCategories.length,
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
  cell: ({ row }) => (
    <ViewCategoryButton
      id={row.original._id}
    />
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