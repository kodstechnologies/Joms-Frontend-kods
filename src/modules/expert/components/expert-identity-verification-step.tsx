import { useRef } from 'react'
import { Upload } from 'lucide-react'

import type { ExpertOnboardingFormData } from '../utils/expert-onboarding-form'

const fieldClass = 'ui-input'

const ID_TYPE_OPTIONS = ['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID']

type Props = {
  formData: ExpertOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpertOnboardingFormData>>
}

type DocFieldKey = 'panCardFile' | 'certificateFile' | 'gstCertificateFile'
type DocNameKey = 'panCardFileName' | 'certificateFileName' | 'gstCertificateFileName'

function DocumentUploadField({
  label,
  fileName,
  onPick,
}: {
  label: string
  fileName: string
  onPick: (file: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-white">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="hover:border-brand-accent/50 text-body-sm text-muted flex h-16 w-full items-center justify-center rounded-md border border-dashed border-white/20 bg-black px-3 text-center transition-colors"
      >
        {fileName ? (
          <span className="text-brand-accent truncate">{fileName}</span>
        ) : (
          <span className="flex items-center gap-2">
            <Upload className="size-3.5" />
            Upload here
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}

export const ExpertIdentityVerificationStep = ({ formData, setFormData }: Props) => {
  const handleFileChange = (fileKey: DocFieldKey, nameKey: DocNameKey, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [fileKey]: file,
      [nameKey]: file?.name ?? '',
    }))
  }

  return (
    <div className="mx-auto w-full max-w-[850px]">
      <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface rounded-lg border border-white/5 p-6 duration-300">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-white">Government ID Verification</h2>
          <p className="text-muted mt-1 text-xs">
            Mandatory entry gate - Identity verification required to proceed
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-white">Select ID type</label>
            <select
              value={formData.idType}
              onChange={(e) => setFormData((prev) => ({ ...prev, idType: e.target.value }))}
              className={`${fieldClass} appearance-none`}
            >
              <option value="">Choose ID type</option>
              {ID_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">ID Number *</label>
            <input
              value={formData.idNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, idNumber: e.target.value }))}
              placeholder="ABC0E123F"
              className={fieldClass}
            />
            <p className="text-muted mt-1 text-[10px]">Format: ABC0E1234F</p>
          </div>
        </div>

        <div className="mt-8 mb-4">
          <h2 className="text-sm font-bold text-white">KYC Verification</h2>
          <p className="text-muted mt-1 text-xs">Identity verification required to proceed</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-white">GST Availability *</label>
            <select
              value={formData.gstAvailable ? 'yes' : 'no'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  gstAvailable: e.target.value === 'yes',
                }))
              }
              className={`${fieldClass} appearance-none`}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {formData.gstAvailable && (
            <div>
              <label className="mb-2 block text-xs font-medium text-white">GST Number *</label>
              <input
                value={formData.gstNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, gstNumber: e.target.value }))}
                placeholder="23AAACC1206032ZN"
                className={fieldClass}
              />
              <p className="text-muted mt-1 text-[10px]">Format: ABC0E1234F</p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Organization/Individual PAN *
            </label>
            <input
              value={formData.panNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, panNumber: e.target.value }))}
              placeholder="AAACC1206Q"
              className={fieldClass}
            />
            <p className="text-muted mt-1 text-[10px]">Format: ABC0E1234F</p>
          </div>
        </div>

        <div className="mt-8 mb-4">
          <h3 className="text-xs font-bold text-white">
            Business Identity verification documents *
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <DocumentUploadField
            label="PAN Card *"
            fileName={formData.panCardFileName}
            onPick={(file) => handleFileChange('panCardFile', 'panCardFileName', file)}
          />
          <DocumentUploadField
            label="Certificates or License & Permits *"
            fileName={formData.certificateFileName}
            onPick={(file) => handleFileChange('certificateFile', 'certificateFileName', file)}
          />
          {formData.gstAvailable && (
            <DocumentUploadField
              label="GST Certificate *"
              fileName={formData.gstCertificateFileName}
              onPick={(file) =>
                handleFileChange('gstCertificateFile', 'gstCertificateFileName', file)
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
