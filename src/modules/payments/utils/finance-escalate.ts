export type FinanceEscalateKind = 'refund' | 'dispute' | 'resource'

export function escalateUrl(
  id: string,
  options: {
    kind?: FinanceEscalateKind
    resourceType?: string
    returnTo?: string
  } = {},
) {
  const params = new URLSearchParams()
  const kind =
    options.kind ||
    (options.resourceType === 'Dispute'
      ? 'dispute'
      : options.resourceType === 'Refund' || !options.resourceType
        ? 'refund'
        : 'resource')

  params.set('kind', kind)
  if (options.resourceType) params.set('resourceType', options.resourceType)
  if (options.returnTo) params.set('returnTo', options.returnTo)

  return `/finance/refunds/${encodeURIComponent(id)}/escalate?${params.toString()}`
}
