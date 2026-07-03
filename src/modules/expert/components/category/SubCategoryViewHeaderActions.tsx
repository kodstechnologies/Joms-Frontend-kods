import { Eye, Pencil, Pause, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";

import { categoryViewTheme } from "./category-view.theme";

export const SubCategoryViewHeaderActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Button
        variant="secondary"
        className={categoryViewTheme.outlineButtonClass}
        onClick={() => navigate("/services/management")}
      >
        <Eye className="size-4" aria-hidden="true" />
        View Services
      </Button>

      <Button variant="secondary" className={categoryViewTheme.outlineButtonClass}>
        <Pencil className="size-4" aria-hidden="true" />
        Edit Sub-Category
      </Button>

      <Button variant="secondary" className={categoryViewTheme.outlineButtonClass}>
        <Pause className="size-4" aria-hidden="true" />
        Pause
      </Button>

      <Button className={categoryViewTheme.deleteButtonClass}>
        <Trash2 className="size-4" aria-hidden="true" />
        Delete
      </Button>
    </div>
  );
};
