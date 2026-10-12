import { useState } from 'react'
import { Info } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

import { categoryFormTheme } from './category-form.theme'

interface InfoTooltipProps {
  text: string
  width?: number
  minHeight?: number
}

const InfoTooltip = ({ text, width = 141, minHeight = 44 }: InfoTooltipProps) => {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={text}
        className="text-muted hover:text-brand-text grid size-4 place-items-center rounded-full transition-colors"
      >
        <Info className="size-3.5" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="tooltip"
          className={cn(
            'absolute bottom-[calc(100%+6px)] left-1/2 z-20 -translate-x-1/2',
            categoryFormTheme.tooltipClass,
          )}
          style={{ width, minHeight }}
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
        </div>
      ) : null}
    </div>
  )
}

export default InfoTooltip
