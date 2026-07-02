import { useState } from "react";
import {
  Eye,
  Pause,
  Trash2,
} from "lucide-react";

import {
  TableActionsDropdown,
  TableActionsItem,
} from "@/shared/components/table/table-actions-dropdown";

import { useNavigate,useParams } from "react-router-dom"; 

interface Props {
  id: string;
}

const CategoryViewSubCategoryActions = ({
  id: subCategoryId,
}: Props) => {
  const [open, setOpen] = useState(false);
const navigate = useNavigate();
const { id: categoryId } = useParams();
  return (
    <TableActionsDropdown
      label="Sub Category Actions"
      isOpen={open}
      onOpenChange={setOpen}
    >
      <TableActionsItem
  icon={<Eye size={14} />}
  onClick={() => {
    navigate(
  `/venues/categories/management/${categoryId}/subcategory/${subCategoryId}`
);
    setOpen(false);
  }}
>
  View Details
</TableActionsItem>

      <TableActionsItem
        icon={<Pause size={14} />}
        onClick={() => {
          console.log("Pause", subCategoryId);
          setOpen(false);
        }}
      >
        Pause Sub-Category
      </TableActionsItem>

      <TableActionsItem
        icon={<Trash2 size={14} />}
        className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
        onClick={() => {
          console.log("Delete", subCategoryId);
          setOpen(false);
        }}
      >
        Delete
      </TableActionsItem>
    </TableActionsDropdown>
  );
};

export default CategoryViewSubCategoryActions;