import type { ColumnDef } from '@tanstack/react-table'

import {
  EXPERT_MANAGEMENT_TABLE_COLUMNS_CATALOG,
  EXPERT_REPORTED_TABLE_COLUMNS_CATALOG,
} from '../config/expert-management-table-columns.config'
import { SERVICE_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '../config/service-management-table-columns.config'
import { SERVICE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '../config/service-category-management-table-columns.config'
import { VENUE_CATEGORY_MANAGEMENT_TABLE_COLUMNS_CATALOG } from '../config/venue-category-management-table-columns.config'
import {
  VENUE_DELETED_TABLE_COLUMNS_CATALOG,
  VENUE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
  VENUE_REPORTED_TABLE_COLUMNS_CATALOG,
  VENUE_SUSPENDED_TABLE_COLUMNS_CATALOG,
} from '../config/venue-management-table-columns.config'
import { categoryColumns, type Category } from '../components/category/category-table-columns'
import type { ExpertReportItem } from '../components/expert-report-detail-modal'
import type { VenueReportItem } from '../components/venue-report-detail-modal'
import {
  venueCategoryColumns,
  type VenueCategory,
} from '../components/category/venue-category-table-columns'
import type { Expert } from '../type/expert'
import type { Service } from '../type/service'
import type { Venue } from '../type/venue'
import {
  buildExportColumnMapFromColumnDefs,
  type ExportColumnMap,
} from '@/shared/utils/export-filter-utils'
import {
  buildExpertDataColumnsById,
  buildExpertReportDataColumnsById,
} from './expert-preference-columns'
import { buildServiceDataColumnsById } from './service-preference-columns'
import {
  buildVenueDataColumnsById,
  buildVenueReportDataColumnsById,
} from './venue-preference-columns'

export const EXPERT_EXPORT_COLUMN_MAP: ExportColumnMap<Expert> = buildExportColumnMapFromColumnDefs(
  buildExpertDataColumnsById(),
  EXPERT_MANAGEMENT_TABLE_COLUMNS_CATALOG,
)

export const EXPERT_REPORTED_EXPORT_COLUMN_MAP: ExportColumnMap<ExpertReportItem> =
  buildExportColumnMapFromColumnDefs(
    buildExpertReportDataColumnsById(),
    EXPERT_REPORTED_TABLE_COLUMNS_CATALOG,
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

const venueDataColumns = buildVenueDataColumnsById()

export const VENUE_SUSPENDED_EXPORT_COLUMN_MAP: ExportColumnMap<Venue> =
  buildExportColumnMapFromColumnDefs(venueDataColumns, VENUE_SUSPENDED_TABLE_COLUMNS_CATALOG)

export const VENUE_DELETED_EXPORT_COLUMN_MAP: ExportColumnMap<Venue> =
  buildExportColumnMapFromColumnDefs(venueDataColumns, VENUE_DELETED_TABLE_COLUMNS_CATALOG)

export const VENUE_PENDING_EXPORT_COLUMN_MAP: ExportColumnMap<Venue> =
  buildExportColumnMapFromColumnDefs(
    venueDataColumns,
    VENUE_PENDING_APPROVALS_TABLE_COLUMNS_CATALOG,
  )

export const VENUE_REPORTED_EXPORT_COLUMN_MAP: ExportColumnMap<VenueReportItem> =
  buildExportColumnMapFromColumnDefs(
    buildVenueReportDataColumnsById(),
    VENUE_REPORTED_TABLE_COLUMNS_CATALOG,
  )

export function buildExportMapFromColumnDefs<T>(
  columns: ColumnDef<T>[] | Record<string, ColumnDef<T>>,
  catalog?: ReadonlyArray<{ id: string; label: string }>,
): ExportColumnMap<T> {
  return buildExportColumnMapFromColumnDefs(columns, catalog)
}
