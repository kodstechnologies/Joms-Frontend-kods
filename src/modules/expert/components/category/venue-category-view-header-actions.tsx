import { useState } from "react";
import { Eye, Pencil, Pause, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";

import { useVenueCategoryStore } from "../../store/venue-category-store";
import { categoryViewTheme } from "./category-view.theme";
import { DeleteCategoryModal } from "./delete-category-modal";
import { PauseCategoryModal } from "./pause-category-modal";

export const VenueCategoryViewHeaderActions = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const pauseCategory = useVenueCategoryStore((state) => state.pauseCategory);
  const removeCategory = useVenueCategoryStore((state) => state.removeCategory);

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          className={categoryViewTheme.accentButtonClass}
          onClick={() =>
            navigate(`/venues/categories/management/create-subcategory/${id}`)
          }
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Sub-Category
        </Button>

        <Button
          variant="secondary"
          className={categoryViewTheme.outlineButtonClass}
          onClick={() => navigate("/venues/management")}
        >
          <Eye className="size-4" aria-hidden="true" />
          View Venues
        </Button>

        <Button
          variant="secondary"
          className={categoryViewTheme.outlineButtonClass}
          onClick={() =>
            navigate(`/venues/categories/management/rename/${id}`)
          }
        >
          <Pencil className="size-4" aria-hidden="true" />
          Edit Category
        </Button>

        <Button
          variant="secondary"
          className={categoryViewTheme.outlineButtonClass}
          onClick={() => setPauseModalOpen(true)}
        >
          <Pause className="size-4" aria-hidden="true" />
          Pause
        </Button>

        <Button
          className={categoryViewTheme.deleteButtonClass}
          onClick={() => setDeleteModalOpen(true)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>

      <PauseCategoryModal
        open={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        onConfirm={() => {
          if (id) {
            pauseCategory(id);
          }
          setPauseModalOpen(false);
          navigate("/venues/categories/management/paused");
        }}
      />

      <DeleteCategoryModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (id) {
            removeCategory(id);
          }
          setDeleteModalOpen(false);
          navigate("/venues/categories/management/deleted");
        }}
      />
    </>
  );
};
