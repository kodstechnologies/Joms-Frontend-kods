import { useState } from 'react'
import { Info } from 'lucide-react'

import { categoryFormTheme } from './category-form.theme'

interface InfoTooltipProps {
  text: string
}

const InfoTooltip = ({ text }: InfoTooltipProps) => {
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
          className={`absolute bottom-[calc(100%+6px)] left-1/2 z-20 -translate-x-1/2 ${categoryFormTheme.tooltipClass}`}
        >
          {text}
          <span className="border-t-brand-bg absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" />
        </div>
      ) : null}
    </div>
  )
}

export default InfoTooltip
