import { paymentApiClient } from '@/shared/lib/axios'

import type {
  ApiSuccess,
  FinanceDashboardSummary,
  FinanceDispute,
  FinanceEscrowHold,
  FinanceInvoice,
  FinanceListParams,
  FinancePayment,
  FinancePayout,
  FinanceReconciliation,
  FinanceRefund,
  FinanceTaxRecord,
  FinanceAdminNote,
  Paginated,
} from '../types/finance-api'

const getData = async <T>(url: string, params?: FinanceListParams) => {
  const response = await paymentApiClient.get<ApiSuccess<T>>(url, { params })
  return response.data
}

export const fetchFinanceDashboard = async () => {
  const res = await getData<FinanceDashboardSummary>('/admin/finance/dashboard')
  return res
}

export const fetchFinanceRevenue = async (params?: FinanceListParams) => {
  const res = await getData<Paginated<FinancePayment>>('/admin/finance/revenue', params)
  return res
}

export const fetchFinancePaymentById = async (id: string) => {
  const res = await getData<FinancePayment>(`/admin/finance/revenue/${id}`)
  return res
}

export const fetchFinanceEscrow = async (params?: FinanceListParams) => {
  const res = await getData<Paginated<FinanceEscrowHold>>('/admin/finance/escrow', params)
  return res
}

export const fetchFinanceEscrowById = async (id: string) => {
  const res = await getData<FinanceEscrowHold>(`/admin/finance/escrow/${id}`)
  return res
}

export const releaseFinanceEscrow = async (id: string, adminNote: string) => {
  const response = await paymentApiClient.post<ApiSuccess<unknown>>(
    `/admin/finance/escrow/${id}/release`,
    { adminNote },
  )
  return response.data
}

export const fetchFinancePayouts = async (params?: FinanceListParams) => {
  const res = await getData<Paginated<FinancePayout>>('/admin/finance/payouts', params)
  return res
}

export const fetchFinancePayoutById = async (id: string) => {
  const res = await getData<FinancePayout>(`/admin/finance/payouts/${id}`)
  return res
}

export const retryFinancePayout = async (id: string, adminNote: string) => {
  const response = await paymentApiClient.post<ApiSuccess<FinancePayout>>(
    `/admin/finance/payouts/${id}/retry`,
    { adminNote },
  )
  return response.data
}

export const releaseFinancePayout = async (
  id: string,
  adminNote: string,
  bankReference: string,
) => {
  const response = await paymentApiClient.post<ApiSuccess<FinancePayout>>(
    `/admin/finance/payouts/${id}/release`,
    { adminNote, bankReference },
  )
  return response.data
}

export const fetchFinanceDisputes = async (params?: FinanceListParams) => {
  const res = await getData<Paginated<FinanceDispute>>('/admin/finance/disputes', params)
  return res
}

export const fetchFinanceDisputeById = async (id: string) => {
  const res = await getData<FinanceDispute>(`/admin/finance/disputes/${id}`)
  return res
}

export const resolveFinanceDispute = async (
  id: string,
  body: {
    refundType: 'full' | 'partial'
    partialAmount?: number | null
    decisionNotes: string
  },
) => {
  const response = await paymentApiClient.post<
    ApiSuccess<{ dispute: FinanceDispute; refund: FinanceRefund }>
  >(`/admin/finance/disputes/${id}/resolve`, body)
  return response.data
}

export const rejectFinanceDispute = async (
  id: string,
  body: { rejectionReason: string; adminNotes?: string },
) => {
  const response = await paymentApiClient.post<ApiSuccess<FinanceDispute>>(
    `/admin/finance/disputes/${id}/reject`,
    body,
  )
  return response.data
}

export const requestFinanceDisputeInfo = async (
  id: string,
  body: { requestInformation: string; adminNotes?: string },
) => {
  const response = await paymentApiClient.post<ApiSuccess<FinanceDispute>>(
    `/admin/finance/disputes/${id}/request-info`,
    body,
  )
  return response.data
}

export const escalateFinanceDispute = async (
  id: string,
  body: {
    priority?: 'urgent' | 'high' | 'normal'
    adminNotes?: string
    escalateToAdminId?: string
    escalateToAdminName?: string
  },
) => {
  const response = await paymentApiClient.post<ApiSuccess<FinanceDispute>>(
    `/admin/finance/disputes/${id}/escalate`,
    body,
  )
  return response.data
}

export const fetchFinanceRefunds = async (params?: FinanceListParams) => {
  const res = await getData<Paginated<FinanceRefund>>('/admin/finance/refunds', params)
  return res
}

export const fetchFinanceRefundById = async (id: string) => {
  const res = await getData<FinanceRefund>(`/admin/finance/refunds/${id}`)
  return res
}

export const issueFinanceRefund = async (
  id: string,
  body: { amount?: number | null; reason?: string; adminNotes?: string } = {},
) => {
  const response = await paymentApiClient.post<ApiSuccess<FinanceRefund>>(
    `/admin/finance/refunds/${id}/issue`,
    body,
  )
  return response.data
}

