type StatCardProps = {
  title: string
  value: string
  className?: string
}

export function StatCard({ title, value, className }: StatCardProps) {
  return (
    <div
      className={`rounded-brand-lg border border-white/10 bg-brand-surface px-5 py-4 ${className ?? ''}`}
    >
      <p className="text-xs font-medium text-slate-400 md:text-sm">{title}</p>
      <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">{value}</h2>
    </div>
  )
}
