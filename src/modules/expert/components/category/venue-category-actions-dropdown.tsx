import { useState } from "react";
import {
  TableActionsDropdown,
  TableActionsItem,
} from "@/shared/components/table/table-actions-dropdown";

import {
  Pencil,
  Pause,
  Trash2,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { VenueCategory } from "./venue-category-table-columns";
import { useVenueCategoryStore } from "../../store/venue-category-store";

interface Props {
  category: VenueCategory;
}

export function VenueCategoryActionsDropdown({
  category,
}: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pauseCategory = useVenueCategoryStore(
    (state) => state.pauseCategory
  );
  const removeCategory = useVenueCategoryStore(
    (state) => state.removeCategory
  );

  return (
    <TableActionsDropdown
      label="Category Actions"
      isOpen={open}
      onOpenChange={setOpen}
    >
      <TableActionsItem
        onClick={() => {
          navigate(
            `/venues/categories/management/create-subcategory/${category.id}`
          );
          setOpen(false);
        }}
        icon={<Plus className="size-4" />}
      >
        Add Sub Category
      </TableActionsItem>

      <TableActionsItem
        onClick={() => {
          navigate(`/venues/categories/management/rename/${category.id}`);
          setOpen(false)
        }

        }
        icon={<Pencil className="size-4" />}
      >
        Rename Category
      </TableActionsItem>

      <TableActionsItem
        onClick={() => {
          setOpen(false)
          pauseCategory(category.id);

        }}
        icon={<Pause className="size-4" />}
      >
        Pause Category
      </TableActionsItem>

      <TableActionsItem
        onClick={() => {
          removeCategory(category.id);
          setOpen(false);
        }}
        icon={<Trash2 className="size-4 text-red-500" />}
      >
        <span className="text-red-500">
          Remove Category
        </span>
      </TableActionsItem>
    </TableActionsDropdown>
  );
}