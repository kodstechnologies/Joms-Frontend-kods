import type { ModuleFilterConfig } from '@/shared/types/data-filter'

export const servicePerformanceFilterConfig: ModuleFilterConfig = {
  moduleKey: 'service-performance',
  moduleName: 'Service Performance',
  sections: [
    {
      id: 'by-order',
      title: 'By Order',
      defaultExpanded: true,
      fields: [
        { id: 'dateRange', label: 'Date Range', type: 'date-range' },
        {
          id: 'orderStatus',
          label: 'Order Status',
          type: 'checkbox-group',
          options: [
            { label: 'Completed', value: 'completed' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Pending', value: 'pending' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Declined', value: 'declined' },
          ],
        },
        {
          id: 'pricingType',
          label: 'Pricing Type',
          type: 'checkbox-group',
          options: [
            { label: 'Fixed', value: 'fixed' },
            { label: 'Tiered', value: 'tiered' },
            { label: 'Custom', value: 'custom' },
            { label: 'Milestone', value: 'milestone' },
          ],
        },
        { id: 'priceRange', label: 'Price Range', type: 'number-range' },
        { id: 'ratingRange', label: 'Rating Range', type: 'number-range' },
      ],
    },
    {
      id: 'by-payment',
      title: 'By Payment',
      fields: [
        {
          id: 'paymentMethod',
          label: 'Payment Method',
          type: 'checkbox-group',
          options: [
            { label: 'Card', value: 'card' },
            { label: 'UPI/Wallet', value: 'upi' },
            { label: 'Bank Transfer', value: 'bank_transfer' },
            { label: 'Cash', value: 'cash' },
          ],
        },
        {
          id: 'payoutStatus',
          label: 'Payout Status',
          type: 'checkbox-group',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Processed', value: 'processed' },
            { label: 'Failed', value: 'failed' },
            { label: 'Successful', value: 'successful' },
          ],
        },
        {
          id: 'refundStatus',
          label: 'Refund Status',
          type: 'checkbox-group',
          options: [
            { label: 'No Refund', value: 'none' },
            { label: 'Refunded', value: 'processed' },
            { label: 'Refund Pending', value: 'pending' },
            { label: 'Refund Failed', value: 'failed' },
          ],
        },
        {
          id: 'disputeStatus',
          label: 'Dispute Status',
          type: 'checkbox-group',
          options: [
            { label: 'Disputed', value: 'disputed' },
            { label: 'Not Disputed', value: 'not_disputed' },
          ],
        },
      ],
    },
  ],
  exportSections: [],
}
