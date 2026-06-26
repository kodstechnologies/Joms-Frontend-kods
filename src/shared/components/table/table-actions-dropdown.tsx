import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
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
}

export function TableActionsDropdown({
  label,
  isOpen,
  onOpenChange,
  children,
  menuClassName,
  menuWidth = 192,
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
    const openUpward = menuHeight > 0 && spaceBelow < menuHeight + gap && rect.top > menuHeight + gap

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
        className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-white"
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
                'fixed z-[101] rounded-xl border border-slate-800 bg-[#1A1A1A] py-1.5 text-left shadow-2xl',
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
}

export function TableActionsItem({ onClick, children, icon }: TableActionsItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800/80 hover:text-amber-400"
    >
      {icon}
      {children}
    </button>
  )
}
