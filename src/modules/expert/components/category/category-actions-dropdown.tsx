import { useState } from "react";
import {
  TableActionsDropdown,
  TableActionsItem,
} from "@/shared/components/table/table-actions-dropdown";

import { Pencil, Pause, PlusSquare, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Category } from "./category-table-columns";
import { useCategoryStore } from "../../store/category-store";

interface Props {
  category: Category;
}

export function CategoryActionsDropdown({ category }: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pauseCategory = useCategoryStore((state) => state.pauseCategory);
  const removeCategory = useCategoryStore((state) => state.removeCategory);

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
        onClick={() => {
          navigate(`/categories/management/create-subcategory/${category.id}`);
          setOpen(false);
        }}
        icon={<PlusSquare className="size-4 text-slate-700" />}
      >
        Add Sub Category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        onClick={() => {
          navigate(`/categories/management/rename/${category.id}`);
          setOpen(false);
        }}
        icon={<Pencil className="size-4 text-slate-700" />}
      >
        Rename Category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        onClick={() => {
          pauseCategory(category.id);
          setOpen(false);
        }}
        icon={<Pause className="size-4 text-slate-700" />}
      >
        Pause Service
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        onClick={() => {
          removeCategory(category.id);
          setOpen(false);
        }}
        icon={<X className="size-4 text-red-500" />}
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
      >
        <span className="text-red-500">Remove Category</span>
      </TableActionsItem>
    </TableActionsDropdown>
  );
}
