import { useState } from "react";
import {
  Eye,
  Play,
  Trash2,
  X,
} from "lucide-react";

import {
  TableActionsDropdown,
  TableActionsItem,
} from "@/shared/components/table/table-actions-dropdown";

import { useCategoryStore } from "../../store/category-store";
import type { PausedCategory } from "./PausedCategoryColumns";

interface Props {
  category: PausedCategory;
}

const CategoryTableActions = ({
  category,
}: Props) => {
  const [open, setOpen] = useState(false);

  const resumeCategory = useCategoryStore(
    (state) => state.resumeCategory
  );

  return (
    <TableActionsDropdown
      label="Category Actions"
      isOpen={open}
      onOpenChange={setOpen}
    >
      <TableActionsItem
        icon={<Eye size={14} />}
        onClick={() => {
          console.log("View", category.id);
          setOpen(false);
        }}
      >
        View Category
      </TableActionsItem>

      <TableActionsItem
        icon={<Play size={14} />}
        onClick={() => {
          resumeCategory(category.id);
          setOpen(false);
        }}
      >
        Resume Category
      </TableActionsItem>

      <TableActionsItem
        icon={<X size={14} />}
        onClick={() => {
          console.log("Remove", category.id);
          setOpen(false);
        }}
      >
        Remove Category
      </TableActionsItem>

      <TableActionsItem
        icon={<Trash2 size={14} />}
        className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
        onClick={() => {
          console.log("Delete", category.id);
          setOpen(false);
        }}
      >
        Delete Category
      </TableActionsItem>
    </TableActionsDropdown>
  );
};

export default CategoryTableActions;