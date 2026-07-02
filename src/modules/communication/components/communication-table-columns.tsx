import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  TableActionsDropdown,
  TableActionsItem,
} from "@/shared/components/table/table-actions-dropdown";

import type { Communication } from "../mock/communication-data";

function CommunicationActions() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center">
      <TableActionsDropdown
        label="Communication Actions"
        isOpen={open}
        onOpenChange={setOpen}
      >
        <TableActionsItem
          icon={<Eye className="size-4" />}
          onClick={() => {
            setOpen(false);
            navigate("/communication/view");
          }}
        >
          View Details
        </TableActionsItem>

        <TableActionsItem
          icon={<Pencil className="size-4" />}
          onClick={() => {
            setOpen(false);
            navigate("/communication/create");
          }}
        >
          Edit
        </TableActionsItem>

        <TableActionsItem
          icon={<Trash2 className="size-4" />}
          onClick={() => {
            setOpen(false);
          }}
        >
          Delete
        </TableActionsItem>
      </TableActionsDropdown>
    </div>
  );
}
export const communicationColumns: ColumnDef<Communication>[] = [
  {
    accessorKey: "id",
    header: "Message ID",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "channel",
    header: "Channel",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "audience",
    header: "Audience",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      const statusStyles: Record<string, string> = {
        Sent: "bg-emerald-500/15 text-emerald-400",
        Scheduled: "bg-amber-500/15 text-amber-400",
        Active: "bg-emerald-500/15 text-emerald-400",
        Draft: "bg-slate-500/15 text-slate-300",
        Failed: "bg-red-500/15 text-red-400",
      };

      return (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            statusStyles[status] ??
            "bg-slate-500/15 text-slate-300"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
  },
  {
    accessorKey: "createdAt",
    header: "Created On",
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: () => <CommunicationActions />,
  },
];