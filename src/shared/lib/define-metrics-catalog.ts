/** Shared metric-catalog helpers — keeps page configs data-first without repeated map boilerplate. */

export type MetricCatalogEntry = {
  id: string
  label: string
  type: string
  description: string
  defaultActive: boolean
}

export type MetricRowTuple = readonly [
  id: string,
  label: string,
  type: string,
  description: string,
  active?: boolean,
]

export function catalogFromMetricRows(rows: readonly MetricRowTuple[]): MetricCatalogEntry[] {
  return rows.map(([id, label, type, description, defaultActive = false]) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }))
}

export function deriveMetricExports<T extends { id: string; defaultActive: boolean }>(
  catalog: readonly T[],
) {
  const ids = catalog.map((metric) => metric.id)
  return {
    ids,
    idSet: new Set(ids),
    defaultIds: catalog.filter((metric) => metric.defaultActive).map((metric) => metric.id),
    maxActive: catalog.length,
  }
}
