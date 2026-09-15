import { X, AlertCircle, FileText, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { InPageMediaViewer } from '@/shared/components/media/in-page-media-viewer'
import { updateServiceReport } from '../api/service-api'
import { getApiErrorMessage } from '@/shared/lib/api-error'

export interface ServiceReportItem {
  id: string
  reportId: string
  serviceId: string
  serviceTitle: string
  partnerId: string
  expertName?: string
  reporterType: string
  reporterId: string
  reporterName: string
  issueType: string
  reason: string
  supportingDocuments?: string[]
  hasSupportingDocuments?: boolean
  businessImpact: string
  investigationStatus: string
  investigatingAdmin?: string
  adminWhoEscalated?: string
  finalOutcome?: string
  internalNotes?: string
  complianceReviewRequired?: boolean
  linkedSupportTicket?: string
  createdAt?: string
  submittedAt?: string
}

interface ServiceReportDetailModalProps {
  report: ServiceReportItem | null
  isOpen: boolean
  onClose: () => void
  onUpdated?: () => void
}

export function ServiceReportDetailModal({
  report,
  isOpen,
  onClose,
  onUpdated,
}: ServiceReportDetailModalProps) {
  const [prevReport, setPrevReport] = useState<ServiceReportItem | null>(null)
  const [investigationStatus, setInvestigationStatus] = useState<string>('New')
  const [businessImpact, setBusinessImpact] = useState<string>('Low')
  const [finalOutcome, setFinalOutcome] = useState<string>('')
  const [internalNotes, setInternalNotes] = useState<string>('')
  const [updating, setUpdating] = useState(false)
  const [mediaIndex, setMediaIndex] = useState<number | null>(null)

  if (report !== prevReport) {
    setPrevReport(report)
    if (report) {
      setInvestigationStatus(report.investigationStatus || 'New')
      setBusinessImpact(report.businessImpact || 'Low')
      setFinalOutcome(report.finalOutcome || '')
      setInternalNotes(report.internalNotes || '')
    }
  }

  if (!isOpen || !report) return null

  const handleSave = async () => {
    setUpdating(true)
    try {
      await updateServiceReport(report.id || report.reportId, {
        investigationStatus,
        businessImpact,
        finalOutcome: finalOutcome || undefined,
        internalNotes: internalNotes || undefined,
      })
      toast.success('Service report investigation updated successfully')
      onUpdated?.()
      onClose()
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to update service report'))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0F172A] text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <span className="font-mono text-xs font-semibold text-[#E5B54E]">
              {report.reportId}
            </span>
            <h2 className="text-lg font-bold text-white">Service Report Details</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-800/80 bg-slate-900/60 p-4">
            <div>
              <div className="text-xs text-slate-400">Reported Service</div>
              <div className="font-semibold text-white">{report.serviceTitle}</div>
              <div className="text-[11px] text-slate-400">ID: {report.serviceId}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Reporter</div>
              <div className="font-medium text-slate-200">{report.reporterName}</div>
              <div className="text-[11px] text-slate-400">
                {report.reporterType} (ID: {report.reporterId})
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Issue Type</div>
              <div className="mt-0.5 inline-flex items-center gap-1.5 rounded border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                <AlertCircle className="size-3" />
                {report.issueType}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Submitted Date</div>
              <div className="text-sm font-medium text-slate-300">
                {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Reason / Complaint Description
            </h4>
            <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-300">
              {report.reason}
            </div>
          </div>

          {report.supportingDocuments && report.supportingDocuments.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Supporting Documents ({report.supportingDocuments.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {report.supportingDocuments.map((doc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMediaIndex(idx)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
                  >
                    <FileText className="size-3.5 text-blue-400" />
                    Document {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 border-t border-slate-800 pt-4">
            <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Admin Investigation Controls
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Investigation Status</label>
                <select
                  value={investigationStatus}
                  onChange={(e) => setInvestigationStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="New">New</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Waiting for Response">Waiting for Response</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Business Impact</label>
                <select
                  value={businessImpact}
                  onChange={(e) => setBusinessImpact(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Final Outcome</label>
              <select
                value={finalOutcome}
                onChange={(e) => setFinalOutcome(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">None Selected</option>
                <option value="No Violation">No Violation</option>
                <option value="Warning Issued">Warning Issued</option>
                <option value="Service Suspended">Service Suspended</option>
                <option value="Service Deleted">Service Deleted</option>
                <option value="Refund Approved">Refund Approved</option>
                <option value="Escalated to Legal">Escalated to Legal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Internal Admin Notes</label>
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add investigation notes, findings, or decision details..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={updating}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updating}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <CheckCircle className="mr-1.5 size-4" />
            {updating ? 'Saving...' : 'Save Investigation'}
          </Button>
        </div>
      </div>

      <InPageMediaViewer
        open={mediaIndex != null}
        items={(report.supportingDocuments || []).map((url, idx) => ({
          url,
          title: `Document ${idx + 1}`,
        }))}
        index={mediaIndex ?? 0}
        onClose={() => setMediaIndex(null)}
        onIndexChange={setMediaIndex}
      />
    </div>
  )
}
