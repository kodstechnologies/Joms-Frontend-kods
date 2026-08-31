import { X } from 'lucide-react'
import { useEffect } from 'react'

import { Sidebar } from '@/app/layouts/components/sidebar-nav'
import { SidebarBrand } from '@/app/layouts/components/sidebar-brand'

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

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="bg-brand-surface fixed inset-y-0 left-0 z-50 w-[var(--brand-sidebar-width)] border-r border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.55)] lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
      >
        <div className="flex h-[var(--brand-topbar-height)] items-center justify-between border-b border-white/10 px-4">
          <SidebarBrand />
          <button
            type="button"
            onClick={onClose}
            className="rounded-brand-md text-brand-stroke p-2 hover:bg-white/5"
            aria-label="Close sidebar"
          >
            <X className="icon-md" strokeWidth={1.5} />
          </button>
        </div>
        <Sidebar onNavigate={onClose} compact={false} />
      </div>
    </>
  )
}
