import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

type TableActionsDropdownProps = {
  label: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  menuClassName?: string
  buttonClassName?: string
  menuWidth?: number
  tone?: 'dark' | 'light'
}

const MENU_GAP = 8
const VIEWPORT_PAD = 8

export function TableActionsDropdown({
  label,
  isOpen,
  onOpenChange,
  children,
  menuClassName,
  buttonClassName,
  menuWidth = 192,
  tone = 'light',
}: TableActionsDropdownProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<{
    style: CSSProperties
    openUp: boolean
  } | null>(null)

  useLayoutEffect(() => {
    if (!isOpen) return

    const update = () => {
      const button = buttonRef.current
      const menu = menuRef.current
      if (!button) return

      const icon = button.querySelector('svg')
      const rect = button.getBoundingClientRect()
      const alignRect = icon?.getBoundingClientRect() ?? rect
      const height = menu?.offsetHeight || 0
      const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP
      const openUp = height > 0 && spaceBelow < height && rect.top > height + MENU_GAP
      const top = openUp
        ? Math.max(VIEWPORT_PAD, rect.top - MENU_GAP - height)
        : rect.bottom + MENU_GAP

      setPlacement({
        openUp,
        style: {
          position: 'fixed',
          top,
          right: window.innerWidth - (alignRect.left + alignRect.width / 2),
          left: 'auto',
          width: menuWidth,
          minWidth: menuWidth,
          maxWidth: menuWidth,
          zIndex: 2000,
          margin: 0,
          transform: 'none',
        },
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [isOpen, menuWidth, children])

  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      onOpenChange(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onOpenChange])

  const menu = isOpen ? (
    <div
      ref={menuRef}
      role="menu"
      className={cn(
        'ui-table-actions-menu',
        placement?.openUp && 'ui-table-actions-menu-up',
        tone === 'dark' && 'ui-table-actions-menu-dark',
        menuClassName,
      )}
      style={
        placement?.style ?? {
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: menuWidth,
          minWidth: menuWidth,
          maxWidth: menuWidth,
          zIndex: 2000,
          margin: 0,
          visibility: 'hidden',
        }
      }
    >
      {children}
    </div>
  ) : null

  return (
    <div
      ref={rootRef}
      className="relative inline-flex shrink-0"
      style={{ position: 'relative', width: 24, height: 24 }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation()
          onOpenChange(!isOpen)
        }}
        className={cn(
          'flex size-full items-center justify-center rounded transition-colors',
          tone === 'light'
            ? 'text-muted hover:text-brand-text hover:bg-white/10'
            : 'text-brand-muted hover:text-brand-text hover:bg-white/10',
          buttonClassName,
        )}
      >
        <MoreVertical className="icon-sm" aria-hidden="true" />
      </button>

      {menu && typeof document !== 'undefined' ? createPortal(menu, document.body) : null}
    </div>
  )
}

type TableActionsItemProps = {
  onClick: () => void
  children: ReactNode
  icon?: ReactNode
  className?: string
  tone?: 'dark' | 'light'
}

export function TableActionsItem({
  onClick,
  children,
  icon,
  className,
  tone = 'light',
}: TableActionsItemProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={cn(
        'ui-table-actions-item',
        tone === 'dark' && 'ui-table-actions-item-dark',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}
