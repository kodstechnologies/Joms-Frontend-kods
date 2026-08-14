import { useFinanceNotes } from '@/modules/payments/hooks/use-finance'
import { formatDateTime } from '@/modules/payments/utils/finance-mappers'
import { cn } from '@/shared/lib/cn'

type FinanceInternalNotesCardProps = {
  resourceId: string
  className?: string
}

export function FinanceInternalNotesCard({ resourceId, className }: FinanceInternalNotesCardProps) {
  const { data, isLoading, isError } = useFinanceNotes(resourceId)
  const notes = data?.data ?? []

  return (
    <section
      className={cn(
        'rounded-lg border border-white/[0.06] bg-brand-surface p-4 sm:p-5',
        className,
      )}
    >
      <h2 className="text-body-md-semibold text-brand-text mb-4 leading-[20px]">Internal Notes</h2>
      {isLoading ? (
        <p className="text-body-sm text-muted">Loading notes...</p>
      ) : isError ? (
        <p className="text-body-sm text-brand-danger">Failed to load notes.</p>
      ) : notes.length === 0 ? (
        <p className="text-body-sm text-muted">No internal notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note._id}
              className="rounded-lg border border-white/5 bg-brand-bg p-3"
            >
              <p className="text-body-sm text-brand-text whitespace-pre-wrap">{note.adminNote}</p>
              <p className="text-body-sm text-muted mt-2">{formatDateTime(note.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
