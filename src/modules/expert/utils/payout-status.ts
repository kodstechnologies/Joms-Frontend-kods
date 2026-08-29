export const statusBadgeClass = (status?: string) => {
  const value = String(status || '').toLowerCase()
  if (value === 'credited' || value === 'successful' || value === 'paid' || value === 'completed') {
    return 'bg-[#143D2B] text-white border border-[#1E563D]/50'
  }
  if (
    value === 'processing' ||
    value === 'scheduled' ||
    value === 'pending approval' ||
    value === 'pending'
  ) {
    return 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
  }
  if (value === 'disputed') {
    return 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
  }
  if (value === 'failed' || value === 'cancelled') {
    return 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
  }
  return 'bg-white/10 text-slate-300 border border-white/10'
}