export const rejectFinanceRefund = async (
  id: string,
  body: { reason: string; adminNotes?: string },
) => {
  const response = await paymentApiClient.post<ApiSuccess<FinanceRefund>>(
    `/admin/finance/refunds/${id}/reject`,
    body,
  )
  return response.data
}

export const escalateFinanceRefund = async (
  id: string,
  body: {
    priority?: 'urgent' | 'high' | 'normal'
    adminNotes?: string
    escalateToAdminId?: string
    escalateToAdminName?: string
  },
) => {
  const response = await paymentApiClient.post<ApiSuccess<FinanceRefund>>(
    `/admin/finance/refunds/${id}/escalate`,
    body,
  )
  return response.data
}

export const updateFinanceDisputeStatus = async (
  id: string,
  body: { status: string; adminNote: string },
) => {
  const response = await paymentApiClient.post<ApiSuccess<FinanceDispute>>(
    `/admin/finance/disputes/${id}/status`,
    body,
  )
  return response.data
}

export const updateFinanceRefundStatus = async (
  id: string,
  body: { status: string; adminNote: string },
) => {
  const response = await paymentApiClient.post<ApiSuccess<FinanceRefund>>(
    `/admin/finance/refunds/${id}/status`,
    body,
  )
  return response.data
}

export const seedFinanceRefundCase = async (body: {
  mode: 'refund_request' | 'chargeback'
  module?: 'service' | 'venue'
  paymentSource?: 'mid_state'
  paymentId?: string
  amount?: number
  reason?: string
}) => {
  const response = await paymentApiClient.post<
    ApiSuccess<{
      mode: string
      paymentSource?: string
      payment: {
        orderId: string
        module: string
        amount: number
        status?: string
        fulfillmentStatus?: string
        settlementStatus?: string
      }
      dispute: { _id: string; disputeId: string; caseType: string }
      refund: { _id: string; refundId: string; status: string } | null
    }>
  >('/admin/finance/refunds/seed', {
    paymentSource: 'mid_state',
    ...body,
  })
  return response.data
}

export const fetchFinanceReconciliation = async (params?: FinanceListParams) => {
  const res = await getData<Paginated<FinanceReconciliation>>(
    '/admin/finance/reconciliation',
    params,
  )
  return res
}

export const fetchFinanceReconciliationById = async (id: string) => {
  const res = await getData<FinanceReconciliation>(`/admin/finance/reconciliation/${id}`)
  return res
}

export const fetchFinanceTax = async (params?: FinanceListParams) => {
  const res = await getData<Paginated<FinanceTaxRecord>>('/admin/finance/tax', params)
  return res
}

export const fetchFinanceTaxById = async (id: string) => {
  const res = await getData<FinanceTaxRecord>(`/admin/finance/tax/${id}`)
  return res
}

export const markFinanceTaxFiled = async (id: string, adminNote?: string) => {
  const response = await paymentApiClient.post<ApiSuccess<FinanceTaxRecord>>(
    `/admin/finance/tax/${id}/file`,
    { adminNote: adminNote || 'Marked as filed' },
  )
  return response.data
}

export const fetchFinanceInvoices = async (params?: FinanceListParams) => {
  const res = await getData<Paginated<FinanceInvoice>>('/admin/finance/invoices', params)
  return res
}

export const fetchFinanceInvoiceById = async (id: string) => {
  const res = await getData<FinanceInvoice>(`/admin/finance/invoices/${id}`)
  return res
}

export const softDeleteFinanceResource = async (
  id: string,
  resourceType: string,
  adminNote: string,
) => {
  const response = await paymentApiClient.post<ApiSuccess<unknown>>(
    `/admin/finance/${id}/soft-delete`,
    { resourceType, adminNote },
  )
  return response.data
}

export const addFinanceNote = async (id: string, resourceType: string, adminNote: string) => {
  const response = await paymentApiClient.post<ApiSuccess<FinanceAdminNote>>(
    `/admin/finance/${id}/notes`,
    {
      resourceType,
      adminNote,
    },
  )
  return response.data
}

export const escalateFinanceResource = async (
  id: string,
  resourceType: string,
  adminNote: string,
  escalateToAdminId?: string,
  priority?: 'urgent' | 'high' | 'normal',
  escalateToAdminName?: string,
) => {
  const response = await paymentApiClient.post<ApiSuccess<unknown>>(
    `/admin/finance/${id}/escalate`,
    { resourceType, adminNote, escalateToAdminId, escalateToAdminName, priority },
  )
  return response.data
}

export const fetchFinanceNotes = async (id: string) => {
  const res = await getData<FinanceAdminNote[]>(`/admin/finance/${id}/notes`)
  return res
}

export const backfillFinanceArtifacts = async (body?: { paymentId?: string; limit?: number }) => {
  const response = await paymentApiClient.post<
    ApiSuccess<{
      processed: number
      results: Array<{
        orderId: string
        module?: string
        skipped?: boolean
        reason?: string
        taxRecordsCreated?: number
        reconciliationId?: string | null
        reconciliationStatus?: string | null
      }>
    }>
  >('/admin/finance/backfill-artifacts', body ?? {})
  return response.data
}
