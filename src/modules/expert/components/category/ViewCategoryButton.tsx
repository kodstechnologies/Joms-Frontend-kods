import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  categoryPath,
  useCategoryManagementScope,
} from "./category-management-scope";

interface Props {
  id: string;
}

const ViewCategoryButton = ({ id }: Props) => {
  const navigate = useNavigate();
  const scope = useCategoryManagementScope();

  return (
    <button
      type="button"
      aria-label="View category"
      onClick={() => navigate(categoryPath(scope, `view/${id}`))}
      className="grid size-8 place-items-center rounded-lg text-[#888888] transition-colors hover:bg-white/5 hover:text-[#FFC16B]"
    >
      <Eye className="size-4" />
    </button>
  );
};

export default ViewCategoryButton;
