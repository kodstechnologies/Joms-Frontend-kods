import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CategoryHeaderProps {
  title: string;
  breadcrumb: string;
}

const CategoryHeader = ({
  title,
  breadcrumb,
}: CategoryHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-2 flex items-center gap-2 text-white hover:opacity-80"
      >
        <ArrowLeft size={18} />
        <span className="text-[18px] font-semibold">
          {title}
        </span>
      </button>

      <p className="text-xs text-[#8B8B8B]">
        Category Management
        <span className="mx-1 text-[#5E5E5E]">/</span>
        <span className="text-white">{breadcrumb}</span>
      </p>
    </div>
  );
};

export default CategoryHeader;