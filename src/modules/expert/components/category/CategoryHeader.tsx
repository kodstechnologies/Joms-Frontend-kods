import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

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
        onClick={() => {
          if (backPath) {
            navigateBackOrFallback(navigate, backPath)
            return
          }
          navigate(-1)
        }}
        className="group font-heading text-h3 hover:text-brand-accent text-brand-text flex w-fit items-center gap-2 tracking-tight transition-colors"
      >
        <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
        <span>{title}</span>
      </button>

      <p className="text-body-sm-medium text-muted pl-7">
        Category Management
        {breadcrumbItems && breadcrumbItems.length > 0
          ? breadcrumbItems.map((item, index) => (
              <span key={item}>
                <span className="text-muted/50 mx-1">/</span>
                <span
                  className={
                    index === breadcrumbItems.length - 1 ? 'text-brand-text' : 'text-muted'
                  }
                >
                  {item}
                </span>
              </span>
            ))
          : breadcrumb && (
              <>
                <span className="text-muted/50 mx-1">/</span>
                <span className="text-brand-text">{breadcrumb}</span>
              </>
            )}
      </p>
    </header>
  )
}

export default CategoryHeader
