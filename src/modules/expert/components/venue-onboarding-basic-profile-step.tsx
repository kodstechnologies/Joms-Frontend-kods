import { useRef, useState } from 'react'
import { Search, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { useServiceCategoriesByType } from '../hooks/use-service-categories'
import { type VenueOnboardingFormData } from '../utils/venue-onboarding-form'
import { VerificationOtpModal } from './verification-otp-modal'
import { RequiredMark } from '@/shared/components/form/required-mark'
import { cn } from '@/shared/lib/cn'
import { sanitizeMobileNumber, validateMobileNumber } from '@/shared/lib/phone'

const fieldClass = 'ui-input'

type Props = {
  formData: VenueOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<VenueOnboardingFormData>>
}

export const VenueOnboardingBasicProfileStep = ({ formData, setFormData }: Props) => {
  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [verifyModal, setVerifyModal] = useState<{
    open: boolean
    type: 'phone' | 'email'
    targetValue: string
  }>({
    open: false,
    type: 'phone',
    targetValue: '',
  })

  const handleOpenPhoneVerify = () => {
    const error = validateMobileNumber(formData.phone)
    if (error) {
      toast.error(error)
      return
    }
    setVerifyModal({
      open: true,
      type: 'phone',
      targetValue: formData.phone,
    })
  }

  const handleOpenEmailVerify = () => {
    if (!formData.email.trim()) {
      toast.error('Please enter an email ID before verifying.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address.')
      return
    }
    setVerifyModal({
      open: true,
      type: 'email',
      targetValue: formData.email.trim(),
    })
  }

  const handleVerified = () => {
    if (verifyModal.type === 'phone') {
      setFormData((prev) => ({ ...prev, isPhoneVerified: true }))
    } else {
      setFormData((prev) => ({ ...prev, isEmailVerified: true }))
    }
  }

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useServiceCategoriesByType('venue')
  const categoryGroups = categoriesData?.data || {}
  const categories = Object.values(categoryGroups).flat()

  const handleImageChange = (field: 'profileImage' | 'coverImage', file: File | null) => {
    setFormData((prev) => {
      if (field === 'profileImage') {
        return {
          ...prev,
          profileImage: file,
          profileImageUrl: file ? URL.createObjectURL(file) : prev.profileImageUrl,
        }
      }
      return {
        ...prev,
        coverImage: file,
        coverImageUrl: file ? URL.createObjectURL(file) : prev.coverImageUrl,
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1140px]">
      <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface rounded-lg border border-white/5 p-6 duration-300">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-white">Basic Profile Setup</h2>
          <p className="text-muted mt-1 text-xs">Core identity details and profile media</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="hover:border-brand-accent/50 flex h-32 w-full items-center justify-center rounded-md border border-dashed border-white/20 bg-black transition-colors"
            >
              {formData.coverImageUrl ? (
                <img
                  src={formData.coverImageUrl}
                  alt="Cover"
                  className="h-full w-full rounded-md object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="text-muted mx-auto mb-2 size-5" />
                  <p className="text-muted text-xs">Upload Cover Image</p>
                </div>
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange('coverImage', e.target.files?.[0] ?? null)}
            />

            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              className="border-brand-surface absolute -bottom-8 left-6 size-16 overflow-hidden rounded-full border-4 bg-slate-600"
            >
              {formData.profileImageUrl ? (
                <img
                  src={formData.profileImageUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Upload className="text-muted size-4" />
                </div>
              )}
            </button>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange('profileImage', e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Venue Name <RequiredMark />
            </label>
            <input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full Name"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">Service Type</label>
            <input
              value="Venue Partner"
              disabled
              placeholder="Venue Partner"
              className={`${fieldClass} text-muted cursor-not-allowed opacity-70`}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">Hosting since</label>
            <input
              value={formData.hostingSinceYears}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hostingSinceYears: e.target.value }))
              }
              placeholder="Enter founding year"
              type="number"
              min={0}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Category <RequiredMark />
            </label>
            <div className="relative">
              <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <select
                value={formData.venueCategoryId}
                onChange={(e) => {
                  const selectedId = e.target.value
                  const selectedCategory = categories.find((cat) => cat.id === selectedId)
                  const categoryName = selectedCategory?.name || ''
                  setFormData((prev) => ({
                    ...prev,
                    venueCategoryId: selectedId,
                    venueCategoryName: categoryName,
                    typeOfVenue: categoryName || prev.typeOfVenue,
                  }))
                }}
                className={`${fieldClass} ui-input-icon-left appearance-none`}
              >
                <option value="">{isCategoriesLoading ? 'Loading categories...' : 'Search'}</option>
                {!isCategoriesLoading && Object.keys(categoryGroups).length === 0 && (
                  <option value="" disabled>
                    No venue categories found
                  </option>
                )}
                {Object.entries(categoryGroups).map(([groupName, groupSubs]) => (
                  <optgroup key={groupName} label={groupName}>
                    {groupSubs.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">POC Name</label>
            <input
              value={formData.pocName}
              onChange={(e) => setFormData((prev) => ({ ...prev, pocName: e.target.value }))}
              placeholder="Enter full name"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">POC Contact</label>
            <input
              value={formData.pocContactNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pocContactNumber: e.target.value }))
              }
              placeholder="Enter username"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Phone Number <RequiredMark />
            </label>
            <div className="flex items-center gap-3">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: sanitizeMobileNumber(e.target.value),
                    isPhoneVerified: false,
                  }))
                }
                placeholder="Enter 10-digit mobile number"
                className={fieldClass}
              />
              <button
                type="button"
                onClick={handleOpenPhoneVerify}
                className={cn(
                  'shrink-0 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all',
                  formData.isPhoneVerified
                    ? 'border border-[#1E563D]/50 bg-[#143D2B] text-[#00E065]'
                    : 'bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-[#050505] hover:brightness-95',
                )}
              >
                {formData.isPhoneVerified ? 'Verified ✓' : 'Verify'}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Email ID <RequiredMark />
            </label>
            <div className="flex items-center gap-3">
              <input
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                    isEmailVerified: false,
                  }))
                }
                placeholder="Enter Email ID"
                type="email"
                className={fieldClass}
              />
              <button
                type="button"
                onClick={handleOpenEmailVerify}
                className={cn(
                  'shrink-0 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all',
                  formData.isEmailVerified
                    ? 'border border-[#1E563D]/50 bg-[#143D2B] text-[#00E065]'
                    : 'bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-[#050505] hover:brightness-95',
                )}
              >
                {formData.isEmailVerified ? 'Verified ✓' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <VerificationOtpModal
        open={verifyModal.open}
        type={verifyModal.type}
        targetValue={verifyModal.targetValue}
        onClose={() => setVerifyModal((prev) => ({ ...prev, open: false }))}
        onVerified={handleVerified}
      />
    </div>
  )
}
