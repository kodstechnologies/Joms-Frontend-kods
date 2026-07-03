import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CategoryHeaderProps {
  title: string;
  breadcrumb?: string;
  breadcrumbItems?: string[];
}

const CategoryHeader = ({
  title,
  breadcrumb,
  breadcrumbItems,
}: CategoryHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-2 flex items-center gap-2 text-white transition-opacity hover:opacity-80"
      >
        <ArrowLeft className="size-[18px]" aria-hidden="true" />
        <span className="text-[20px] font-bold">{title}</span>
      </button>

      <p className="text-[12px] text-[#888888]">
        Category Management
        {breadcrumbItems && breadcrumbItems.length > 0 ? (
          breadcrumbItems.map((item, index) => (
            <span key={item}>
              <span className="mx-1 text-[#666666]">/</span>
              <span
                className={
                  index === breadcrumbItems.length - 1
                    ? "text-white"
                    : "text-[#888888]"
                }
              >
                {item}
              </span>
            </span>
          ))
        ) : (
          <>
            <span className="mx-1 text-[#666666]">/</span>
            <span className="text-white">{breadcrumb}</span>
          </>
        )}
      </p>
    </div>
  );
};

export default CategoryHeader;
