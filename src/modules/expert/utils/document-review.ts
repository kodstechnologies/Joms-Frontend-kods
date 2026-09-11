export type DocumentReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type DocumentDecisionVariant = 'approve' | 'reject' | 'requestChanges'

export function resolveDocumentReviewStatus(
  url?: string | null,
  reviewStatus?: DocumentReviewStatus | null,
): DocumentReviewStatus | null {
  if (!url) return null
  if (reviewStatus === 'APPROVED' || reviewStatus === 'REJECTED') return reviewStatus
  return 'PENDING'
}

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
