import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  PageBreadcrumb,
  type PageBreadcrumbItem,
} from '@/shared/components/navigation/page-breadcrumb'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

interface CategoryHeaderProps {
  title: string
  breadcrumb?: string
  breadcrumbItems?: string[]
  items?: PageBreadcrumbItem[]
  backPath?: string
  listPath?: string
}

const CategoryHeader = ({
  title,
  breadcrumb,
  breadcrumbItems,
  items,
  backPath,
  listPath,
}: CategoryHeaderProps) => {
  const navigate = useNavigate()
  const categoryListPath = listPath || backPath
  const crumbs: PageBreadcrumbItem[] = items
    ? items
    : [
        { label: 'Category Management', to: categoryListPath },
        ...(breadcrumbItems && breadcrumbItems.length > 0
          ? breadcrumbItems.map((item, index) => ({
              label: item,
              isActive: index === breadcrumbItems.length - 1,
            }))
          : breadcrumb
            ? [{ label: breadcrumb, isActive: true }]
            : []),
      ]

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

      <div className="pl-7">
        <PageBreadcrumb items={crumbs} />
      </div>
    </header>
  )
}

export default CategoryHeader
