import type { ColumnDef } from "@tanstack/react-table";

import VenueCategoryTableActions from "./VenueCategoryTableActions";
import { categoryManagementTheme } from "./category-management.theme";
import type { VenueCategory } from "./venue-category-table-columns";

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

function getDisplayStatus(category: VenueCategory) {
  return category.previousStatus ?? category.status;
}

export const pausedVenueCategoryColumns: ColumnDef<VenueCategory>[] = [
  {
    accessorKey: "id",
    header: "Category ID",
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
    accessorKey: "venues",
    header: "No.Of Venues",
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
    cell: ({ row }) => (
      <VenueCategoryTableActions category={row.original} />
    ),
  },
];

export type { VenueCategory as PausedVenueCategory };
