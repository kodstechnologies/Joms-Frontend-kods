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
