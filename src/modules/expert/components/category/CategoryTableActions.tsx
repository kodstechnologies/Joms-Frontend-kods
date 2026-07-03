import { useState } from "react";
import { Eye, Play, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  TableActionsDropdown,
  TableActionsItem,
} from "@/shared/components/table/table-actions-dropdown";

import {
  categoryPath,
  useCategoryManagementScope,
} from "./category-management-scope";
import type { Category } from "./category-table-columns";

interface Props {
  category: Category;
}

const CategoryTableActions = ({ category }: Props) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const scope = useCategoryManagementScope();

  const resumeCategory = scope.useStore((state) => state.resumeCategory);
  const removeCategory = scope.useStore((state) => state.removeCategory);

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
          navigate(categoryPath(scope, `view/${category.id}`));
          setOpen(false);
        }}
      >
        View Category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        icon={<Play className="size-4 text-slate-700" />}
        onClick={() => {
          resumeCategory(category.id);
          setOpen(false);
        }}
      >
        Resume Category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        icon={<X className="size-4 text-slate-700" />}
        onClick={() => {
          removeCategory(category.id);
          setOpen(false);
        }}
      >
        Remove Category
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

export default CategoryTableActions;
