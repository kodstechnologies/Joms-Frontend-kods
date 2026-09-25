type RelatedListCategoryLinkOptions = {
  categoryId?: string | null
  categoryName?: string | null
  subCategoryName?: string | null
}

/** Deep-link into a related list (e.g. Services / Experts) with category filters. */
export function buildRelatedListCategoryUrl(
  relatedListPath: string,
  { categoryId, categoryName, subCategoryName }: RelatedListCategoryLinkOptions = {},
): string {
  const base = String(relatedListPath || '').trim() || '/'
  const params = new URLSearchParams()

  const id = String(categoryId || '').trim()
  const name = String(categoryName || '').trim()
  const subName = String(subCategoryName || '').trim()

  if (id) params.set('categoryId', id)
  if (name) params.set('category', name)
  if (subName) params.set('subCategory', subName)

  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export function buildServiceManagementCategoryUrl(options: RelatedListCategoryLinkOptions = {}) {
  return buildRelatedListCategoryUrl('/services/management', options)
}
