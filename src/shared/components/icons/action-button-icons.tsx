import type { SVGProps } from 'react'
import { SlidersHorizontal, type LucideProps } from 'lucide-react'

export function AdvanceFilterIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'size-5 min-h-5 min-w-5 shrink-0'}
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="2" y1="4.5" x2="18" y2="4.5" />
      <line x1="5.5" y1="10" x2="14.5" y2="10" />
      <line x1="9" y1="15.5" x2="11" y2="15.5" />
    </svg>
  )
}

export function ExportDataIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'size-5 min-h-5 min-w-5 shrink-0'}
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3.5 10a6.5 6.5 0 0 0 13 0" />
      <path d="M10 3v8" />
      <path d="m6.5 6.5 3.5-3.5 3.5 3.5" />
    </svg>
  )
}

export function ManageMetricsIcon({
  className,
  size = 20,
  strokeWidth = 2.2,
  ...props
}: LucideProps) {
  return (
    <SlidersHorizontal
      size={size}
      strokeWidth={strokeWidth}
      className={className ?? 'size-10 shrink-0'}
      aria-hidden="true"
      {...props}
    />
  )
}
