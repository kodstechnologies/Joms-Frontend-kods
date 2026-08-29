export type FinanceEscalateKind = 'refund' | 'dispute' | 'resource'

export function escalateKind(
  kind: string | null | undefined,
  resourceType?: string | null,
): FinanceEscalateKind {
  if (kind === 'dispute' || kind === 'refund' || kind === 'resource') return kind
  if (resourceType === 'Dispute') return 'dispute'
  if (resourceType === 'Refund' || !resourceType) return 'refund'
  return 'resource'
}

export function safeEscalateReturnTo(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

export function escalateDetailPath(
  id: string,
  options: {
    kind?: string | null
    resourceType?: string | null
    from?: string | null
  } = {},
) {
  const encoded = encodeURIComponent(id)
  const kind = escalateKind(options.kind, options.resourceType)
  const from = options.from || ''
  const resourceType = options.resourceType || ''

  if (kind === 'dispute') return `/finance/refunds/${encoded}/dispute`

  const params = new URLSearchParams()
  params.set('kind', kind)
  if (resourceType) params.set('resourceType', resourceType)
  if (from) params.set('from', from)
  return `/finance/escalations/${encoded}?${params.toString()}`
}

export function escalateUrl(
  id: string,
  options: {
    kind?: FinanceEscalateKind
    resourceType?: string
    returnTo?: string
  } = {},
) {
  const params = new URLSearchParams()
  const kind = escalateKind(options.kind, options.resourceType)

  params.set('kind', kind)
  if (options.resourceType) params.set('resourceType', options.resourceType)
  if (options.returnTo) params.set('returnTo', options.returnTo)

  return `/finance/refunds/${encodeURIComponent(id)}/escalate?${params.toString()}`
}
