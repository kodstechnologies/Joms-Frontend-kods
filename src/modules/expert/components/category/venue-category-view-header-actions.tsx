import {
  Eye,
  Pencil,
  Pause,
  Plus,
  Trash2,
} from "lucide-react";
import { useVenueCategoryStore } from "../../store/venue-category-store";
import { Button } from "@/shared/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
export const VenueCategoryViewHeaderActions = () => {

  const navigate = useNavigate();
  const { id } = useParams();
  const pauseCategory = useVenueCategoryStore(
    (state) => state.pauseCategory
  );
  return (
    <div className="mb-6 flex justify-end gap-3">
      <Button
        onClick={() =>
          navigate(`/venues/categories/management/create-subcategory/${id}`)
        }
      >
        <Plus size={16} />
        Add Sub-Category
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          navigate(`/venues/management`)
        }
      >
        <Eye size={16} />
        View Venues
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          navigate(`/venues/categories/management/rename/${id}`)
        }
      >
        <Pencil size={16} />
        Edit Category
      </Button>

      <Button
        variant="secondary"
        onClick={() => {
          if (id) {
            pauseCategory(id);
          }
        }}
      >
        <Pause size={16} />
        Pause
      </Button>

      <Button
        className="bg-[#EF4444] text-white hover:bg-[#DC2626]"
        onClick={() =>
          navigate("/venues/categories/management/deleted")
        }
      >
        <Trash2 size={16} />
        Delete
      </Button>
    </div>
  );
};