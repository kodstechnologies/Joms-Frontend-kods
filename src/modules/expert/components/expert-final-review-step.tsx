import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import digilockerIcon from '@/assets/JOMS_ICONS-2/icons8-document_FAQ_digilocker.svg'

import {
  formatExperience,
  type ExpertOnboardingFormData,
  type ExpertWorkExperienceEntry,
} from '../utils/expert-onboarding-form'
import { DocumentReviewViewer } from './document-review-viewer'

type Props = {
  formData: ExpertOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpertOnboardingFormData>>
  expertId?: string | null
}

const naValue = (value?: string | null) => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string' && value.trim() === '') return 'N/A'
  return value
}

const formatReviewDate = (value?: string) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const formatWorkDateRange = (startDate?: string, endDate?: string, currentlyWorking?: boolean) => {
  const start = formatReviewDate(startDate)
  const end = currentlyWorking ? 'Present' : formatReviewDate(endDate)
  return `${start} - ${end}`
}

const formatFileMeta = (file: File | null, fileName: string) => {
  const name = file?.name || fileName
  if (!name) return 'N/A'

  const extension = name.includes('.') ? name.split('.').pop()?.toUpperCase() : 'FILE'
  const sizeMb = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : null
  const uploadedOn = new Date().toLocaleDateString('en-GB')

  return [extension, sizeMb, uploadedOn].filter(Boolean).join(' • ')
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="text-muted text-xs">{label}</span>
    <span className="max-w-[60%] text-right text-xs font-medium text-white">{value}</span>
  </div>
)

const VerifiedRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 py-2">
    <span className="text-muted text-xs">{label}</span>
    <span className="flex items-center gap-2 text-xs font-medium text-white">
      {naValue(value)}
      <CheckCircle2 className="text-brand-positive size-4" />
    </span>
  </div>
)

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mt-6 mb-3 border-b border-white/5 pb-2 text-sm font-bold text-white">
    {children}
  </h3>
)

type PartnerDocumentType = 'pan-card' | 'certificate' | 'gst-certificate'

type PreviewItem = {
  url: string
  title: string
  fileName?: string
  mimeType?: string
  kind?: 'gallery' | 'document'
  partnerId?: string
  documentType?: PartnerDocumentType
  file?: File
}

const DocumentCard = ({
  label,
  file,
  fileName,
  fileUrl,
  partnerId,
  documentType,
  onView,
}: {
  label: string
  file: File | null
  fileName: string
  fileUrl: string
  partnerId?: string | null
  documentType?: PartnerDocumentType
  onView: (item: PreviewItem) => void
}) => {
  const blobUrl = useMemo(() => {
    if (!file) return null
    // Ensure Blob has proper PDF MIME type if it's a PDF to avoid Chrome viewer errors
    const isPdf = fileName.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
    if (isPdf && file.type !== 'application/pdf') {
      return URL.createObjectURL(new Blob([file], { type: 'application/pdf' }))
    }
    return URL.createObjectURL(file)
  }, [file, fileName])
  const previewUrl = blobUrl || fileUrl
  const hasFile = Boolean(previewUrl || fileName.trim())

  useEffect(() => {}, [blobUrl])

  const handleView = () => {
    if (!previewUrl && !file) return

    onView({
      url: previewUrl || '',
      title: label,
      fileName: file?.name || fileName,
      mimeType: file?.type,
      kind: 'document',
      ...(file ? { file } : {}),
      ...(!file && partnerId && documentType && fileUrl ? { partnerId, documentType } : {}),
    })
  }

  return (
    <div className="rounded-lg border border-white/5 bg-black p-4">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 size-4 shrink-0 rounded-full border border-white/10" />
        <div className="min-w-0">
          <p className="text-body-sm-semibold truncate text-white">{label}</p>
          <p className="text-muted text-[10px]">
            {hasFile ? formatFileMeta(file, fileName) : 'Not uploaded'}
          </p>
        </div>
      </div>
      {hasFile ? (
        <button
          type="button"
          onClick={handleView}
          className="text-body-sm bg-brand-surface mt-3 flex w-full items-center justify-center gap-1.5 rounded-md py-2 font-semibold text-white transition-colors hover:bg-white/7 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <img src={digilockerIcon} alt="" className="size-3.5 brightness-0 invert" />
          View Document
        </button>
      ) : (
        <div className="text-body-sm bg-brand-surface text-muted mt-3 flex w-full items-center justify-center rounded-md py-2 font-medium">
          Not uploaded
        </div>
      )}
    </div>
  )
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 py-2.5">
    <span className="text-muted text-xs">{label}</span>
    <span className="text-right text-xs font-medium text-white">{naValue(value)}</span>
  </div>
)

