export type AdminNoteLogEntry = {
  id?: string
  text?: string
  createdAt?: string | null
  createdBy?: string | null
}

/** Admin notes for profile sidebar — newest entry first. */
export function adminNoteTextsNewestFirst(
  log?: AdminNoteLogEntry[] | null,
  legacyInternalNotes?: string | null,
): string[] {
  if (Array.isArray(log) && log.length > 0) {
    return log
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => String(entry?.text || '').trim())
      .sort((a, b) => {
        const ta = a.entry.createdAt ? new Date(a.entry.createdAt).getTime() : null
        const tb = b.entry.createdAt ? new Date(b.entry.createdAt).getTime() : null
        if (ta != null && tb != null && tb !== ta) return tb - ta
        if (ta != null && tb == null) return -1
        if (ta == null && tb != null) return 1
        return b.index - a.index
      })
      .map(({ entry }) => String(entry.text || '').trim())
  }

  const legacy = String(legacyInternalNotes || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  return legacy.length > 1 ? [...legacy].reverse() : legacy
}
