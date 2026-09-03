export type MetricsCatalogItem = {
  id: string
  label: string
  type: string
  description: string
  defaultActive?: boolean
  defaultVisible?: boolean
}

export type ModuleMetricsDefinition = {
  moduleKey: string
  moduleName: string
  returnTo: string
  metrics?: MetricsCatalogItem[]
  columns?: MetricsCatalogItem[]
  maxActiveMetrics?: number
}

type MetricSource = {
  id: string
  label: string
  type: string
  description: string
  defaultActive?: boolean
}

type ColumnSource = {
  id: string
  label: string
  type: string
  description: string
  defaultVisible?: boolean
}

/** Project module metric catalogs into the shared metrics-page shape. */
export function mapMetricsCatalog(items: readonly MetricSource[]): MetricsCatalogItem[] {
  return items.map(({ id, label, type, description, defaultActive }) => ({
    id,
    label,
    type,
    description,
    defaultActive,
  }))
}

/** Project table-column catalogs into the shared metrics-page shape. */
export function mapColumnsCatalog(items: readonly ColumnSource[]): MetricsCatalogItem[] {
  return items.map(({ id, label, type, description, defaultVisible }) => ({
    id,
    label,
    type,
    description,
    defaultVisible,
  }))
}

export const metric = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultActive = false,
): MetricsCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultActive,
})

export const column = (
  id: string,
  label: string,
  type: string,
  description: string,
  defaultVisible = true,
): MetricsCatalogItem => ({
  id,
  label,
  type,
  description,
  defaultVisible,
})
