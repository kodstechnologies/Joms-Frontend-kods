import { Eye, Pencil, Pause, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

export const SubCategoryViewHeaderActions = () => {

    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="mb-6 flex justify-end gap-3">
            <Button
                variant="secondary"
                onClick={() =>
                    navigate(`/categories/management/view/${id}`)
                }
            >
                <Eye size={16} />
                View Services
            </Button>

            <Button variant="secondary">
                <Pencil size={16} />
                Edit Sub-Category
            </Button>

            <Button variant="secondary">
                <Pause size={16} />
                Pause
            </Button>

            <Button className="bg-[#EF4444] hover:bg-[#DC2626] text-white">
                <Trash2 size={16} />
                Delete
            </Button>
        </div>
    );
};