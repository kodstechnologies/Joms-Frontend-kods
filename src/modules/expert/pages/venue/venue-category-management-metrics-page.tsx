import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { VENUE_CATEGORY_MANAGEMENT_MODULE_KEY } from '../../api/ui-preferences-api'
import {
  useResetTableColumnPreferences,
  useSaveTableColumnPreferences,
  useTableColumnPreferences,
} from '../../hooks/use-ui-preferences'
import { ManageMetrics } from '@/shared/components/manage-metrics'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

export const VenueCategoryManagementMetricsPage = () => {
  const navigate = useNavigate()
  const goBack = () => navigateBackOrFallback(navigate, '/venues/categories/management')

  const preferencesQuery = useTableColumnPreferences(VENUE_CATEGORY_MANAGEMENT_MODULE_KEY)
  const saveMutation = useSaveTableColumnPreferences(VENUE_CATEGORY_MANAGEMENT_MODULE_KEY)
  const resetMutation = useResetTableColumnPreferences(VENUE_CATEGORY_MANAGEMENT_MODULE_KEY)

  const { visibleColumns, hiddenColumns } = useMemo(() => {
    const catalog = preferencesQuery.data?.catalog ?? []
    const visibleIds = preferencesQuery.data?.visibleColumnIds ?? []
    const visibleSet = new Set(visibleIds)

    const visible = visibleIds
      .map((id) => catalog.find((column) => column.id === id))
      .filter(Boolean)
      .map((column) => ({
        id: column!.id,
        label: column!.label,
        type: column!.type,
        description: column!.description,
      }))

    const hidden = catalog
      .filter((column) => !visibleSet.has(column.id))
      .map((column) => ({
        id: column.id,
        title: column.label,
        description: column.description,
        type: column.type,
      }))

    return { visibleColumns: visible, hiddenColumns: hidden }
  }, [preferencesQuery.data])

  return (
    <ManageMetrics
      moduleName="Venue Category Management"
      isLoading={preferencesQuery.isLoading}
      isSaving={saveMutation.isPending || resetMutation.isPending}
      loadingLabel="Loading column preferences…"
      tableColumns={
        preferencesQuery.data
          ? {
              visible: visibleColumns,
              hidden: hiddenColumns,
              onReset: () => {
                resetMutation.mutate(undefined, {
                  onSuccess: () => toast.success('Column preferences reset to default'),
                  onError: () => toast.error('Failed to reset column preferences'),
                })
              },
            }
          : undefined
      }
      onBack={goBack}
      onCancel={goBack}
      onSave={({ visibleColumnIds }) => {
        if (!visibleColumnIds?.length) {
          toast.error('At least one visible column is required')
          return
        }

        saveMutation.mutate(visibleColumnIds, {
          onSuccess: () => {
            toast.success('Column preferences saved')
            goBack()
          },
          onError: () => toast.error('Failed to save column preferences'),
        })
      }}
    />
  )
}
