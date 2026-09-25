import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addFinanceNote,
  escalateFinanceDispute,
  escalateFinanceRefund,
  escalateFinanceResource,
  fetchFinanceDashboard,
  fetchFinanceDisputeById,
  fetchFinanceDisputes,
  fetchFinanceEscrow,
  fetchFinanceEscrowById,
  fetchFinanceInvoiceById,
  fetchFinanceInvoices,
  fetchFinancePaymentById,
  fetchFinancePayoutById,
  fetchFinancePayouts,
  fetchFinanceReconciliation,
  fetchFinanceRefundById,
  fetchFinanceRefunds,
  fetchFinanceReconciliationById,
  fetchFinanceRevenue,
  fetchFinanceNotes,
  fetchFinanceTax,
  fetchFinanceTaxById,
  issueFinanceRefund,
  markFinanceTaxFiled,
  rejectFinanceDispute,
  rejectFinanceRefund,
  releaseFinanceEscrow,
  releaseFinancePayout,
  requestFinanceDisputeInfo,
  resolveFinanceDispute,
  retryFinancePayout,
  softDeleteFinanceResource,
  updateFinanceDisputeStatus,
  updateFinanceRefundStatus,
} from '../api/finance-api'
import type { FinanceListParams } from '../types/finance-api'

export const financeKeys = {
  dashboard: ['finance-dashboard'] as const,
  revenue: (params?: FinanceListParams) => ['finance-revenue', params] as const,
  payment: (id: string) => ['finance-payment', id] as const,
  escrow: (params?: FinanceListParams) => ['finance-escrow', params] as const,
  escrowDetail: (id: string) => ['finance-escrow-detail', id] as const,
  payouts: (params?: FinanceListParams) => ['finance-payouts', params] as const,
  payout: (id: string) => ['finance-payout', id] as const,
  disputes: (params?: FinanceListParams) => ['finance-disputes', params] as const,
  dispute: (id: string) => ['finance-dispute', id] as const,
  refunds: (params?: FinanceListParams) => ['finance-refunds', params] as const,
  refund: (id: string) => ['finance-refund', id] as const,
  reconciliation: (params?: FinanceListParams) => ['finance-reconciliation', params] as const,
  reconciliationDetail: (id: string) => ['finance-reconciliation-detail', id] as const,
  tax: (params?: FinanceListParams) => ['finance-tax', params] as const,
  taxDetail: (id: string) => ['finance-tax-detail', id] as const,
  invoices: (params?: FinanceListParams) => ['finance-invoices', params] as const,
  invoice: (id: string) => ['finance-invoice', id] as const,
  notes: (id: string) => ['finance-notes', id] as const,
}

export const useFinanceDashboard = () =>
  useQuery({
    queryKey: financeKeys.dashboard,
    queryFn: fetchFinanceDashboard,
  })

export const useFinanceRevenue = (params?: FinanceListParams, enabled = true) =>
  useQuery({
    queryKey: financeKeys.revenue(params),
    queryFn: () => fetchFinanceRevenue(params),
    enabled,
  })

export const useFinancePayment = (id: string) =>
  useQuery({
    queryKey: financeKeys.payment(id),
    queryFn: () => fetchFinancePaymentById(id),
    enabled: !!id,
  })

export const useFinanceEscrow = (params?: FinanceListParams, enabled = true) =>
  useQuery({
    queryKey: financeKeys.escrow(params),
    queryFn: () => fetchFinanceEscrow(params),
    enabled,
  })

export const useFinanceEscrowDetail = (id: string) =>
  useQuery({
    queryKey: financeKeys.escrowDetail(id),
    queryFn: () => fetchFinanceEscrowById(id),
    enabled: !!id,
    refetchOnMount: 'always',
  })

export const useFinancePayouts = (params?: FinanceListParams, enabled = true) =>
  useQuery({
    queryKey: financeKeys.payouts(params),
    queryFn: () => fetchFinancePayouts(params),
    enabled,
  })

export const useFinancePayout = (id: string) =>
  useQuery({
    queryKey: financeKeys.payout(id),
    queryFn: () => fetchFinancePayoutById(id),
    enabled: !!id,
    refetchOnMount: 'always',
  })

export const useFinanceDisputes = (params?: FinanceListParams, enabled = true) =>
  useQuery({
    queryKey: financeKeys.disputes(params),
    queryFn: () => fetchFinanceDisputes(params),
    enabled,
  })

export const useFinanceDispute = (id: string) =>
  useQuery({
    queryKey: financeKeys.dispute(id),
    queryFn: () => fetchFinanceDisputeById(id),
    enabled: !!id,
  })

