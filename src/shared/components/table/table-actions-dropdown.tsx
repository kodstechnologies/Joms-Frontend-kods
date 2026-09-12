import { useEffect, useRef, type ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

type TableActionsDropdownProps = {
  label: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  menuClassName?: string
  menuWidth?: number
  tone?: 'dark' | 'light'
}

/**
 * Opens the actions menu directly under the ⋮ (Figma).
 * Inline top/right so placement cannot be overridden by other CSS.
 */
export function TableActionsDropdown({
  label,
  isOpen,
  onOpenChange,
  children,
  menuClassName,
  menuWidth = 192,
  tone = 'light',
}: TableActionsDropdownProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
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

  return (
    <div
      ref={rootRef}
      className="relative inline-flex shrink-0"
      style={{ position: 'relative', width: 24, height: 24 }}
    >
      <button
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
        )}
      >
        <MoreVertical className="icon-sm" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className={cn(
            'ui-table-actions-menu absolute top-full right-0 z-[101] mt-2',
            tone === 'dark' && 'ui-table-actions-menu-dark',
            menuClassName,
          )}
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            left: 'auto',
            width: menuWidth,
            minWidth: menuWidth,
            maxWidth: menuWidth,
            zIndex: 101,
            marginTop: 8,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
            transform: 'none',
          }}
        >
          {children}
        </div>
      ) : null}
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
