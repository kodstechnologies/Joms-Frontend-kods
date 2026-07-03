import { useState } from "react";
import { Eye, Pause, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  TableActionsDropdown,
  TableActionsItem,
} from "@/shared/components/table/table-actions-dropdown";

interface Props {
  id: string;
}

const CategoryViewSubCategoryActions = ({ id: subCategoryId }: Props) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { id: categoryId } = useParams();

  return (
    <TableActionsDropdown
      label="Sub Category Actions"
      isOpen={open}
      onOpenChange={setOpen}
      tone="light"
      menuWidth={200}
    >
      <TableActionsItem
        tone="light"
        icon={<Eye className="size-4 text-slate-700" />}
        onClick={() => {
          navigate(
            `/categories/management/${categoryId}/subcategory/${subCategoryId}`,
          );
          setOpen(false);
        }}
      >
        View Details
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        icon={<Pause className="size-4 text-slate-700" />}
        onClick={() => {
          setOpen(false);
        }}
      >
        Pause sub-category
      </TableActionsItem>

      <TableActionsItem
        tone="light"
        icon={<Trash2 className="size-4 text-red-500" />}
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => {
          setOpen(false);
        }}
      >
        <span className="text-red-500">Delete</span>
      </TableActionsItem>
    </TableActionsDropdown>
  );
};

export default CategoryViewSubCategoryActions;
