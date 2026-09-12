import { cn } from '@/shared/lib/cn'

type StatCardProps = {
  title: string
  value: string
  className?: string
  isTextValue?: boolean
}

export function StatCard({ title, value, className, isTextValue }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-brand-lg bg-brand-surface flex min-h-[130px] flex-col border border-white/[0.06] p-4 transition-colors hover:border-white/10',
        className,
      )}
    >
      <p className="text-body-sm text-muted truncate font-medium">{title}</p>
      <p
        className={cn(
          /* Figma: Figtree SemiBold 20/20 · letter-spacing 0 */
          'mt-2 text-[20px] leading-5 font-semibold tracking-normal text-white',
          isTextValue ? 'line-clamp-2' : 'truncate',
        )}
      >
        {value}
      </p>
    </div>
  )
}
