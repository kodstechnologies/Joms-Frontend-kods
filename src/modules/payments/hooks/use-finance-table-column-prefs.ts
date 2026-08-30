import { useMemo } from 'react'

import { useTableColumnPreferences } from '@/modules/expert/hooks/use-ui-preferences'
import { useTableExportColumnIds } from '@/shared/hooks/use-table-export-column-ids'

type CatalogColumn = { id: string }

export function useFinanceTableColumnPrefs(
  moduleKey: string,
  catalog: CatalogColumn[],
  defaultColumnIds: string[],
  legacyColumnIdMap?: Record<string, string>,
) {
  const tableColumnPreferencesQuery = useTableColumnPreferences(moduleKey)
  const catalogColumnIds = useMemo(() => catalog.map((column) => column.id), [catalog])
  const exportColumnIds = useTableExportColumnIds({
    visibleColumnIds: tableColumnPreferencesQuery.data?.visibleColumnIds,
    defaultColumnIds,
    catalogColumnIds,
    legacyColumnIdMap,
  })

  return { tableColumnPreferencesQuery, catalogColumnIds, exportColumnIds }
}
