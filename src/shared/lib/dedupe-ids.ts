/** Preserve first-seen order while removing duplicate catalog entries by id. */
export function dedupeCatalogItems<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []

  for (const item of items) {
    if (!item.id || seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }

  return result
}

/** Preserve first-seen order while removing duplicate string ids. */
export function dedupeOrderedIds(ids: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const id of ids) {
    if (!id || seen.has(id)) continue
    seen.add(id)
    result.push(id)
  }

  return result
}

/** Sort ids to match a catalog order; unknown ids are appended at the end. */
export function sortIdsByCatalogOrder(ids: string[], catalogOrder: string[]): string[] {
  const deduped = dedupeOrderedIds(ids)
  const rank = new Map(catalogOrder.map((id, index) => [id, index]))

  return [...deduped].sort((a, b) => {
    const aRank = rank.get(a) ?? Number.MAX_SAFE_INTEGER
    const bRank = rank.get(b) ?? Number.MAX_SAFE_INTEGER
    return aRank - bRank
  })
}