export const useFinanceRefunds = (params?: FinanceListParams, enabled = true) =>
  useQuery({
    queryKey: financeKeys.refunds(params),
    queryFn: () => fetchFinanceRefunds(params),
    enabled,
  })

export const useFinanceRefund = (id: string) =>
  useQuery({
    queryKey: financeKeys.refund(id),
    queryFn: () => fetchFinanceRefundById(id),
    enabled: !!id,
  })

const invalidateDisputeQueries = (queryClient: ReturnType<typeof useQueryClient>, id: string) => {
  void queryClient.invalidateQueries({ queryKey: ['finance-disputes'] })
  void queryClient.invalidateQueries({ queryKey: financeKeys.dispute(id) })
  void queryClient.invalidateQueries({ queryKey: ['finance-refunds'] })
  void queryClient.invalidateQueries({ queryKey: financeKeys.dashboard })
}

const invalidateRefundQueries = (queryClient: ReturnType<typeof useQueryClient>, id: string) => {
  void queryClient.invalidateQueries({ queryKey: ['finance-refunds'] })
  void queryClient.invalidateQueries({ queryKey: financeKeys.refund(id) })
  void queryClient.invalidateQueries({ queryKey: ['finance-disputes'] })
  void queryClient.invalidateQueries({ queryKey: financeKeys.dashboard })
}

export const useResolveDispute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      refundType,
      partialAmount,
      decisionNotes,
    }: {
      id: string
      refundType: 'full' | 'partial'
      partialAmount?: number | null
      decisionNotes: string
    }) => resolveFinanceDispute(id, { refundType, partialAmount, decisionNotes }),
    onSuccess: (_data, variables) => invalidateDisputeQueries(queryClient, variables.id),
  })
}

export const useRejectDispute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      rejectionReason,
      adminNotes,
    }: {
      id: string
      rejectionReason: string
      adminNotes?: string
    }) => rejectFinanceDispute(id, { rejectionReason, adminNotes }),
    onSuccess: (_data, variables) => invalidateDisputeQueries(queryClient, variables.id),
  })
}

export const useRequestDisputeInfo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      requestInformation,
      adminNotes,
    }: {
      id: string
      requestInformation: string
      adminNotes?: string
    }) => requestFinanceDisputeInfo(id, { requestInformation, adminNotes }),
    onSuccess: (_data, variables) => invalidateDisputeQueries(queryClient, variables.id),
  })
}

export const useEscalateDispute = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      priority,
      adminNotes,
      escalateToAdminId,
      escalateToAdminName,
    }: {
      id: string
      priority?: 'urgent' | 'high' | 'normal'
      adminNotes?: string
      escalateToAdminId?: string
      escalateToAdminName?: string
    }) =>
      escalateFinanceDispute(id, {
        priority,
        adminNotes,
        escalateToAdminId,
        escalateToAdminName,
      }),
    onSuccess: (_data, variables) => invalidateDisputeQueries(queryClient, variables.id),
  })
}

export const useIssueRefund = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      amount,
      reason,
      adminNotes,
    }: {
      id: string
      amount?: number | null
      reason?: string
      adminNotes?: string
    }) => issueFinanceRefund(id, { amount, reason, adminNotes }),
    onSuccess: (_data, variables) => invalidateRefundQueries(queryClient, variables.id),
  })
}

export const useRejectRefund = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason, adminNotes }: { id: string; reason: string; adminNotes?: string }) =>
      rejectFinanceRefund(id, { reason, adminNotes }),
    onSuccess: (_data, variables) => invalidateRefundQueries(queryClient, variables.id),
  })
}

export const useEscalateRefund = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      priority,
      adminNotes,
      escalateToAdminId,
      escalateToAdminName,
    }: {
      id: string
      priority?: 'urgent' | 'high' | 'normal'
      adminNotes?: string
      escalateToAdminId?: string
      escalateToAdminName?: string
    }) =>
      escalateFinanceRefund(id, {
        priority,
        adminNotes,
        escalateToAdminId,
        escalateToAdminName,
      }),
    onSuccess: (_data, variables) => invalidateRefundQueries(queryClient, variables.id),
  })
}

export const useUpdateDisputeStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status: string; adminNote: string }) =>
      updateFinanceDisputeStatus(id, { status, adminNote }),
    onSuccess: (_data, variables) => invalidateDisputeQueries(queryClient, variables.id),
  })
}

export const useUpdateRefundStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status: string; adminNote: string }) =>
      updateFinanceRefundStatus(id, { status, adminNote }),
    onSuccess: (_data, variables) => invalidateRefundQueries(queryClient, variables.id),
  })
}

export const useFinanceReconciliation = (params?: FinanceListParams) =>
  useQuery({
    queryKey: financeKeys.reconciliation(params),
    queryFn: () => fetchFinanceReconciliation(params),
  })

