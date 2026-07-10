import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

import type { VenueOnboardingFormData } from '../utils/venue-onboarding-form'

const fieldClass =
  'h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none placeholder:text-[#666] focus:border-brand-accent'

const selectClass = `${fieldClass} appearance-none`

const ID_TYPES = ['PAN', 'Aadhaar', 'Passport', 'Driving License']
const VENUE_TYPES = ['Hotel', 'Banquet Hall', 'Resort', 'Farmhouse', 'Restaurant', 'Other']
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

type FileField =
  | 'panCard'
  | 'gstCertificate'
  | 'tradeLicense'
  | 'fssaiLicense'
  | 'gstUndertaking'

function FileUploadBox({
  label,
  required,
  file,
  onSelect,
  onClear,
}: {
  label: string
  required?: boolean
  file: File | null
  onSelect: (file: File | null) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-white">
        {label}
        {required && ' *'}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-[#444] bg-black text-xs text-[#777] transition-colors hover:border-brand-accent/50"
        >
          {file ? (
            <span className="truncate px-2">{file.name}</span>
          ) : (
            'Upload here'
          )}
        </button>
        {file && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
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

export const VenueOnboardingKycStep = ({ formData, setFormData }: Props) => {
  const otherCertsRef = useRef<HTMLInputElement>(null)

  const setFile = (field: FileField, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
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

  return (
    <div className="mx-auto w-full max-w-[850px] space-y-6">
      <div className="animate-in fade-in slide-in-from-right-4 rounded-lg border border-white/5 bg-[#151515] p-6 duration-300">
        <h3 className="mb-4 text-sm font-bold text-white">Government ID Verification</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Select ID type *
            </label>
            <select
              value={formData.idType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, idType: e.target.value }))
              }
              className={selectClass}
            >
              <option value="">Choose ID type</option>
              {ID_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              ID Number *
            </label>
            <input
              value={formData.idNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, idNumber: e.target.value }))
              }
              placeholder="ABCDE1234F"
              className={fieldClass}
            />
            <p className="mt-1 text-[10px] text-[#666]">Format: ABCDE1234F</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
        <h3 className="mb-4 text-sm font-bold text-white">KYC Verification</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              GST Availability *
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
                  GST Number *
                </label>
                <input
                  value={formData.gstNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, gstNumber: e.target.value }))
                  }
                  placeholder="23AAACC1206D2ZN"
                  className={fieldClass}
                />
                <p className="mt-1 text-[10px] text-[#666]">Format: 29ABCDE1234F1Z5</p>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white">
                  State *
                </label>
                <select
                  value={formData.kycState}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, kycState: e.target.value }))
                  }
                  className={selectClass}
                >
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
                  Did they filed IT returns in the last 2 years *
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
              Type of Venue *
            </label>
            <select
              value={formData.typeOfVenue}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, typeOfVenue: e.target.value }))
              }
              className={selectClass}
            >
              <option value="">Choose here</option>
              {VENUE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Organization/Individual PAN *
            </label>
            <input
              value={formData.panNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, panNumber: e.target.value }))
              }
              placeholder="ABCDE1234F"
              className={fieldClass}
            />
            <p className="mt-1 text-[10px] text-[#666]">Format: ABCDE1234F</p>
          </div>
        </div>

        {!formData.hasGST && (
          <div className="mt-5">
            <FileUploadBox
              label="GST Undertaking Document"
              file={formData.gstUndertaking}
              onSelect={(file) => setFile('gstUndertaking', file)}
              onClear={() => setFile('gstUndertaking', null)}
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
        <h3 className="mb-4 text-sm font-bold text-white">
          Business Identity verification documents *
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FileUploadBox
            label="PAN Card"
            required
            file={formData.panCard}
            onSelect={(file) => setFile('panCard', file)}
            onClear={() => setFile('panCard', null)}
          />
          <FileUploadBox
            label="Certificates or License & Permits"
            required
            file={formData.tradeLicense}
            onSelect={(file) => setFile('tradeLicense', file)}
            onClear={() => setFile('tradeLicense', null)}
          />
          {formData.hasGST ? (
            <FileUploadBox
              label="GST Certificate"
              required
              file={formData.gstCertificate}
              onSelect={(file) => setFile('gstCertificate', file)}
              onClear={() => setFile('gstCertificate', null)}
            />
          ) : (
            <FileUploadBox
              label="GST Undertaking Document"
              required
              file={formData.gstUndertaking}
              onSelect={(file) => setFile('gstUndertaking', file)}
              onClear={() => setFile('gstUndertaking', null)}
            />
          )}
        </div>
      </div>

      <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
        <h3 className="mb-4 text-sm font-bold text-white">Other Documents *</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {formData.otherCertificates.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative flex h-24 items-center justify-center rounded-md border border-dashed border-[#444] bg-black px-2 text-xs text-[#aaa]"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    otherCertificates: prev.otherCertificates.filter(
                      (_, i) => i !== index,
                    ),
                  }))
                }
                className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {formData.otherCertificates.length < 5 && (
            <button
              type="button"
              onClick={() => otherCertsRef.current?.click()}
              className="flex h-24 items-center justify-center rounded-md border border-dashed border-[#444] bg-black text-xs text-[#777] hover:border-brand-accent/50"
            >
              <Upload className="mr-1 size-4" />
              [Venue Based Certificate]
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
