import { X, Building2, AlertCircle, FileText, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { InPageMediaViewer } from '@/shared/components/media/in-page-media-viewer'
import { updateVenueReport } from '../api/venue-api'
import { getApiErrorMessage } from '@/shared/lib/api-error'

export interface VenueReportItem {
  id: string
  reportId: string
  venueId: string
  venueName: string
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
  escalatedBy?: string
  escalationReason?: string
  escalatedAt?: string
  complianceStatus?: string
  createdAt?: string
  submittedAt?: string
}

interface VenueReportDetailModalProps {
  report: VenueReportItem | null
  isOpen: boolean
  onClose: () => void
  onUpdated?: () => void
}

export function VenueReportDetailModal({
  report,
  isOpen,
  onClose,
  onUpdated,
}: VenueReportDetailModalProps) {
  const [prevReport, setPrevReport] = useState<VenueReportItem | null>(null)
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

  const submittedAt = report.submittedAt || report.createdAt

  const handleSave = async () => {
    setUpdating(true)
    try {
      await updateVenueReport(report.id || report.reportId, {
        investigationStatus,
        businessImpact,
        finalOutcome: finalOutcome || undefined,
        internalNotes: internalNotes || undefined,
      })
      toast.success('Venue report investigation updated successfully')
      onUpdated?.()
      onClose()
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to update venue report'))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-[#050505]/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-white/10 bg-[#141414] text-white shadow-2xl transition-transform duration-300">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#E5B54E]/15 p-2 text-[#E5B54E]">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Report Details ({report.reportId})</h2>
              <p className="text-xs text-white/50">
                Filed on {submittedAt ? new Date(submittedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto bg-[#141414] p-6">
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/50 uppercase">
              <Building2 className="size-4 text-[#E5B54E]" /> Reported Venue & Reporter
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-white/40">Reported Venue:</span>
                <span className="text-sm font-semibold text-white">{report.venueName}</span>
                <span className="block text-[11px] text-white/40">ID: {report.venueId}</span>
              </div>
              <div>
                <span className="block text-white/40">Reported By ({report.reporterType}):</span>
                <span className="text-sm font-semibold text-white">{report.reporterName}</span>
                <span className="block text-[11px] text-white/40">ID: {report.reporterId}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-[#050505] p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/50 uppercase">
              <FileText className="size-4 text-[#E5B54E]" /> Issue Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-white/40">Issue Category:</span>
                <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 font-semibold text-red-400">
                  {report.issueType}
                </span>
              </div>
              <div>
                <span className="mb-1 block text-white/40">Reason / Description:</span>
                <p className="rounded-lg border border-white/5 bg-[#141414] p-3 leading-relaxed text-white/85">
                  {report.reason}
                </p>
              </div>
              {report.supportingDocuments && report.supportingDocuments.length > 0 ? (
                <div>
                  <span className="mb-1 block text-white/40">Supporting Documents:</span>
                  <div className="flex flex-wrap gap-2">
                    {report.supportingDocuments.map((docUrl, idx) => (
                      <button
                        key={docUrl || idx}
                        type="button"
                        onClick={() => setMediaIndex(idx)}
                        className="rounded bg-white/5 px-2.5 py-1 text-xs text-[#E5B54E] hover:underline"
                      >
                        Attachment {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-white/10 bg-[#050505] p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/50 uppercase">
              <CheckCircle className="size-4 text-[#E5B54E]" /> Admin Investigation Workflow
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="mb-1 block text-white/50">Investigation Status</label>
                <select
                  value={investigationStatus}
                  onChange={(e) => setInvestigationStatus(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#141414] p-2 text-white focus:border-[#E5B54E] focus:outline-none"
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
                <label className="mb-1 block text-white/50">Business Impact</label>
                <select
                  value={businessImpact}
                  onChange={(e) => setBusinessImpact(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#141414] p-2 text-white focus:border-[#E5B54E] focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-white/50">Final Outcome (on closure)</label>
              <select
                value={finalOutcome}
                onChange={(e) => setFinalOutcome(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#141414] p-2 text-white focus:border-[#E5B54E] focus:outline-none"
              >
                <option value="">-- Select Final Outcome --</option>
                <option value="No Violation">No Violation</option>
                <option value="Warning Issued">Warning Issued</option>
                <option value="Venue Suspended">Venue Suspended</option>
                <option value="Venue Deleted">Venue Deleted</option>
                <option value="Refund Approved">Refund Approved</option>
                <option value="Escalated to Legal">Escalated to Legal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-white/50">Internal Admin Notes</label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={3}
                placeholder="Enter private investigation notes..."
                className="w-full rounded-lg border border-white/10 bg-[#141414] p-2 text-white placeholder:text-white/30 focus:border-[#E5B54E] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-[#141414] p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-white/10 bg-[#050505] text-white/80 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={updating}
            className="bg-[#E5B54E] font-semibold text-[#050505] hover:bg-[#d4a53d]"
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <InPageMediaViewer
        open={mediaIndex != null}
        items={(report.supportingDocuments || []).map((url, idx) => ({
          url,
          title: `Attachment ${idx + 1}`,
        }))}
        index={mediaIndex ?? 0}
        onClose={() => setMediaIndex(null)}
        onIndexChange={setMediaIndex}
      />
    </>
  )
}
