import { X } from 'lucide-react'
import { useEffect } from 'react'

import { Sidebar } from '@/app/layouts/components/sidebar'
import { cn } from '@/shared/lib/cn'

type SidebarMobileProps = {
  open: boolean
  onClose: () => void
}

export function SidebarMobile({ open, onClose }: SidebarMobileProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      {open ? <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} aria-hidden /> : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[18.5rem] border-r border-white/10 bg-brand-surface shadow-[0_20px_70px_rgba(0,0,0,0.55)] transition-transform lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
      >
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-accent" />
            <p className="text-sm font-semibold text-brand-text">JOMS</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-brand-md p-2 text-brand-stroke hover:bg-white/5"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>
        <Sidebar onNavigate={onClose} compact={false} />
      </aside>
    </>
  )
}
