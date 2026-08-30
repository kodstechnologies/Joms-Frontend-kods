import { describe, expect, it } from 'vitest'

import {
  createEmptyFilterValues,
  createEmptyFilterValuesForConfig,
  getAllConfigFieldDefinitions,
  getEmptyFieldValue,
  hasActiveFilters,
} from './filter-utils'
import { getModuleFilterConfig, moduleFilterConfigs } from './configs'
import type { FilterFieldConfig, FilterSectionConfig } from '@/shared/types/data-filter'

const sampleSection = (fields: FilterFieldConfig[]): FilterSectionConfig => ({
  id: 'sample',
  title: 'Sample',
  fields,
})

describe('filter-utils', () => {
  it('builds empty values for every field type and detects active filters', () => {
    const sections = [
      sampleSection([
        { id: 'q', label: 'Search', type: 'search' },
        { id: 'tags', label: 'Tags', type: 'checkbox-group', options: [] },
        { id: 'amount', label: 'Amount', type: 'number-range' },
        { id: 'when', label: 'When', type: 'date-range' },
        { id: 'place', label: 'Place', type: 'location' },
        { id: 'status', label: 'Status', type: 'text' },
      ]),
    ]

    const empty = createEmptyFilterValues(sections)
    expect(empty.q).toBe('')
    expect(empty.tags).toEqual([])
    expect(empty.amount).toEqual({ from: '', to: '' })
    expect(empty.place).toEqual({ state: '', city: '' })
    expect(hasActiveFilters(empty)).toBe(false)

    expect(hasActiveFilters({ q: ' paid ' })).toBe(true)
    expect(hasActiveFilters({ tags: ['a'] })).toBe(true)
    expect(hasActiveFilters({ amount: { from: '1', to: '' } })).toBe(true)
    expect(hasActiveFilters({ place: { state: 'KA', city: '' } })).toBe(true)
    expect(getEmptyFieldValue({ id: 'x', label: 'X', type: 'text' })).toBe('')
  })

  it('covers every registered module filter config', () => {
    for (const [key, config] of Object.entries(moduleFilterConfigs)) {
      expect(getModuleFilterConfig(key as keyof typeof moduleFilterConfigs)).toBe(config)
      expect(config.moduleName).toBeTruthy()
      expect(config.sections.length).toBeGreaterThan(0)
      const values = createEmptyFilterValuesForConfig(config)
      const fields = getAllConfigFieldDefinitions(config)
      expect(fields.length).toBeGreaterThan(0)
      expect(Object.keys(values).length).toBe(fields.length)
      expect(hasActiveFilters(values)).toBe(false)
    }
  })
})
