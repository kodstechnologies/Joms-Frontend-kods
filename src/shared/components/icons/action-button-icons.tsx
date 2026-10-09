import type { ImgHTMLAttributes, SVGProps } from 'react'

import manageMetricsIconSrc from '@/assets/JOMS_ICONS-2/manage-metrics-icon.png'
import { cn } from '@/shared/lib/cn'

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
      className={className ?? 'ui-export-data-icon shrink-0'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 3.33v8.34" />
      <path d="m6.67 6.67 3.33-3.34 3.33 3.34" />
      <path d="M4.17 11.67a5.83 5.83 0 0 0 11.66 0" />
    </svg>
  )
}

export function SortOutlineIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('size-4 shrink-0', className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M13.47 7.53a.75.75 0 0 0 1.06 0l.72-.72V17a.75.75 0 0 0 1.5 0V6.81l.72.72a.75.75 0 1 0 1.06-1.06l-2-2a.75.75 0 0 0-1.06 0l-2 2a.75.75 0 0 0 0 1.06m-4.72 9.66l.72-.72a.75.75 0 1 1 1.06 1.06l-2 2a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l.72.72V7a.75.75 0 0 1 1.5 0z" />
    </svg>
  )
}

export function ManageMetricsIcon({
  className,
  alt = '',
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={manageMetricsIconSrc}
      alt={alt}
      width={20}
      height={20}
      className={cn('ui-manage-metrics-icon', className)}
      aria-hidden={alt ? undefined : true}
      {...props}
    />
  )
}

const accessIconClass = 'size-3.5 shrink-0'

export function AccessViewUserIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 1.75h4.25L10.5 4v7.25a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2.75a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M8.25 1.75V4H10.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path
        d="M5 6.5h4M5 8.5h4M5 10.5h2.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AccessChangeRoleIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <circle cx="7" cy="7" r="5.4" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M9.6 5.15A3.15 3.15 0 0 0 4.7 4.55"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M4.55 3.35v1.45h1.45"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.4 8.85a3.15 3.15 0 0 0 4.9.6"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M9.45 10.65V9.2H8"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AccessViewUserLogsIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <circle cx="7" cy="2.75" r="1.35" stroke="currentColor" strokeWidth="1.15" />
      <circle cx="3.25" cy="10.75" r="1.35" stroke="currentColor" strokeWidth="1.15" />
      <circle cx="10.75" cy="10.75" r="1.35" stroke="currentColor" strokeWidth="1.15" />
      <path
        d="M6.1 3.85 3.9 9.35M7.9 3.85l2.2 5.5M4.6 10.75h4.8"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AccessPasswordResetIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4.1 5.1A4.25 4.25 0 1 1 3.5 7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M3.2 2.9v2.4h2.4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AccessRemoveUserIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <circle cx="5.5" cy="4.25" r="2.1" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M1.75 12c0-2.15 1.68-3.9 3.75-3.9s3.75 1.75 3.75 3.9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M9.4 6.75h3.4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

export function AccessSuspendUserIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <circle cx="7" cy="7" r="5.4" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M4.6 4.6 9.4 9.4M9.4 4.6 4.6 9.4"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AccessEditPermissionIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <rect
        x="2.5"
        y="1.75"
        width="9"
        height="10.5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AccessRemoveRoleIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <circle cx="7" cy="7" r="5.4" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M4.7 4.7 9.3 9.3M9.3 4.7 4.7 9.3"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AccessDisableRoleIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <circle cx="7" cy="7" r="5.4" stroke="currentColor" strokeWidth="1.25" />
      <path d="M3.4 10.6 10.6 3.4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

export function AccessEditScopeIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <circle cx="7" cy="3" r="1.4" stroke="currentColor" strokeWidth="1.15" />
      <circle cx="3.2" cy="10.5" r="1.4" stroke="currentColor" strokeWidth="1.15" />
      <circle cx="10.8" cy="10.5" r="1.4" stroke="currentColor" strokeWidth="1.15" />
      <path
        d="M6.1 4.1 3.9 9.2M7.9 4.1l2.2 5.1"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AccessAssignUserIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <circle cx="5.4" cy="4.2" r="2.05" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M1.7 12c0-2.05 1.66-3.7 3.7-3.7s3.7 1.65 3.7 3.7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M10.6 5.2v3.6M8.8 7h3.6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AccessViewLogsIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? accessIconClass}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M3.2 3.5h7.6M3.2 7h7.6M3.2 10.5h5.2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="2" cy="3.5" r="0.7" fill="currentColor" />
      <circle cx="2" cy="7" r="0.7" fill="currentColor" />
      <circle cx="2" cy="10.5" r="0.7" fill="currentColor" />
    </svg>
  )
}
