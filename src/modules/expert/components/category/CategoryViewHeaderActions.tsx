import {
  Eye,
  Pencil,
  Pause,
  Plus,
  Trash2,
} from "lucide-react";
import { useCategoryStore } from "../../store/category-store";
import { Button } from "@/shared/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
export const CategoryViewHeaderActions = () => {

  const navigate = useNavigate();
  const { id } = useParams();
  const pauseCategory = useCategoryStore(
    (state) => state.pauseCategory
  );
  return (
    <div className="mb-6 flex justify-end gap-3">
      <Button
        onClick={() =>
          navigate(`/categories/management/create-subcategory/${id}`)
        }
      >
        <Plus size={16} />
        Add Sub-Category
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          navigate(`/services/management`)
        }
      >
        <Eye size={16} />
        View Services
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          navigate(`/categories/management/rename/${id}`)
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
          navigate("/categories/management/deleted")
        }
      >
        <Trash2 size={16} />
        Delete
      </Button>
    </div>
  );
};