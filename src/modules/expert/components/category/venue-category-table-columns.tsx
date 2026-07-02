import type { ColumnDef } from "@tanstack/react-table";
import VenueViewCategoryButton from "./venue-view-category-button";
import { VenueCategoryActionsDropdown } from "./venue-category-actions-dropdown";


export type VenueCategory = {
  id: string;

  name: string;

  description: string;

  icon?: string;

  image?: string;

  status: string;

  previousStatus?: string;

  subCategory: number;

  venues: number;

  revenue: string;

  createdAt: string;

  updatedAt: string;

  createdBy: string;

  adminNotes: string;

  subCategories: {
    id: string;

    name: string;

    status: "Active" | "Paused";

    description: string;

    adminNotes: string;

    icon?: string;

    addedOn: string;

    createdBy: string;

    updatedAt: string;

    venues: number;
  }[];
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

export const venueCategoryColumns: ColumnDef<VenueCategory>[] = [
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
    accessorKey: "venues",
    header: "No. Of Venues",
  },
  {
    accessorKey: "revenue",
    header: "Revenue Generated",
  },
  {
    id: "view",
    header: "",
    cell: ({ row }) => (
      <VenueViewCategoryButton id={row.original.id} />
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <VenueCategoryActionsDropdown
        category={row.original as any}
      />
    ),
  },
];