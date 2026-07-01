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
import type { Category } from "./category-table-columns";
import { useCategoryStore } from "../store/category-store";

interface Props {
  category: Category;
}

export function CategoryActionsDropdown({
  category,
}: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pauseCategory = useCategoryStore(
    (state) => state.pauseCategory
  );

  return (
    <TableActionsDropdown
      label="Category Actions"
      isOpen={open}
      onOpenChange={setOpen}
    >
      <TableActionsItem
        onClick={() => {
          setOpen(false);
        }}
        icon={<Plus className="size-4" />}
      >
        Add Sub Category
      </TableActionsItem>

      <TableActionsItem
        onClick={() => {
          navigate(`/categories/management/rename/${category.id}`);
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
        onClick={() => setOpen(false)}
        icon={<Trash2 className="size-4 text-red-500" />}
      >
        <span className="text-red-500">
          Remove Category
        </span>
      </TableActionsItem>
    </TableActionsDropdown>
  );
}