const WorkExperienceDetailModal = ({
  entry,
  onClose,
}: {
  entry: ExpertWorkExperienceEntry
  onClose: () => void
}) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
    onClick={onClose}
  >
    <div
      className="ui-modal-shell w-full max-w-[520px]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="ui-modal-header">
        <h2 className="text-lg font-semibold text-white">Work Experience</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close work experience details"
          className="hover:text-brand-accent text-white transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="ui-modal-body">
        <div className="rounded-xl border border-white/10 bg-black p-5">
          <p className="text-muted mb-4 text-xs">Work Experience Details</p>

          <DetailRow label="Job Title" value={entry.jobTitle} />
          <DetailRow label="Company Name" value={entry.companyName} />
          <DetailRow label="Employment Type" value={entry.employmentType} />
          <DetailRow
            label="Date"
            value={formatWorkDateRange(entry.startDate, entry.endDate, entry.currentlyWorking)}
          />

          <div className="my-4 border-t border-white/10" />

          <p className="text-muted mb-2 text-xs">Description</p>
          <p className="text-sm leading-relaxed text-white">{naValue(entry.description)}</p>
        </div>
      </div>
    </div>
  </div>
)

const WorkHistoryCard = ({
  jobTitle,
  companyName,
  employmentType,
  startDate,
  endDate,
  currentlyWorking,
  onClick,
}: {
  jobTitle: string
  companyName: string
  employmentType: string
  startDate: string
  endDate: string
  currentlyWorking: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className="hover:border-brand-accent/30 hover:bg-brand-bg w-full rounded-lg border border-white/10 bg-black p-4 text-left transition-colors"
  >
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-bold text-white">{naValue(jobTitle)}</p>
      <span className="text-body-sm text-muted shrink-0">
        {formatWorkDateRange(startDate, endDate, currentlyWorking)}
      </span>
    </div>
    <p className="text-muted mt-2 text-xs">{naValue(companyName)}</p>
    <p className="text-muted mt-1 text-xs">{naValue(employmentType)}</p>
  </button>
)

export const ExpertFinalReviewStep = ({ formData, setFormData, expertId }: Props) => {
  const [selectedWorkExperience, setSelectedWorkExperience] =
    useState<ExpertWorkExperienceEntry | null>(null)
  const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null)

  const workHistoryEntries = formData.workExperience.filter((w) => w.jobTitle.trim())

  return (
    <>
      <DocumentReviewViewer
        open={!!previewItem}
        url={previewItem?.url || ''}
        filename={previewItem?.fileName || previewItem?.title || ''}
        mimeType={previewItem?.mimeType}
        actionsDisabled={true}
        reasonOptions={[]}
        onClose={() => setPreviewItem(null)}
        onSubmitDecision={() => {}}
      />

      {selectedWorkExperience && (
        <WorkExperienceDetailModal
          entry={selectedWorkExperience}
          onClose={() => setSelectedWorkExperience(null)}
        />
      )}

      <div className="mx-auto w-full max-w-[1140px] space-y-4">
        <div className="bg-brand-surface overflow-hidden rounded-lg border border-white/5">
          <div className="relative h-28 bg-gradient-to-r from-slate-700 to-slate-900">
            {formData.coverImageUrl && (
              <img
                src={formData.coverImageUrl}
                alt="Cover"
                className="h-full w-full object-cover"
              />
            )}
            <div className="border-brand-surface absolute -bottom-7 left-6 size-16 overflow-hidden rounded-full border-4 bg-slate-600">
              {formData.profileImageUrl && (
                <img
                  src={formData.profileImageUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="px-6 pt-10 pb-6">
            <h2 className="text-sm font-bold text-white">Review &amp; Create Account</h2>
            <p className="text-muted mt-1 text-xs">User verification before account creation</p>

            <SectionTitle>Basic Profile Information</SectionTitle>
            <InfoRow label="Full Name" value={naValue(formData.fullname)} />
            <InfoRow label="Location" value={naValue(formData.location)} />
            <InfoRow label="Profile Bio" value={naValue(formData.bio)} />

            <SectionTitle>Professional Information</SectionTitle>
            <InfoRow label="Industry" value={naValue(formData.industry)} />
            <InfoRow
              label="Experience"
              value={formatExperience(formData.experienceYears, formData.experienceMonths)}
            />
            <InfoRow
              label="Service Type"
              value={
                formData.serviceType
                  ? formData.serviceType.charAt(0).toUpperCase() + formData.serviceType.slice(1)
                  : 'N/A'
              }
            />
            <InfoRow
              label="Service Category"
              value={
                formData.serviceCategory.length > 0 ? formData.serviceCategory.join(', ') : 'N/A'
              }
            />
            <div className="py-2">
              <span className="text-muted text-xs">Service Offerings</span>
              <div className="mt-2 flex flex-wrap justify-end gap-2">
                {formData.offerings.length > 0 ? (
                  formData.offerings.map((offering) => (
                    <span
                      key={offering}
                      className="bg-brand-accent/15 text-brand-accent rounded-full px-2.5 py-1 text-[10px] font-medium"
                    >
                      {offering}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-medium text-white">N/A</span>
                )}
              </div>
            </div>
            <InfoRow
              label="Sample Work Link"
              value={
                formData.sampleWorkLink ? (
                  <a
                    href={formData.sampleWorkLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-accent underline"
                  >
                    {formData.sampleWorkLink}
                  </a>
                ) : (
                  'N/A'
                )
              }
            />

            <SectionTitle>Primary Verification</SectionTitle>
            <VerifiedRow label="Email" value={formData.email} />
            <VerifiedRow label="Phone" value={formData.phoneNumber} />

            <SectionTitle>Identity Verification</SectionTitle>
            <VerifiedRow label="ID Type" value={formData.idType} />
            <VerifiedRow label="ID Number" value={formData.idNumber} />
            <InfoRow label="GST Availability" value={formData.gstAvailable ? 'Yes' : 'No'} />
            {formData.gstAvailable && <VerifiedRow label="GST Number" value={formData.gstNumber} />}
            <VerifiedRow label="PAN Number" value={formData.panNumber} />

            <SectionTitle>Documents Uploaded</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <DocumentCard
                label="PAN Card"
                file={formData.panCardFile}
                fileName={formData.panCardFileName}
                fileUrl={formData.panCardFileUrl}
                partnerId={expertId}
                documentType="pan-card"
                onView={setPreviewItem}
              />
              <DocumentCard
                label="Certificates or License & Permits"
                file={formData.certificateFile}
                fileName={formData.certificateFileName}
                fileUrl={formData.certificateFileUrl}
                partnerId={expertId}
                documentType="certificate"
                onView={setPreviewItem}
              />
              {formData.gstAvailable && (
                <DocumentCard
                  label="GST Certificate"
                  file={formData.gstCertificateFile}
                  fileName={formData.gstCertificateFileName}
                  fileUrl={formData.gstCertificateFileUrl}
                  partnerId={expertId}
                  documentType="gst-certificate"
                  onView={setPreviewItem}
                />
              )}
            </div>

            <SectionTitle>Work History ({workHistoryEntries.length})</SectionTitle>
            {workHistoryEntries.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {workHistoryEntries.map((entry, index) => (
                  <WorkHistoryCard
                    key={index}
                    jobTitle={entry.jobTitle}
                    companyName={entry.companyName}
                    employmentType={entry.employmentType}
                    startDate={entry.startDate}
                    endDate={entry.endDate}
                    currentlyWorking={entry.currentlyWorking}
                    onClick={() => setSelectedWorkExperience(entry)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted text-xs">No work history added.</p>
            )}

            <h3 className="mt-6 mb-4 text-[20px] leading-5 font-semibold tracking-normal text-white">
              Gallery ({formData.galleryPreviews.length})
            </h3>
            {formData.galleryPreviews.length > 0 ? (
              <div className="flex max-w-[592px] flex-wrap gap-[23px]">
                {formData.galleryPreviews.map((preview, index) => (
                  <button
                    key={`${preview}-${index}`}
                    type="button"
                    onClick={() =>
                      setPreviewItem({
                        url: preview,
                        title: `Gallery image ${index + 1}`,
                        kind: 'gallery',
                      })
                    }
                    className="size-[100px] overflow-hidden rounded-[10px]"
                  >
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted text-xs">No gallery images uploaded.</p>
            )}
          </div>
        </div>

        <div className="bg-brand-surface rounded-lg border border-white/5 p-6">
          <label className="mb-2 block text-xs font-medium text-white">Internal notes</label>
          <textarea
            value={formData.internalNotes}
            onChange={(e) => setFormData((prev) => ({ ...prev, internalNotes: e.target.value }))}
            placeholder="Enter Text"
            className="ui-textarea h-24"
          />

          <label className="mt-4 flex items-center gap-2 text-xs text-white">
            <input
              type="checkbox"
              checked={formData.isVerified}
              onChange={(e) => setFormData((prev) => ({ ...prev, isVerified: e.target.checked }))}
              className="ui-table-checkbox"
            />
            I confirm that the details in this platform are being verified thoroughly
          </label>
        </div>
      </div>
    </>
  )
}
