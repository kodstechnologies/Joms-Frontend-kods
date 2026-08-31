import { useMemo } from 'react'

import { resolveVisibleExportColumnIds } from '@/shared/utils/export-filter-utils'

type UseTableExportColumnIdsOptions = {
  visibleColumnIds?: string[]
  defaultColumnIds: readonly string[]
  catalogColumnIds: readonly string[]
  legacyColumnIdMap?: Record<string, string>
  allowedColumnIds?: ReadonlySet<string> | readonly string[]
}

export function useTableExportColumnIds({
  visibleColumnIds,
  defaultColumnIds,
  catalogColumnIds,
  legacyColumnIdMap = {},
  allowedColumnIds,
}: UseTableExportColumnIdsOptions) {
  return useMemo(
    () =>
      resolveVisibleExportColumnIds({
        visibleColumnIds,
        defaultColumnIds,
        catalogColumnIds,
        legacyColumnIdMap,
        allowedColumnIds,
      }),
    [visibleColumnIds, defaultColumnIds, catalogColumnIds, legacyColumnIdMap, allowedColumnIds],
  )
}
