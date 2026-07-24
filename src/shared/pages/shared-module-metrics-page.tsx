import { useParams } from 'react-router-dom'

import { ModuleMetricsPage } from '@/modules/expert/pages/shared/module-metrics-page'
import { getModuleMetricsDefinition } from '@/shared/lib/module-metrics-registry'

export function SharedModuleMetricsPage() {
  const { moduleKey = '' } = useParams<{ moduleKey: string }>()
  const definition = getModuleMetricsDefinition(moduleKey)

  if (!moduleKey || !definition) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#141414] p-6 text-sm text-white/70">
        Unknown metrics module: {moduleKey || 'missing'}
      </div>
    )
  }

  return (
    <ModuleMetricsPage
      moduleKey={definition.moduleKey}
      moduleName={definition.moduleName}
      returnTo={definition.returnTo}
      section={
        definition.metrics?.length && definition.columns?.length
          ? 'all'
          : definition.columns?.length
            ? 'table'
            : 'dashboard'
      }
      includeDashboard={Boolean(definition.metrics?.length)}
      includeTableColumns={Boolean(definition.columns?.length)}
      maxActiveMetrics={definition.maxActiveMetrics}
    />
  )
}
