import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

import type { FilterSectionConfig, FilterValues } from '@/shared/types/data-filter'
import { cn } from '@/shared/lib/cn'

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
      <div className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#141414]">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
          aria-expanded={expanded}
        >
          <span className="text-sm font-medium text-white">{section.title}</span>
          {expanded ? (
            <Minus className="size-4 text-white" aria-hidden="true" />
          ) : (
            <Plus className="size-4 text-white" aria-hidden="true" />
          )}
        </button>

        {expanded ? (
          <div className="space-y-6 border-t border-[#2A2A2A] px-5 py-5">
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
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-white/10',
        expanded ? 'bg-[#181818]' : 'bg-[#141414]',
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        aria-expanded={expanded}
      >
        <span className="text-sm font-medium text-white">{section.title}</span>
        {expanded ? (
          <Minus className="size-4 text-white" aria-hidden="true" />
        ) : (
          <Plus className="size-4 text-white" aria-hidden="true" />
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
