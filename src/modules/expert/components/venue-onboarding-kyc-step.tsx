import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

import { useVenueDocumentRules } from '../hooks/use-venue-kyc'
import { useServiceCategoriesByType } from '../hooks/use-service-categories'
import {
  getVenueKycUploadSections,
  isVenueKycDocumentRequired,
  type VenueKycDocumentRule,
  type VenueOnboardingFormData,
} from '../utils/venue-onboarding-form'
import { RequiredMark } from '@/shared/components/form/required-mark'
import {
  GOVERNMENT_ID_TYPES,
  getGovernmentIdMeta,
  normalizeGovernmentIdType,
  sanitizeGovernmentIdInput,
  sanitizeGstInput,
  sanitizePanInput,
  validateGovernmentIdNumber,
  validateGstNumber,
  validatePanNumber,
} from '@/shared/lib/partner-field-validation'

const fieldClass = 'ui-input'

const selectClass = `${fieldClass} appearance-none`

const INDIAN_STATES = [
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
]

type Props = {
  formData: VenueOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<VenueOnboardingFormData>>
}

function FileUploadBox({
  label,
  required,
  file,
  existingUrl,
  onSelect,
  onClear,
}: {
  label: string
  required?: boolean
  file: File | null
  existingUrl?: string
  onSelect: (file: File | null) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const displayName = file?.name || (existingUrl ? 'Uploaded' : '')

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-white">
        {label}
        {required ? (
          <>
            {' '}
            <RequiredMark />
          </>
        ) : null}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="hover:border-brand-accent/50 text-muted flex h-24 w-full items-center justify-center rounded-md border border-dashed border-white/20 bg-black text-xs transition-colors"
        >
          {displayName ? <span className="truncate px-2">{displayName}</span> : 'Upload here'}
        </button>
        {file && (
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white"
          >
            <X className="size-3" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  )
}

function FieldMessage({ error, hint }: { error?: string | null; hint?: string }) {
  if (error) {
    return <p className="text-brand-danger mt-1 text-[10px]">{error}</p>
  }
  if (!hint) return null
  return <p className="text-muted mt-1 text-[10px]">{hint}</p>
}

export const VenueOnboardingKycStep = ({ formData, setFormData }: Props) => {
  const otherCertsRef = useRef<HTMLInputElement>(null)
  const panFieldRef = useRef<HTMLDivElement>(null)
  const selectedIdMeta = getGovernmentIdMeta(formData.idType)
  const idNumberError = formData.idNumber.trim()
    ? validateGovernmentIdNumber(formData.idType, formData.idNumber)
    : null
  const panError = formData.panNumber.trim() ? validatePanNumber(formData.panNumber) : null
  const gstError =
    formData.hasGST && formData.gstNumber.trim() ? validateGstNumber(formData.gstNumber) : null

  const { data: categoriesData } = useServiceCategoriesByType('venue')
  const categoryGroups = categoriesData?.data || {}
  const { data: rulesResponse, isLoading: isRulesLoading } = useVenueDocumentRules(
    formData.typeOfVenue,
    formData.hasGST,
  )
  const { mandatory, conditional, categoryName } = getVenueKycUploadSections(
    rulesResponse?.data,
    formData.hasGST,
  )

  let dynamicVenueTypes: string[] = []

  if (formData.venueCategoryId || formData.venueCategoryName) {
    for (const [, subs] of Object.entries(categoryGroups)) {
      const match = subs.some(
        (sub) => sub.id === formData.venueCategoryId || sub.name === formData.venueCategoryName,
      )
      if (match) {
        dynamicVenueTypes = subs.map((sub) => sub.name)
        break
      }
    }
  }

  if (dynamicVenueTypes.length === 0) {
    const allSubs = Object.values(categoryGroups).flat()
    dynamicVenueTypes = Array.from(new Set(allSubs.map((sub) => sub.name)))
  }

  if (formData.typeOfVenue && !dynamicVenueTypes.includes(formData.typeOfVenue)) {
    dynamicVenueTypes = [formData.typeOfVenue, ...dynamicVenueTypes]
  }

  const setDocument = (key: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      kycDocuments: {
        ...prev.kycDocuments,
        [key]: file,
      },
    }))
  }

  const addOtherCertificates = (files: FileList | null) => {
    if (!files?.length) return
    const remaining = 5 - formData.otherCertificates.length
    const newFiles = Array.from(files).slice(0, remaining)
    setFormData((prev) => ({
      ...prev,
      otherCertificates: [...prev.otherCertificates, ...newFiles],
    }))
  }

  const renderDocumentBox = (doc: VenueKycDocumentRule, required: boolean) => (
    <FileUploadBox
      key={doc.key}
      label={doc.label}
      required={required}
      file={formData.kycDocuments[doc.key] || null}
      existingUrl={
        formData.kycDocumentUrls[doc.key] ||
        (doc.key === 'gstUndertakingDocument' ? formData.kycDocumentUrls.gstUndertaking : '') ||
        (doc.key === 'gstUndertaking' ? formData.kycDocumentUrls.gstUndertakingDocument : '')
      }
      onSelect={(file) => setDocument(doc.key, file)}
      onClear={() => setDocument(doc.key, null)}
    />
  )

  return (
    <div className="mx-auto w-full max-w-[1140px] space-y-6">
      <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface rounded-lg border border-white/5 p-6 duration-300">
        <h3 className="mb-4 text-sm font-bold text-white">Government ID Verification</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Select ID type <RequiredMark />
            </label>
            <select
              value={formData.idType}
              onChange={(e) => {
                const nextType = e.target.value
                const nextNumber = sanitizeGovernmentIdInput(nextType, formData.idNumber)
                setFormData((prev) => ({
                  ...prev,
                  idType: nextType,
                  idNumber: nextNumber,
                  panNumber:
                    normalizeGovernmentIdType(nextType) === 'PAN'
                      ? nextNumber || prev.panNumber
                      : prev.panNumber,
                }))
                if (normalizeGovernmentIdType(nextType) === 'PAN') {
                  window.requestAnimationFrame(() => {
                    panFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    panFieldRef.current?.querySelector('input')?.focus()
                  })
                }
              }}
              className={selectClass}
            >
              <option value="">Choose ID type</option>
              {GOVERNMENT_ID_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              ID Number <RequiredMark />
            </label>
            <input
              value={formData.idNumber}
              onChange={(e) =>
                setFormData((prev) => {
                  const idNumber = sanitizeGovernmentIdInput(prev.idType, e.target.value)
                  return {
                    ...prev,
                    idNumber,
                    panNumber:
                      normalizeGovernmentIdType(prev.idType) === 'PAN' ? idNumber : prev.panNumber,
                  }
                })
              }
              placeholder={selectedIdMeta?.placeholder || 'Enter ID number'}
              maxLength={selectedIdMeta?.maxLength}
              inputMode={selectedIdMeta?.inputMode}
              className={fieldClass}
            />
            <FieldMessage
              error={idNumberError}
              hint={selectedIdMeta?.formatHint || 'Select an ID type to see the expected format'}
            />
          </div>
        </div>
      </div>

      <div className="bg-brand-surface rounded-lg border border-white/5 p-6">
        <h3 className="mb-4 text-sm font-bold text-white">KYC Verification</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              GST Availability <RequiredMark />
            </label>
            <select
              value={formData.hasGST ? 'yes' : 'no'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hasGST: e.target.value === 'yes',
                }))
              }
              className={selectClass}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {formData.hasGST ? (
            <>
              <div>
                <label className="mb-2 block text-xs font-medium text-white">
                  GST Number <RequiredMark />
                </label>
                <input
                  value={formData.gstNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gstNumber: sanitizeGstInput(e.target.value),
                    }))
                  }
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                  className={fieldClass}
                />
                <FieldMessage error={gstError} hint="Format: 22AAAAA0000A1Z5" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white">
                  State <RequiredMark />
                </label>
                <select
                  value={formData.kycState}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kycState: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-xs font-medium text-white">
                  Did they filed IT returns in the last 2 years <RequiredMark />
                </label>
                <select
                  value={formData.itReturnsFiledLast2Years ? 'yes' : 'no'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      itReturnsFiledLast2Years: e.target.value === 'yes',
                    }))
                  }
                  className={selectClass}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white">
                  Send GST undertaking document
                </label>
                <input
                  value={formData.gstUndertakingEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gstUndertakingEmail: e.target.value,
                    }))
                  }
                  placeholder="dummy.user@gmail.com"
                  type="email"
                  className={fieldClass}
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Type of Venue <RequiredMark />
            </label>
            <select
              value={formData.typeOfVenue}
              onChange={(e) => setFormData((prev) => ({ ...prev, typeOfVenue: e.target.value }))}
              className={selectClass}
            >
              <option value="">Choose here</option>
              {dynamicVenueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div ref={panFieldRef}>
            <label className="mb-2 block text-xs font-medium text-white">
              Organization/Individual PAN <RequiredMark />
            </label>
            <input
              value={formData.panNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, panNumber: sanitizePanInput(e.target.value) }))
              }
              placeholder="ABCDE1234F"
              maxLength={10}
              className={fieldClass}
            />
            <FieldMessage error={panError} hint="Format: ABCDE1234F" />
          </div>
        </div>
      </div>

      <div className="bg-brand-surface rounded-lg border border-white/5 p-6">
        <h3 className="mb-1 text-sm font-bold text-white">
          Business Identity verification documents <RequiredMark />
        </h3>
        <p className="text-muted mb-4 text-[10px]">
          {formData.typeOfVenue
            ? isRulesLoading
              ? 'Loading documents for this venue type...'
              : `Required documents for ${categoryName || formData.typeOfVenue}`
            : 'Select a venue type to load the matching documents.'}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {mandatory.map((doc) =>
            renderDocumentBox(doc, isVenueKycDocumentRequired(doc, formData.hasGST)),
          )}
        </div>
      </div>

      {conditional.length > 0 && (
        <div className="bg-brand-surface rounded-lg border border-white/5 p-6">
          <h3 className="mb-4 text-sm font-bold text-white">Additional / Conditional Documents</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {conditional.map((doc) => renderDocumentBox(doc, false))}
          </div>
        </div>
      )}

      <div className="bg-brand-surface rounded-lg border border-white/5 p-6">
        <h3 className="mb-4 text-sm font-bold text-white">Other Documents</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {formData.otherCertificates.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="text-muted relative flex h-24 items-center justify-center rounded-md border border-dashed border-white/20 bg-black px-2 text-xs"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    otherCertificates: prev.otherCertificates.filter((_, i) => i !== index),
                  }))
                }
                className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {formData.otherCertificates.length < 5 && (
            <button
              type="button"
              onClick={() => otherCertsRef.current?.click()}
              className="hover:border-brand-accent/50 text-muted flex h-24 items-center justify-center rounded-md border border-dashed border-white/20 bg-black text-xs transition-colors"
            >
              <Upload className="mr-1 size-4" />
              Additional certificate
            </button>
          )}
        </div>
        <input
          ref={otherCertsRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          className="hidden"
          onChange={(e) => addOtherCertificates(e.target.files)}
        />
      </div>
    </div>
  )
}
