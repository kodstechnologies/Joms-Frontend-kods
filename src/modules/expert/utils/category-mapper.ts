import type { Category } from '../components/category/category-table-columns'
import type { VenueCategory } from '../components/category/venue-category-table-columns'
import type { CategoryApiSubCategory, ServiceCategoryApi, VenueCategoryApi } from '../type/category'
import { getApiErrorMessage } from '@/shared/lib/api-error'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB')
}

// An active service category is shown as accepted. A status the panel does not know is also shown as accepted.
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

// A venue sub-category uses the paused flag. A service sub-category uses the status text.
const mapSubStatus = (
  sub: CategoryApiSubCategory,
  kind: 'service' | 'venue',
): 'Active' | 'Paused' => {
  if (kind === 'venue') {
    return sub.isPaused ? 'Paused' : 'Active'
  }
  return sub.status === 'PAUSED' ? 'Paused' : 'Active'
}

// The stored id is preferred over the display id, so pause and edit hit the real record.
const resolveDocId = (doc: { _id?: string; id?: string }) => String(doc._id ?? doc.id ?? '')

// Uses the code already on the record. Otherwise the last three characters of the id are shown as the category code.
const toCategoryId = (category: { _id?: string; id?: string; categoryId?: string }) => {
  const docId = resolveDocId(category)
  return category.categoryId || `CAT${docId.slice(-3).toUpperCase()}`
}

const formatRevenueLabel = (category: { revenue?: number; revenueLabel?: string }) => {
  if (category.revenueLabel) return category.revenueLabel
  if (typeof category.revenue === 'number') {
    return `₹${category.revenue.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
  return '₹0.00'
}

// The short code is only for display. Actions still use the real id.
const toSubCategoryId = (subId: string) => `SUB${subId.toString().slice(-3).toUpperCase()}`

const mapServiceSubCategory = (sub: CategoryApiSubCategory): Category['subCategories'][number] => {
  const subId = resolveDocId(sub)
  return {
    id: subId,
    subCategoryId: toSubCategoryId(subId),
    name: sub.name,
    status: mapSubStatus(sub, 'service'),
    description: sub.description || '',
    adminNotes: '',
    icon: sub.vectorIcon || sub.icon || sub.icon3D || undefined,
    addedOn: formatDate(sub.createdAt),
    createdBy: sub.createdByName || sub.createdBy || 'Admin',
    updatedAt: formatDate(sub.updatedAt),
    services: sub.services ?? sub.managementVisibleListings ?? sub.activeListings ?? 0,
    experts: sub.experts ?? 0,
  }
}

const mapVenueSubCategory = (
  sub: CategoryApiSubCategory,
): VenueCategory['subCategories'][number] => {
  const subId = resolveDocId(sub)
  return {
    id: subId,
    subCategoryId: toSubCategoryId(subId),
    name: sub.name,
    status: mapSubStatus(sub, 'venue'),
    description: sub.description || '',
    adminNotes: '',
    icon: sub.vectorIcon || sub.icon || sub.icon3D || undefined,
    addedOn: formatDate(sub.createdAt),
    createdBy: sub.createdByName || sub.createdBy || 'Admin',
    updatedAt: formatDate(sub.updatedAt),
    venues: sub.venues ?? sub.totalVenues ?? 0,
  }
}

// A deleted service sub-category is left off the list. Repeat booking is shown as a percent, and a missing one is zero.
export const mapServiceCategoryToUi = (category: ServiceCategoryApi): Category => {
  const activeSubs = (category.subCategories || []).filter((sub) => sub.status !== 'DELETED')
  const repeatPct = typeof category.repeatBookingPct === 'number' ? category.repeatBookingPct : 0

  return {
    id: resolveDocId(category),
    categoryId: toCategoryId(category),
    name: category.name,
    description: category.description || '',
    icon: category.icon3D || category.icon || undefined,
    image: category.image || undefined,
    status: mapServiceStatus(category.status),
    subCategory: category.subCategoryCount ?? activeSubs.length,
    services:
      category.services ?? category.managementVisibleListings ?? category.activeListings ?? 0,
    experts: category.experts ?? 0,
    totalOrders: category.totalOrders ?? 0,
    completedOrders: category.completedOrders ?? 0,
    inProgressOrders: category.inProgressOrders ?? 0,
    cancelledOrders: category.cancelledOrders ?? 0,
    revenue: formatRevenueLabel(category),
    repeatBookingPct: `${repeatPct}%`,
    createdAt: formatDate(category.createdAt),
    updatedAt: formatDate(category.updatedAt),
    createdBy: category.createdByName || category.createdBy || 'Admin',
    adminNotes: '',
    subCategories: activeSubs.map(mapServiceSubCategory),
  }
}

// A deleted category stays deleted even if it is also paused. Deleted sub-categories are left off the list.
export const mapVenueCategoryToUi = (category: VenueCategoryApi): VenueCategory => {
  const status = category.isDeleted ? 'Deleted' : category.isPaused ? 'Paused' : 'Accepted'

  const activeSubs = (category.subCategories || []).filter((sub) => !sub.isDeleted)

  return {
    id: resolveDocId(category),
    categoryId: toCategoryId(category),
    name: category.name,
    description: category.description || '',
    icon: category.icon || category.icon3D || undefined,
    image: category.image || undefined,
    status,
    subCategory: activeSubs.length,
    spaces: category.totalSpaces ?? category.spaces ?? 0,
    activeSpaces: category.activeSpaces ?? 0,
    venues: category.venues ?? category.totalVenues ?? 0,
    bookings: category.totalBookings ?? category.bookings ?? 0,
    completedBookings: category.completedBookings ?? 0,
    revenue: formatRevenueLabel(category),
    createdAt: formatDate(category.createdAt),
    updatedAt: formatDate(category.updatedAt),
    createdBy: category.createdByName || category.createdBy || 'Admin',
    adminNotes: '',
    subCategories: activeSubs.map(mapVenueSubCategory),
  }
}

export const getErrorMessage = (error: unknown, fallback: string) =>
  getApiErrorMessage(error, fallback)
