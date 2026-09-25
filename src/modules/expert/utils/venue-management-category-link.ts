type VenueManagementCategoryLinkOptions = {
  categoryId?: string | null
  categoryName?: string | null
  subCategoryName?: string | null
  view?: 'spaces' | null
}

/** Deep-link into Venue Management main table with category (and optional spaces) filters. */
export function buildVenueManagementCategoryUrl({
  categoryId,
  categoryName,
  subCategoryName,
  view,
}: VenueManagementCategoryLinkOptions = {}): string {
  const params = new URLSearchParams()

  const id = String(categoryId || '').trim()
  const name = String(categoryName || '').trim()
  const subName = String(subCategoryName || '').trim()

  if (id) params.set('categoryId', id)
  if (name) params.set('category', name)
  if (subName) params.set('subCategory', subName)
  if (view === 'spaces') params.set('view', 'spaces')

  const qs = params.toString()
  return qs ? `/venues/management?${qs}` : '/venues/management'
}
