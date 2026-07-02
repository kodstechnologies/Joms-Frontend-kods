import { useState } from "react";
import {
  Eye,
  RotateCcw,
} from "lucide-react";

import {
  TableActionsDropdown,
  TableActionsItem,
} from "@/shared/components/table/table-actions-dropdown";

import { useVenueCategoryStore } from "../../store/venue-category-store";
import type { DeletedVenueCategory } from "./DeletedVenueCategoryColumns";

interface Props {
  category: DeletedVenueCategory;
}

const DeletedVenueCategoryActions = ({
  category,
}: Props) => {
  const [open, setOpen] = useState(false);

  const revokeCategory = useVenueCategoryStore(
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
          console.log("View", category.id);
          setOpen(false);
        }}
      >
        View Category
      </TableActionsItem>

      <TableActionsItem
        icon={<RotateCcw size={14} />}
        onClick={() => {
          revokeCategory(category.id);
          setOpen(false);
        }}
      >
        Revoke Category
      </TableActionsItem>

      
    </TableActionsDropdown>
  );
};

export default DeletedVenueCategoryActions;