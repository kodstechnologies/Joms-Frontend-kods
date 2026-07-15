import { X } from 'lucide-react'
import { useEffect } from 'react'

import { Sidebar } from '@/app/layouts/components/sidebar'
import { SidebarBrand } from '@/app/layouts/components/sidebar-brand'
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
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} aria-hidden />
      ) : null}

      <aside
        className={cn(
          'bg-brand-surface fixed inset-y-0 left-0 z-50 w-[18.5rem] border-r border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.55)] transition-transform lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
          <SidebarBrand />
          <button
            type="button"
            onClick={onClose}
            className="rounded-brand-md text-brand-stroke p-2 hover:bg-white/5"
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
