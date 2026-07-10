import { useMemo, useState } from 'react'
import { Eye, EyeOff, Trash2 } from 'lucide-react'

import { useServiceCategoriesByType } from '../hooks/use-service-categories'
import type {
  VenueOnboardingKyc,
  VenueOnboardingReviewVenue,
} from '../type/venue-onboarding'
import {
  formatHostingSince,
  maskSensitiveValue,
  type VenueOnboardingFormData,
} from '../utils/venue-onboarding-form'

type Props = {
  formData: VenueOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<VenueOnboardingFormData>>
  reviewVenue?: VenueOnboardingReviewVenue | null
  reviewKyc?: VenueOnboardingKyc | null
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-[#777]">{label}</span>
      <span className="text-sm font-medium text-white">{value || '-'}</span>
    </div>
  )
}

function MaskedValue({ value }: { value: string }) {
  const [visible, setVisible] = useState(false)
  if (!value) return <>-</>

  return (
    <span className="inline-flex items-center gap-2">
      {visible ? value : maskSensitiveValue(value)}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-brand-accent hover:text-brand-gold-from"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </span>
  )
}

function DocumentPreview({
  label,
  url,
  fileName,
}: {
  label: string
  url?: string
  fileName?: string
}) {
  return (
    <div className="flex h-24 flex-col items-center justify-center rounded-md border border-dashed border-[#444] bg-black p-2">
      <p className="mb-1 text-[10px] text-[#777]">{label}</p>
      {url ? (
        <div className="flex w-full items-center justify-between gap-2 px-1">
          <span className="truncate text-xs text-[#aaa]">
            {fileName || 'Uploaded'}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-[10px] text-brand-accent underline"
          >
            View
          </a>
        </div>
      ) : (
        <span className="text-xs text-[#555]">Not uploaded</span>
      )}
    </div>
  )
}

function resolveDocumentPreview(
  apiUrl?: string | null,
  file?: File | null,
): { url?: string; fileName?: string } {
  if (apiUrl) return { url: apiUrl, fileName: 'Uploaded' }
  if (file) return { url: URL.createObjectURL(file), fileName: file.name }
  return {}
}

