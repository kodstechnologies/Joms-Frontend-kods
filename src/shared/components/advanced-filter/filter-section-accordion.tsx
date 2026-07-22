import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

import type { FilterSectionConfig, FilterValues } from '@/shared/types/data-filter'

import { FilterFieldRenderer } from './filter-field-renderer'

type FilterSectionAccordionProps = {
  section: FilterSectionConfig
  values: FilterValues
  onChange: (fieldId: string, value: FilterValues[string]) => void
  variant?: 'card' | 'bar'
  defaultExpanded?: boolean
}

export function FilterSectionAccordion({
  section,
  values,
  onChange,
  variant = 'card',
  defaultExpanded,
}: FilterSectionAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? section.defaultExpanded ?? false)

  if (variant === 'bar') {
    return (
      <div className="radius-lg bg-brand-surface overflow-hidden border border-white/10">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
          aria-expanded={expanded}
        >
          <span className="text-body-md-medium text-brand-text">{section.title}</span>
          {expanded ? (
            <Minus className="icon-sm text-brand-text" aria-hidden="true" />
          ) : (
            <Plus className="icon-sm text-brand-text" aria-hidden="true" />
          )}
        </button>

        {expanded ? (
          <div className="space-y-6 border-t border-white/10 px-5 py-5">
            {section.fields.map((field) => (
              <FilterFieldRenderer
                key={field.id}
                field={field}
                values={values}
                onChange={onChange}
              />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <section className="radius-lg bg-brand-surface overflow-hidden border border-white/10">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        aria-expanded={expanded}
      >
        <span className="text-body-md-medium text-brand-text">{section.title}</span>
        {expanded ? (
          <Minus className="icon-sm text-brand-text" aria-hidden="true" />
        ) : (
          <Plus className="icon-sm text-brand-text" aria-hidden="true" />
        )}
      </button>

      {expanded ? (
        <div className="space-y-8 border-t border-white/10 px-6 py-6">
          {section.fields.map((field) => (
            <FilterFieldRenderer key={field.id} field={field} values={values} onChange={onChange} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
