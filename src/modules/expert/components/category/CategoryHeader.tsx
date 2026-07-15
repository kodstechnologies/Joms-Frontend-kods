import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface CategoryHeaderProps {
  title: string
  breadcrumb?: string
  breadcrumbItems?: string[]
  backPath?: string
}

const CategoryHeader = ({ title, breadcrumb, breadcrumbItems, backPath }: CategoryHeaderProps) => {
  const navigate = useNavigate()

  return (
    <header className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => (backPath ? navigate(backPath) : navigate(-1))}
        className="group font-heading hover:text-brand-accent flex w-fit items-center gap-2 text-[20px] font-bold tracking-tight text-white transition-colors"
      >
        <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
        <span>{title}</span>
      </button>

      <p className="pl-7 text-[12px] font-medium text-[#777777]">
        Category Management
        {breadcrumbItems && breadcrumbItems.length > 0
          ? breadcrumbItems.map((item, index) => (
              <span key={item}>
                <span className="mx-1 text-[#666666]">/</span>
                <span
                  className={index === breadcrumbItems.length - 1 ? 'text-white' : 'text-[#888888]'}
                >
                  {item}
                </span>
              </span>
            ))
          : breadcrumb && (
              <>
                <span className="mx-1 text-[#666666]">/</span>
                <span className="text-white">{breadcrumb}</span>
              </>
            )}
      </p>
    </header>
  )
}

export default CategoryHeader
