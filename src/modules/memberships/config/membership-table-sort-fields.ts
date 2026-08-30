import { MEMBERSHIPS_TABLE_COLUMNS_CATALOG } from './membership-management-table-columns.config'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'

/** UI column id → membership-service subscription list sort field. */
export const EXPERT_MEMBERSHIP_SORT_FIELD_MAP = buildCatalogSortFieldMap(
  MEMBERSHIPS_TABLE_COLUMNS_CATALOG,
  {
    'user-id': 'partnerId',
    username: 'partnerName',
    'plan-cycle': 'billingCycleName',
    'subscription-status': 'status',
    'expiry-at': 'expiresAt',
    'price-paid': 'purchasedPrice',
    'auto-renewal': 'autoRenew',
    'plan-id': null,
    'payment-status': null,
    'payment-method': null,
    'transaction-id': null,
    'previous-plan-name': null,
    source: null,
    'coupon-code': null,
    'discount-amount': null,
    'last-renewed-at': null,
    'updated-at': null,
  },
)
