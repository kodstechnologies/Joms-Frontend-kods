import type { ColumnDef } from '@tanstack/react-table'

import { EXPERT_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '../config/expert-management-table-columns.config'
import { SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '../config/service-management-table-columns.config'
import { SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '../config/service-category-management-table-columns.config'
import { VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '../config/venue-category-management-table-columns.config'
import { categoryColumns, type Category } from '../components/category/category-table-columns'
import {
  venueCategoryColumns,
  type VenueCategory,
} from '../components/category/venue-category-table-columns'
import type { Expert } from '../type/expert'
import type { Service } from '../type/service'
import {
  buildExportColumnMapFromColumnDefs,
  type ExportColumnMap,
} from '@/shared/utils/export-filter-utils'
import { buildExpertDataColumnsById } from './expert-preference-columns'
import { buildServiceDataColumnsById } from './service-preference-columns'

export const EXPERT_EXPORT_COLUMN_MAP: ExportColumnMap<Expert> = buildExportColumnMapFromColumnDefs(
  buildExpertDataColumnsById(),
  EXPERT_MANAGEMENT_TABLE_COLUMNS_CATALOG,
)

export const SERVICE_EXPORT_COLUMN_MAP: ExportColumnMap<Service> =
  buildExportColumnMapFromColumnDefs(
    buildServiceDataColumnsById(),
    SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  )

export const SERVICE_CATEGORY_EXPORT_COLUMN_MAP: ExportColumnMap<Category> =
  buildExportColumnMapFromColumnDefs(
    categoryColumns,
    SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  )

export const VENUE_CATEGORY_EXPORT_COLUMN_MAP: ExportColumnMap<VenueCategory> =
  buildExportColumnMapFromColumnDefs(
    venueCategoryColumns,
    VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  )

export function buildExportMapFromColumnDefs<T>(
  columns: ColumnDef<T>[] | Record<string, ColumnDef<T>>,
  catalog?: ReadonlyArray<{ id: string; label: string }>,
): ExportColumnMap<T> {
  return buildExportColumnMapFromColumnDefs(columns, catalog)
}
