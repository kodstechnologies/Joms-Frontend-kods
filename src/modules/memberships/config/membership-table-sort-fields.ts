import { MEMBERSHIPS_TABLE_COLUMNS_CATALOG } from './membership-management-table-columns.config'
import { buildCatalogSortFieldMap } from '@/shared/utils/table-sort-field-maps'

export const EXPERT_MEMBERSHIP_SORT_FIELD_MAP = buildCatalogSortFieldMap(
  MEMBERSHIPS_TABLE_COLUMNS_CATALOG,
  {
    'user-id': 'partnerId',
    username: 'partnerName',
    'plan-id': 'planId',
    'plan-cycle': 'billingCycleName',
    'subscription-status': 'status',
    'expiry-at': 'expiresAt',
    'price-paid': 'purchasedPrice',
    'payment-status': 'paymentStatus',
    'payment-method': 'paymentMethod',
    'transaction-id': 'transactionId',
    'previous-plan-name': 'previousPlanName',
    'auto-renewal': 'autoRenew',
    source: 'source',
    'coupon-code': 'couponCode',
    'discount-amount': 'discountAmount',
    'last-renewed-at': 'lastRenewedAt',
    'updated-at': 'updatedAt',
  },
)