export const useFinanceReconciliationDetail = (id: string) =>
  useQuery({
    queryKey: financeKeys.reconciliationDetail(id),
    queryFn: () => fetchFinanceReconciliationById(id),
    enabled: !!id,
  })

export const useFinanceTax = (params?: FinanceListParams) =>
  useQuery({
    queryKey: financeKeys.tax(params),
    queryFn: () => fetchFinanceTax(params),
  })

export const useFinanceTaxDetail = (id: string) =>
  useQuery({
    queryKey: financeKeys.taxDetail(id),
    queryFn: () => fetchFinanceTaxById(id),
    enabled: !!id,
  })

export const useMarkTaxFiled = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) =>
      markFinanceTaxFiled(id, adminNote),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(financeKeys.taxDetail(variables.id), data)
      void queryClient.invalidateQueries({ queryKey: ['finance-tax-detail'] })
      void queryClient.invalidateQueries({ queryKey: ['finance-tax'] })
      void queryClient.invalidateQueries({ queryKey: financeKeys.dashboard })
    },
  })
}

export const useFinanceInvoices = (params?: FinanceListParams) =>
  useQuery({
    queryKey: financeKeys.invoices(params),
    queryFn: () => fetchFinanceInvoices(params),
  })

export const useFinanceInvoice = (id: string) =>
  useQuery({
    queryKey: financeKeys.invoice(id),
    queryFn: () => fetchFinanceInvoiceById(id),
    enabled: !!id,
  })

export const useReleaseEscrow = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote: string }) =>
      releaseFinanceEscrow(id, adminNote),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['finance-escrow'] })
      queryClient.invalidateQueries({ queryKey: ['finance-escrow-detail'] })
      queryClient.invalidateQueries({ queryKey: financeKeys.escrowDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: ['finance-payouts'] })
      queryClient.invalidateQueries({ queryKey: financeKeys.dashboard })
    },
  })
}

export const useRetryPayout = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote: string }) =>
      retryFinancePayout(id, adminNote),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['finance-payouts'] })
      queryClient.invalidateQueries({ queryKey: ['finance-payout'] })
      queryClient.invalidateQueries({ queryKey: financeKeys.payout(variables.id) })
      queryClient.invalidateQueries({ queryKey: financeKeys.dashboard })
    },
  })
}

export const useReleasePayout = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      adminNote,
      bankReference,
    }: {
      id: string
      adminNote: string
      bankReference: string
    }) => releaseFinancePayout(id, adminNote, bankReference),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['finance-payouts'] })
      queryClient.invalidateQueries({ queryKey: ['finance-payout'] })
      queryClient.invalidateQueries({ queryKey: financeKeys.payout(variables.id) })
      queryClient.invalidateQueries({ queryKey: financeKeys.dashboard })
    },
  })
}

const invalidateFinanceLists = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['finance-revenue'] })
  queryClient.invalidateQueries({ queryKey: ['finance-escrow'] })
  queryClient.invalidateQueries({ queryKey: ['finance-tax'] })
  queryClient.invalidateQueries({ queryKey: ['finance-refunds'] })
  queryClient.invalidateQueries({ queryKey: ['finance-disputes'] })
  queryClient.invalidateQueries({ queryKey: ['finance-reconciliation'] })
  queryClient.invalidateQueries({ queryKey: financeKeys.dashboard })
}

export const useEscalateFinance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      resourceType,
      adminNote,
      escalateToAdminId,
      escalateToAdminName,
      priority,
    }: {
      id: string
      resourceType: string
      adminNote: string
      escalateToAdminId?: string
      escalateToAdminName?: string
      priority?: 'urgent' | 'high' | 'normal'
    }) =>
      escalateFinanceResource(
        id,
        resourceType,
        adminNote,
        escalateToAdminId,
        priority,
        escalateToAdminName,
      ),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.notes(variables.id) })
    },
  })
}

export const useSoftDeleteFinance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      resourceType,
      adminNote,
    }: {
      id: string
      resourceType: string
      adminNote: string
    }) => softDeleteFinanceResource(id, resourceType, adminNote),
    onSuccess: () => {
      invalidateFinanceLists(queryClient)
    },
  })
}

export const useFinanceNotes = (id: string) =>
  useQuery({
    queryKey: financeKeys.notes(id),
    queryFn: () => fetchFinanceNotes(id),
    enabled: !!id,
  })

export const useAddFinanceNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      resourceType,
      adminNote,
    }: {
      id: string
      resourceType: string
      adminNote: string
    }) => addFinanceNote(id, resourceType, adminNote),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.notes(variables.id) })
    },
  })
}
