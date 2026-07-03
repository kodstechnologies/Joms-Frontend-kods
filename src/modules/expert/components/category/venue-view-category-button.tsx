import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  id: string;
}

const VenueViewCategoryButton = ({ id }: Props) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      aria-label="View category"
      onClick={() => navigate(`/venues/categories/management/view/${id}`)}
      className="grid size-8 place-items-center rounded-lg text-[#888888] transition-colors hover:bg-white/5 hover:text-[#FFC16B]"
    >
      <Eye className="size-4" />
    </button>
  );
};

export default VenueViewCategoryButton;
