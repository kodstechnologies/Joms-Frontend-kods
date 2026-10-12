export type DocumentReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type DocumentDecisionVariant = 'approve' | 'reject' | 'requestChanges'

// A document with no file has no review status. Anything not already approved or rejected is still pending.
export function resolveDocumentReviewStatus(
  url?: string | null,
  reviewStatus?: DocumentReviewStatus | null,
): DocumentReviewStatus | null {
  if (!url) return null
  if (reviewStatus === 'APPROVED' || reviewStatus === 'REJECTED') return reviewStatus
  return 'PENDING'
}

// Only uploaded documents count. The check passes when every one of those is approved, including when none were uploaded.
export function areUploadedDocumentsApproved(
  items: Array<{ uploaded?: unknown; status?: string | null }>,
): boolean {
  const uploaded = items.filter((item) => {
    const value = item.uploaded
    if (Array.isArray(value)) return value.length > 0
    return Boolean(value && String(value).trim())
  })
  return uploaded.every((item) => String(item.status || '').toUpperCase() === 'APPROVED')
}
