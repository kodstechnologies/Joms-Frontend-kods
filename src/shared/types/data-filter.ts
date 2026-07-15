export type FilterOption = {
  label: string
  value: string
}

export type FilterFieldType =
  | 'text'
  | 'checkbox-group'
  | 'number-range'
  | 'date-range'
  | 'search'
  | 'location'

export type FilterFieldConfig = {
  id: string
  label: string
  type: FilterFieldType
  options?: FilterOption[]
  placeholder?: string
  fromPlaceholder?: string
  toPlaceholder?: string
  fromLabel?: string
  toLabel?: string
  statePlaceholder?: string
  cityPlaceholder?: string
}

export type FilterSectionConfig = {
  id: string
  title: string
  fields: FilterFieldConfig[]
  defaultExpanded?: boolean
}

export type ModuleFilterConfig = {
  moduleKey: string
  moduleName: string
  sections: FilterSectionConfig[]
  /** Export modal sections when different from advanced filter (e.g. Service Management uses By Owner). */
  exportSections?: FilterSectionConfig[]
}

export type RangeFilterValue = {
  from: string
  to: string
}

export type LocationFilterValue = {
  state: string
  city: string
}

export type FilterValues = Record<
  string,
  string | string[] | RangeFilterValue | LocationFilterValue
>

export type ModuleFilterKey =
  | 'expert-management'
  | 'service-management'
  | 'venue-management'
  | 'service-category-management'
  | 'venue-category-management'
