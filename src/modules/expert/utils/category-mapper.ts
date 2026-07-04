import type { Category } from '../components/category/category-table-columns'
import type { VenueCategory } from '../components/category/venue-category-table-columns'
import type {
  CategoryApiSubCategory,
  ServiceCategoryApi,
  VenueCategoryApi,
} from '../type/category'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB')
}

const mapServiceStatus = (status?: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Accepted'
    case 'PAUSED':
      return 'Paused'
    case 'DELETED':
      return 'Deleted'
    default:
      return status || 'Accepted'
  }
}

const mapSubStatus = (
  sub: CategoryApiSubCategory,
  kind: 'service' | 'venue',
): 'Active' | 'Paused' => {
  if (kind === 'venue') {
    return sub.isPaused ? 'Paused' : 'Active'
  }
  return sub.status === 'PAUSED' ? 'Paused' : 'Active'
}

const toCategoryId = (category: { _id: string; categoryId?: string }) =>
  category.categoryId || `CAT${category._id.toString().slice(-3).toUpperCase()}`

const toSubCategoryId = (subId: string) =>
  `SUB${subId.toString().slice(-3).toUpperCase()}`

const mapServiceSubCategory = (
  sub: CategoryApiSubCategory,
): Category['subCategories'][number] => ({
  id: sub._id,
  subCategoryId: toSubCategoryId(sub._id),
  name: sub.name,
  status: mapSubStatus(sub, 'service'),
  description: sub.description || '',
  adminNotes: '',
  icon: sub.vectorIcon || undefined,
  addedOn: formatDate(sub.createdAt),
  createdBy: 'Admin',
  updatedAt: formatDate(sub.updatedAt),
  services: 0,
  experts: 0,
})

const mapVenueSubCategory = (
  sub: CategoryApiSubCategory,
): VenueCategory['subCategories'][number] => ({
  id: sub._id,
  subCategoryId: toSubCategoryId(sub._id),
  name: sub.name,
  status: mapSubStatus(sub, 'venue'),
  description: sub.description || '',
  adminNotes: '',
  icon: sub.vectorIcon || undefined,
  addedOn: formatDate(sub.createdAt),
  createdBy: 'Admin',
  updatedAt: formatDate(sub.updatedAt),
  venues: 0,
})

export const mapServiceCategoryToUi = (category: ServiceCategoryApi): Category => {
  const activeSubs = (category.subCategories || []).filter(
    (sub) => sub.status !== 'DELETED',
  )

  return {
    id: category._id,
    categoryId: toCategoryId(category),
    name: category.name,
    description: category.description || '',
    icon: category.icon3D || undefined,
    image: category.image || undefined,
    status: mapServiceStatus(category.status),
    subCategory: activeSubs.length,
    services: 0,
    experts: 0,
    revenue: '₹0',
    createdAt: formatDate(category.createdAt),
    updatedAt: formatDate(category.updatedAt),
    createdBy: 'Admin',
    adminNotes: '',
    subCategories: activeSubs.map(mapServiceSubCategory),
  }
}

export const mapVenueCategoryToUi = (category: VenueCategoryApi): VenueCategory => {
  const status = category.isDeleted
    ? 'Deleted'
    : category.isPaused
      ? 'Paused'
      : 'Accepted'

  const activeSubs = (category.subCategories || []).filter((sub) => !sub.isDeleted)

  return {
    id: category._id,
    categoryId: toCategoryId(category),
    name: category.name,
    description: category.description || '',
    icon: category.icon || undefined,
    image: category.image || undefined,
    status,
    subCategory: activeSubs.length,
    venues: 0,
    revenue: '₹0',
    createdAt: formatDate(category.createdAt),
    updatedAt: formatDate(category.updatedAt),
    createdBy: 'Admin',
    adminNotes: '',
    subCategories: activeSubs.map(mapVenueSubCategory),
  }
}

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
