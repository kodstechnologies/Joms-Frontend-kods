import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  id: string;
}

const VenueViewCategoryButton = ({ id }: Props) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() =>
        navigate(`/venues/categories/management/view/${id}`)
      }
    >
      <Eye className="size-4 text-white hover:text-[#F5C16C]" />
    </button>
  );
};

export default VenueViewCategoryButton;