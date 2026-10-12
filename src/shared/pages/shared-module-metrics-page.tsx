import { useParams, useSearchParams } from 'react-router-dom'

import { ModuleMetricsPage } from '@/modules/expert/pages/shared/module-metrics-page'
import { getModuleMetricsDefinition } from '@/shared/lib/module-metrics-registry'

function parseSectionParam(value: string | null): 'dashboard' | 'table' | 'all' | undefined {
  if (value === 'dashboard' || value === 'table' || value === 'all') return value
  return undefined
}

export function SharedModuleMetricsPage() {
  const { moduleKey = '' } = useParams<{ moduleKey: string }>()
  const [searchParams] = useSearchParams()
  const definition = getModuleMetricsDefinition(moduleKey)
  const returnTo = searchParams.get('returnTo') ?? definition?.returnTo ?? '/'

  if (!moduleKey || !definition) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#141414] p-6 text-sm text-white/70">
        Unknown metrics module: {moduleKey || 'missing'}
      </div>
    )
  }

  const hasMetrics = Boolean(definition.metrics?.length)
  const hasColumns = Boolean(definition.columns?.length)
  const section =
    parseSectionParam(searchParams.get('section')) ??
    (hasMetrics && hasColumns ? 'all' : hasColumns ? 'table' : 'dashboard')

  return (
    <ModuleMetricsPage
      moduleKey={definition.moduleKey}
      moduleName={definition.moduleName}
      returnTo={returnTo}
      section={section}
      maxActiveMetrics={definition.maxActiveMetrics}
    />
  )
}
