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
