import type {
  FilterFieldConfig,
  FilterSectionConfig,
  FilterValues,
  LocationFilterValue,
  ModuleFilterConfig,
  RangeFilterValue,
} from '@/shared/types/data-filter'

export function getAllConfigFieldDefinitions(config: ModuleFilterConfig): FilterFieldConfig[] {
  const fields = new Map<string, FilterFieldConfig>()

  const addSections = (sections: FilterSectionConfig[]) => {
    sections.forEach((section) => {
      section.fields.forEach((field) => {
        fields.set(field.id, field)
      })
    })
  }

  addSections(config.sections)
  if (config.exportSections) {
    addSections(config.exportSections)
  }

  return Array.from(fields.values())
}

export function createEmptyFilterValues(sections: FilterSectionConfig[]): FilterValues {
  const values: FilterValues = {}

  sections.forEach((section) => {
    section.fields.forEach((field) => {
      values[field.id] = getEmptyFieldValue(field)
    })
  })

  return values
}

export function createEmptyFilterValuesForConfig(config: ModuleFilterConfig): FilterValues {
  const values: FilterValues = {}

  getAllConfigFieldDefinitions(config).forEach((field) => {
    values[field.id] = getEmptyFieldValue(field)
  })

  return values
}

export function getEmptyFieldValue(
  field: FilterFieldConfig,
): string | string[] | RangeFilterValue | LocationFilterValue {
  switch (field.type) {
    case 'checkbox-group':
      return []
    case 'search':
      return ''
    case 'number-range':
    case 'date-range':
      return { from: '', to: '' }
    case 'location':
      return { state: '', city: '' }
    default:
      return ''
  }
}

export function hasActiveFilters(values: FilterValues): boolean {
  return Object.values(values).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0
    }

    if (typeof value === 'string') {
      return value.trim().length > 0
    }

    if ('from' in value && 'to' in value) {
      return value.from.trim().length > 0 || value.to.trim().length > 0
    }

    if ('state' in value && 'city' in value) {
      return value.state.trim().length > 0 || value.city.trim().length > 0
    }

    return false
  })
}
