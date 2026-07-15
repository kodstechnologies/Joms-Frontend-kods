import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

type MenuPosition = {
  top: number
  left: number
}

type TableActionsDropdownProps = {
  label: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  menuClassName?: string
  menuWidth?: number
  tone?: 'dark' | 'light'
}

export function TableActionsDropdown({
  label,
  isOpen,
  onOpenChange,
  children,
  menuClassName,
  menuWidth = 192,
  tone = 'light',
}: TableActionsDropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const menuHeight = menuRef.current?.offsetHeight ?? 0
    const width = menuRef.current?.offsetWidth ?? menuWidth
    const gap = 4

    const spaceBelow = window.innerHeight - rect.bottom
    const openUpward =
      menuHeight > 0 && spaceBelow < menuHeight + gap && rect.top > menuHeight + gap

    const top = openUpward ? rect.top - menuHeight - gap : rect.bottom + gap
    const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8)

    setPosition({ top, left })
  }, [menuWidth])

  useLayoutEffect(() => {
    if (!isOpen) return

    updatePosition()
    const frame = requestAnimationFrame(updatePosition)

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, updatePosition, children])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation()
          onOpenChange(!isOpen)
        }}
        className={cn(
          'rounded p-1 transition-colors',
          tone === 'light'
            ? 'text-[#777] hover:bg-white/10 hover:text-white'
            : 'text-brand-muted hover:text-brand-text hover:bg-white/10',
        )}
      >
        <MoreVertical className="size-4" aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => onOpenChange(false)}
              aria-hidden="true"
            />
            <div
              ref={menuRef}
              style={{ top: position.top, left: position.left, minWidth: menuWidth }}
              className={cn(
                'rounded-brand-md fixed z-[101] py-1.5 text-left shadow-2xl',
                tone === 'light'
                  ? 'border border-slate-200 bg-white'
                  : 'bg-brand-surface border border-white/10',
                menuClassName,
              )}
            >
              {children}
            </div>
          </>,
          document.body,
        )}
    </>
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
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold transition-all',
        tone === 'light'
          ? 'text-slate-800 hover:bg-slate-50 hover:text-slate-900'
          : 'text-brand-stroke hover:text-brand-accent hover:bg-white/10',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}