export const VenueOnboardingFinalReviewStep = ({
  formData,
  setFormData,
  reviewVenue,
  reviewKyc,
}: Props) => {
  const venue = reviewVenue
  const kyc = reviewKyc
  const { data: categoriesData } = useServiceCategoriesByType('venue')
  const categories = useMemo(
    () => Object.values(categoriesData?.data || {}).flat(),
    [categoriesData?.data],
  )

  const categoryName = useMemo(() => {
    const cats = venue?.venueCategoryId
    if (cats?.length) {
      const first = cats[0]
      if (typeof first === 'object' && first?.name) return first.name
    }
    if (formData.venueCategoryName) return formData.venueCategoryName
    const matched = categories.find((cat) => cat.id === formData.venueCategoryId)
    if (matched?.name) return matched.name
    return '-'
  }, [venue?.venueCategoryId, formData.venueCategoryName, formData.venueCategoryId, categories])

  const hostingSince = venue?.hostingSince
    ? formatHostingSince(venue.hostingSince.years, venue.hostingSince.months)
    : formatHostingSince(
        Number(formData.hostingSinceYears) || undefined,
        Number(formData.hostingSinceMonths) || undefined,
      )

  const coverUrl = venue?.coverImageUrl || formData.coverImageUrl
  const profileUrl = venue?.profileImageUrl || formData.profileImageUrl
  const venueImages = venue?.venueImages?.length
    ? venue.venueImages
    : formData.venueImageUrls

  const businessKyc = kyc?.businessKyc

  const panCardPreview = useMemo(
    () => resolveDocumentPreview(businessKyc?.panCard, formData.panCard),
    [businessKyc?.panCard, formData.panCard],
  )
  const tradeLicensePreview = useMemo(
    () => resolveDocumentPreview(businessKyc?.tradeLicense, formData.tradeLicense),
    [businessKyc?.tradeLicense, formData.tradeLicense],
  )
  const gstCertificatePreview = useMemo(
    () =>
      resolveDocumentPreview(businessKyc?.gstCertificate, formData.gstCertificate),
    [businessKyc?.gstCertificate, formData.gstCertificate],
  )
  const gstUndertakingPreview = useMemo(
    () =>
      resolveDocumentPreview(
        businessKyc?.gstUndertakingDocument || businessKyc?.gstUndertaking,
        formData.gstUndertaking,
      ),
    [
      businessKyc?.gstUndertakingDocument,
      businessKyc?.gstUndertaking,
      formData.gstUndertaking,
    ],
  )

  const otherCertificatePreviews = useMemo(() => {
    if (businessKyc?.otherCertificates?.length) {
      return businessKyc.otherCertificates.map((url, index) => ({
        key: `api-${index}`,
        label: `Other Document ${index + 1}`,
        url,
        fileName: 'Uploaded',
      }))
    }

    return formData.otherCertificates.map((file, index) => ({
      key: `file-${file.name}-${index}`,
      label: `Other Document ${index + 1}`,
      url: URL.createObjectURL(file),
      fileName: file.name,
    }))
  }, [businessKyc?.otherCertificates, formData.otherCertificates])

  return (
    <div className="mx-auto w-full max-w-[850px] space-y-6">
      <div className="overflow-hidden rounded-lg border border-white/5 bg-[#151515]">
        <div className="relative h-40 bg-gradient-to-r from-cyan-900 to-blue-800">
          {coverUrl && (
            <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
          )}
          <div className="absolute -bottom-10 left-6 size-20 overflow-hidden rounded-full border-4 border-[#151515] bg-slate-600">
            {profileUrl ? (
              <img src={profileUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : null}
          </div>
        </div>

        <div className="px-6 pb-6 pt-14">
          <h2 className="text-sm font-bold text-white">Review & Create Account</h2>
          <p className="mt-1 text-xs text-[#777777]">
            Final verification before account creation
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-accent">
          Basic Profile Information
        </h3>
        <ReviewRow label="Full Name" value={venue?.name || formData.name} />
        <ReviewRow label="Category" value={categoryName} />
        <ReviewRow label="Hosting since" value={hostingSince} />
        <ReviewRow label="POC Name" value={venue?.pocName || formData.pocName} />
        <ReviewRow
          label="POC Contact"
          value={venue?.pocContactNumber || formData.pocContactNumber}
        />
      </div>

      <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-accent">
          Venue Location Details
        </h3>
        <ReviewRow
          label="Address"
          value={venue?.location?.address || formData.address}
        />
        <ReviewRow label="City" value={venue?.location?.city || formData.city} />
        <ReviewRow
          label="Pin code"
          value={venue?.location?.pincode || formData.pincode}
        />
      </div>

      <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-accent">
          KYC Details
        </h3>
        <ReviewRow
          label="GST Availability"
          value={
            businessKyc?.hasGST != null
              ? businessKyc.hasGST
                ? 'Yes'
                : 'No'
              : formData.hasGST
                ? 'Yes'
                : 'No'
          }
        />
        {(businessKyc?.hasGST ?? formData.hasGST) && (
          <ReviewRow
            label="GST Number"
            value={
              <MaskedValue value={businessKyc?.gstNumber || formData.gstNumber} />
            }
          />
        )}
        <ReviewRow
          label="Venue Type"
          value={businessKyc?.typeOfVenue || formData.typeOfVenue}
        />
        <ReviewRow
          label="PAN Number"
          value={
            <MaskedValue value={businessKyc?.panNumber || formData.panNumber} />
          }
        />
      </div>

      <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
        <h3 className="mb-3 text-xs font-bold text-white">Venue Images</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(venueImages.length > 0 ? venueImages : [null, null, null]).map(
            (url, index) => (
              <div
                key={url ?? `placeholder-${index}`}
                className="relative flex h-20 items-center justify-center overflow-hidden rounded-md border border-dashed border-[#444] bg-black"
              >
                {url ? (
                  <img src={url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-[#555]">Uploaded</span>
                )}
                <Trash2 className="absolute right-2 top-2 size-4 text-[#666]" />
              </div>
            ),
          )}
        </div>
      </div>

      <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
        <h3 className="mb-3 text-xs font-bold text-white">
          Business identity verification documents
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DocumentPreview
            label="PAN Card"
            url={panCardPreview.url}
            fileName={panCardPreview.fileName}
          />
          <DocumentPreview
            label="Permits/Certificates"
            url={tradeLicensePreview.url}
            fileName={tradeLicensePreview.fileName}
          />
          <DocumentPreview
            label={
              businessKyc?.hasGST ?? formData.hasGST
                ? 'GST Certificates'
                : 'GST Undertaking Document'
            }
            url={
              (businessKyc?.hasGST ?? formData.hasGST)
                ? gstCertificatePreview.url
                : gstUndertakingPreview.url
            }
            fileName={
              (businessKyc?.hasGST ?? formData.hasGST)
                ? gstCertificatePreview.fileName
                : gstUndertakingPreview.fileName
            }
          />
        </div>
      </div>

      {otherCertificatePreviews.length > 0 && (
        <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
          <h3 className="mb-3 text-xs font-bold text-white">Other Documents</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {otherCertificatePreviews.map((doc) => (
              <DocumentPreview
                key={doc.key}
                label={doc.label}
                url={doc.url}
                fileName={doc.fileName}
              />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
        <label className="mb-2 block text-xs font-medium text-white">
          Internal notes *
        </label>
        <textarea
          rows={4}
          value={formData.internalNotes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, internalNotes: e.target.value }))
          }
          placeholder="Add admin verification notes..."
          className="w-full resize-none rounded-md border border-white/10 bg-black p-3 text-sm text-white outline-none focus:border-brand-accent"
        />

        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={formData.isVerified}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isVerified: e.target.checked }))
            }
            className="mt-0.5 size-4 rounded border-white/20 accent-brand-accent"
          />
          <span className="text-xs text-[#aaa]">
            I confirm that the details in this profile are being verified thoroughly.
          </span>
        </label>
      </div>
    </div>
  )
}
