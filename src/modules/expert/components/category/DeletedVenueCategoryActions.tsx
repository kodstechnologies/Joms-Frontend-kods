import { useState } from "react";
import { Eye, RotateCcw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  TableActionsDropdown,
  TableActionsItem,
} from "@/shared/components/table/table-actions-dropdown";

import { useVenueCategoryStore } from "../../store/venue-category-store";
import type { VenueCategory } from "./venue-category-table-columns";

interface Props {
  category: VenueCategory;
}

const DeletedVenueCategoryActions = ({ category }: Props) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const revokeCategory = useVenueCategoryStore((state) => state.revokeCategory);
  const removeCategory = useVenueCategoryStore((state) => state.removeCategory);

  return (
    <TableActionsDropdown
      label="Category Actions"
      isOpen={open}
      onOpenChange={setOpen}
      tone="light"
      menuWidth={210}
    >
      <TableActionsItem
        tone="light"
        icon={<Eye className="size-4 text-slate-700" />}
        onClick={() => {
          navigate(`/venues/categories/management/view/${category.id}`);
          setOpen(false);
        }}
      >
        View Category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        icon={<RotateCcw className="size-4 text-slate-700" />}
        onClick={() => {
          revokeCategory(category.id);
          setOpen(false);
        }}
      >
        Revoke Category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        icon={<Trash2 className="size-4 text-red-500" />}
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => {
          removeCategory(category.id);
          setOpen(false);
        }}
      >
        <span className="text-red-500">Delete Category</span>
      </TableActionsItem>
    </TableActionsDropdown>
  );
};

export default DeletedVenueCategoryActions;
