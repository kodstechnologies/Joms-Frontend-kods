import { useState } from "react";
import {
  Eye,
  RotateCcw,
} from "lucide-react";

import {
  TableActionsDropdown,
  TableActionsItem,
} from "@/shared/components/table/table-actions-dropdown";

import { useCategoryStore } from "../../store/category-store";
import type { Category } from "../../type/category";

interface Props {
  category: Category;
}

const DeletedCategoryActions = ({
  category,
}: Props) => {
  const [open, setOpen] = useState(false);

  const revokeCategory = useCategoryStore(
    (state) => state.revokeCategory
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
          console.log("View", category._id);
          setOpen(false);
        }}
      >
        View Category
      </TableActionsItem>

      <TableActionsItem
        icon={<RotateCcw size={14} />}
        onClick={() => {
          revokeCategory(category._id);
          setOpen(false);
        }}
      >
        Revoke Category
      </TableActionsItem>

      
    </TableActionsDropdown>
  );
};

export default DeletedCategoryActions;