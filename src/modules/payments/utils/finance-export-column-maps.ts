import type {
  EscrowHoldRow,
  FinanceReconciliationRow,
  FinanceServiceRow,
  FinanceVenueRow,
  RefundChargebackRow,
  TaxComplianceRow,
} from '../types/finance-table-rows'
import { FINANCE_SERVICES_TABLE_COLUMNS_CATALOG } from '../config/finance-services-table-columns.config'
import { FINANCE_VENUES_TABLE_COLUMNS_CATALOG } from '../config/finance-venues-table-columns.config'
import { FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG } from '../config/finance-refunds-table-columns.config'
import { FINANCE_TAX_TABLE_COLUMNS_CATALOG } from '../config/finance-tax-table-columns.config'
import { FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG } from '../config/finance-reconciliation-table-columns.config'
import { FINANCE_ESCROW_TABLE_COLUMNS_CATALOG } from '../config/finance-escrow-table-columns.config'
import {
  buildExportColumnMapFromCatalog,
  type ExportColumnMap,
} from '@/shared/utils/export-filter-utils'

export const FINANCE_SERVICES_EXPORT_COLUMN_MAP: ExportColumnMap<FinanceServiceRow> =
  buildExportColumnMapFromCatalog(FINANCE_SERVICES_TABLE_COLUMNS_CATALOG, {
    'service-id': (row) => row.serviceId,
    name: (row) => row.name,
    'expert-name': (row) => row.expertName,
    'booking-id': (row) => row.bookingId,
    'user-name': (row) => row.userName,
    status: (row) => row.status,
    revenue: (row) => row.revenue,
    'related-entity-id': (row) => row.serviceId,
    'client-name': (row) => row.userName,
    'partner-name': (row) => row.expertName,
    'gross-amount': (row) => row.revenue,
    'transaction-status': (row) => row.status,
  })

export const FINANCE_VENUES_EXPORT_COLUMN_MAP: ExportColumnMap<FinanceVenueRow> =
  buildExportColumnMapFromCatalog(FINANCE_VENUES_TABLE_COLUMNS_CATALOG, {
    'venue-id': (row) => row.venueId,
    name: (row) => row.name,
    owner: (row) => row.owner,
    'booking-id': (row) => row.bookingId,
    'booking-title': (row) => row.bookingTitle,
    status: (row) => row.status,
    revenue: (row) => row.revenue,
    'related-entity-id': (row) => row.venueId,
    'client-name': (row) => row.owner,
    'gross-amount': (row) => row.revenue,
    'transaction-status': (row) => row.status,
  })

export const FINANCE_REFUNDS_EXPORT_COLUMN_MAP: ExportColumnMap<RefundChargebackRow> =
  buildExportColumnMapFromCatalog(FINANCE_REFUNDS_TABLE_COLUMNS_CATALOG, {
    'refund-id': (row) => row.recordId,
    'refund-type': (row) => row.type,
    'refund-reason': (row) => row.reason,
    'refund-amount': (row) => row.amount,
    'refund-date': (row) => row.initiatedDate,
    status: (row) => row.status,
    'customer-name': (row) => row.relatedEntity,
    'chargeback-flag': (row) => row.kind,
  })

export const FINANCE_TAX_EXPORT_COLUMN_MAP: ExportColumnMap<TaxComplianceRow> =
  buildExportColumnMapFromCatalog(FINANCE_TAX_TABLE_COLUMNS_CATALOG, {
    'tax-record-id': (row) => row.recordId,
    'transaction-id': (row) => row.bookingId,
    module: (row) => row.entityType,
    region: (row) => row.owner,
    'tax-type': (row) => row.entityId,
    'tax-amount': (row) => row.revenue,
    'filing-status': (row) => row.status,
    'invoice-number': (row) => row.bookingTitle,
  })

export const FINANCE_RECONCILIATION_EXPORT_COLUMN_MAP: ExportColumnMap<FinanceReconciliationRow> =
  buildExportColumnMapFromCatalog(FINANCE_RECONCILIATION_TABLE_COLUMNS_CATALOG, {
    'reconciliation-id': (row) => row.reconciliationId,
    gateway: (row) => row.gateway,
    'transaction-id': (row) => row.transactionId,
    'platform-record-id': (row) => row.platformRecordId,
    'platform-amount': (row) => row.platformAmount,
    'gateway-amount': (row) => row.gatewayAmount,
    difference: (row) => row.difference,
    status: (row) => row.difference,
  })

export const FINANCE_ESCROW_EXPORT_COLUMN_MAP: ExportColumnMap<EscrowHoldRow> =
  buildExportColumnMapFromCatalog(FINANCE_ESCROW_TABLE_COLUMNS_CATALOG, {
    'escrow-id': (row) => row.escrowId,
    'transaction-id': (row) => row.transactionId,
    module: (row) => row.type,
    amount: (row) => row.amount,
    'hold-reason': (row) => row.holdReason,
    'hold-created-at': (row) => row.initiatedDate,
    'expected-release': (row) => row.expectedRelease,
    'release-status': (row) => row.status,
  })
