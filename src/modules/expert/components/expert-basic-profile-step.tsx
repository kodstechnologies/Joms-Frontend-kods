import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, ImageIcon, Plus, Search, Upload, X, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { STANDARD_INDUSTRIES, STANDARD_OFFERINGS } from '../config/expert-profile-options.config'
import { useOfferingsList, useServiceCategoriesByType } from '../hooks/use-service-categories'
import type { ExpertOnboardingFormData } from '../utils/expert-onboarding-form'
import { VerificationOtpModal } from './verification-otp-modal'
import { RequiredMark } from '@/shared/components/form/required-mark'
import { cn } from '@/shared/lib/cn'
import { sanitizeMobileNumber, validateMobileNumber } from '@/shared/lib/phone'

const fieldClass = 'ui-input'

const SERVICE_TYPE_OPTIONS = [
  { value: 'concierge', label: 'Concierge' },
  { value: 'venue', label: 'Venue' },
] as const

type Props = {
  formData: ExpertOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpertOnboardingFormData>>
  lockedServiceType?: 'concierge' | 'venue'
}

export const ExpertBasicProfileStep = ({ formData, setFormData, lockedServiceType }: Props) => {
  const coverInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const sampleFileInputRef = useRef<HTMLInputElement>(null)

  const industryContainerRef = useRef<HTMLDivElement>(null)
  const offeringContainerRef = useRef<HTMLDivElement>(null)

  const [categorySearch, setCategorySearch] = useState('')
  const [offeringInput, setOfferingInput] = useState('')
  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false)
  const [offeringDropdownOpen, setOfferingDropdownOpen] = useState(false)

  const [verifyModal, setVerifyModal] = useState<{
    open: boolean
    type: 'phone' | 'email'
    targetValue: string
  }>({
    open: false,
    type: 'phone',
    targetValue: '',
  })

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        industryContainerRef.current &&
        !industryContainerRef.current.contains(e.target as Node)
      ) {
        setIndustryDropdownOpen(false)
      }
      if (
        offeringContainerRef.current &&
        !offeringContainerRef.current.contains(e.target as Node)
      ) {
        setOfferingDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleOpenPhoneVerify = () => {
    const error = validateMobileNumber(formData.phoneNumber)
    if (error) {
      toast.error(error)
      return
    }
    setVerifyModal({
      open: true,
      type: 'phone',
      targetValue: formData.phoneNumber,
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

  const serviceType = (lockedServiceType ?? formData.serviceType) as 'concierge' | 'venue' | ''
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useServiceCategoriesByType(
    serviceType,
    categorySearch.trim() || undefined,
  )

  const { data: dynamicOfferings = [] } = useOfferingsList()

  const allAvailableOfferings = useMemo(() => {
    const merged = Array.from(new Set([...(dynamicOfferings || []), ...STANDARD_OFFERINGS]))
    return merged
  }, [dynamicOfferings])

  const filteredOfferings = useMemo(() => {
    const q = offeringInput.trim().toLowerCase()
    return allAvailableOfferings.filter(
      (item) => !formData.offerings.includes(item) && (!q || item.toLowerCase().includes(q)),
    )
  }, [allAvailableOfferings, formData.offerings, offeringInput])

  const filteredIndustries = useMemo(() => {
    const q = formData.industry.trim().toLowerCase()
    return STANDARD_INDUSTRIES.filter((ind) => !q || ind.toLowerCase().includes(q))
  }, [formData.industry])

  const categoryGroups = useMemo(() => categoriesResponse?.data || {}, [categoriesResponse?.data])
  const flattenedCategories = useMemo(
    () => Object.values(categoryGroups).flatMap((items) => items.map((item) => item.name)),
    [categoryGroups],
  )
  const categoryNameToGroup = useMemo(() => {
    const map = new Map<string, string>()
    for (const [groupName, items] of Object.entries(categoryGroups)) {
      for (const item of items) {
        map.set(item.name, groupName)
      }
    }
    return map
  }, [categoryGroups])

  const isVenueService = serviceType === 'venue'

  const handleImageChange = (field: 'coverImage' | 'profileImage', file: File | null) => {
    setFormData((prev) => {
      if (field === 'coverImage') {
        return {
          ...prev,
          coverImage: file,
          coverImageUrl: file ? URL.createObjectURL(file) : prev.coverImageUrl,
        }
      }
      return {
        ...prev,
        profileImage: file,
        profileImageUrl: file ? URL.createObjectURL(file) : prev.profileImageUrl,
      }
    })
  }

  const handleServiceTypeChange = (value: string) => {
    if (lockedServiceType) return

    setFormData((prev) => ({
      ...prev,
      serviceType: value,
      serviceCategory: [],
    }))
    setCategorySearch('')
  }

  const toggleCategory = (categoryName: string, groupName?: string) => {
    setFormData((prev) => {
      if (prev.serviceCategory.includes(categoryName)) {
        return {
          ...prev,
          serviceCategory: prev.serviceCategory.filter((item) => item !== categoryName),
        }
      }

      if (isVenueService) {
        const targetGroup = groupName ?? categoryNameToGroup.get(categoryName)
        const next = prev.serviceCategory.filter(
          (item) => categoryNameToGroup.get(item) === targetGroup,
        )
        return { ...prev, serviceCategory: [...next, categoryName] }
      }

      return {
        ...prev,
        serviceCategory: [...prev.serviceCategory, categoryName],
      }
    })
  }

  const addOffering = (value: string, reset?: () => void) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setFormData((prev) =>
      prev.offerings.includes(trimmed)
        ? prev
        : { ...prev, offerings: [...prev.offerings, trimmed] },
    )
    if (reset) reset()
  }

  const removeOffering = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      offerings: prev.offerings.filter((item) => item !== value),
    }))
  }

  return (
    <div className="mx-auto w-full max-w-[1140px]">
      <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface rounded-lg border border-white/5 p-6 duration-300">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-white">Basic Profile Setup</h2>
          <p className="text-muted mt-1 text-xs">Core identity details and profile media</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column: Media & Identity Details */}
          <div className="space-y-6">
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
                    <p className="text-muted mb-2 text-xs">Upload Cover Image</p>
                    <ImageIcon className="text-muted mx-auto size-5" />
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

            <div className="pt-8">
              <h3 className="mb-4 text-sm font-bold text-white">Identity Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Full Name <RequiredMark />
                  </label>
                  <input
                    value={formData.fullname}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fullname: e.target.value }))}
                    placeholder="Enter full name"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Location <RequiredMark />
                  </label>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Profile Bio <RequiredMark />
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Write a brief bio..."
                    rows={4}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Sample Work Link
                  </label>
                  <input
                    value={formData.sampleWorkLink}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sampleWorkLink: e.target.value }))
                    }
                    placeholder="Enter Link"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Upload Sample Work File
                  </label>
                  <button
                    type="button"
                    onClick={() => sampleFileInputRef.current?.click()}
                    className="hover:border-brand-accent/50 text-muted rounded-md border border-dashed border-white/20 px-8 py-3 text-xs transition-colors"
                  >
                    {formData.sampleWorkFileName || 'Upload here'}
                  </button>
                  <input
                    ref={sampleFileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null
                      setFormData((prev) => ({
                        ...prev,
                        sampleWorkFile: file,
                        sampleWorkFileName: file?.name ?? '',
                      }))
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Professional Information & Services */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white">Professional Information</h3>

            {/* Industry Dropdown */}
            <div ref={industryContainerRef} className="relative">
              <label className="mb-2 block text-xs font-medium text-white">Industry</label>
              <div className="relative">
                <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <input
                  value={formData.industry}
                  onFocus={() => setIndustryDropdownOpen(true)}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, industry: e.target.value }))
                    setIndustryDropdownOpen(true)
                  }}
                  placeholder="Select or search industry"
                  className={`${fieldClass} ui-input-icon-left pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setIndustryDropdownOpen((prev) => !prev)}
                  className="text-muted absolute top-1/2 right-2.5 -translate-y-1/2 p-1 hover:text-white"
                >
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform duration-200',
                      industryDropdownOpen && 'rotate-180',
                    )}
                  />
                </button>
              </div>

              {industryDropdownOpen && (
                <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#161616] p-1.5 shadow-2xl backdrop-blur-md">
                  {filteredIndustries.length === 0 ? (
                    <div className="p-3 text-center text-xs text-white/50">
                      No matching industry. Custom industry will be used: &quot;{formData.industry}
                      &quot;
                    </div>
                  ) : (
                    filteredIndustries.map((ind) => {
                      const isSelected =
                        formData.industry.trim().toLowerCase() === ind.toLowerCase()
                      return (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, industry: ind }))
                            setIndustryDropdownOpen(false)
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors',
                            isSelected
                              ? 'bg-brand-accent/15 text-brand-accent font-semibold'
                              : 'text-white/80 hover:bg-white/5 hover:text-white',
                          )}
                        >
                          <span>{ind}</span>
                          {isSelected && <Check className="text-brand-accent size-3.5" />}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Years Of Experience
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, experienceYears: e.target.value }))
                  }
                  placeholder="Years"
                  type="number"
                  min={0}
                  className={fieldClass}
                />
                <input
                  value={formData.experienceMonths}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, experienceMonths: e.target.value }))
                  }
                  placeholder="Months"
                  type="number"
                  min={0}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Service Type <RequiredMark />
              </label>
              <select
                value={serviceType}
                onChange={(e) => handleServiceTypeChange(e.target.value)}
                disabled={Boolean(lockedServiceType)}
                className={cn(
                  fieldClass,
                  'appearance-none bg-none [&::-ms-expand]:hidden',
                  lockedServiceType ? 'text-muted cursor-not-allowed opacity-70' : 'cursor-pointer',
                )}
                style={{ backgroundImage: 'none' }}
              >
                <option value="" disabled>
                  Select service type
                </option>
                {SERVICE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Service Category <RequiredMark />
              </label>
              {!serviceType ? (
                <p className="text-muted rounded-md bg-black px-3 py-2.5 text-xs">
                  Select a service type first
                </p>
              ) : (
                <>
                  <div className="relative">
                    <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <input
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search categories"
                      className={`${fieldClass} ui-input-icon-left`}
                    />
                  </div>

                  <div className="mt-3 max-h-48 overflow-y-auto rounded-md border border-white/5 bg-black p-3">
                    {isCategoriesLoading ? (
                      <p className="text-muted text-xs">Loading categories...</p>
                    ) : flattenedCategories.length === 0 ? (
                      <p className="text-muted text-xs">No categories found</p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(categoryGroups).map(([groupName, items]) => (
                          <div key={groupName}>
                            <p className="text-muted mb-2 text-[10px] font-semibold tracking-wide uppercase">
                              {groupName}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {items.map((category) => {
                                const isSelected = formData.serviceCategory.includes(category.name)

                                return (
                                  <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => toggleCategory(category.name, groupName)}
                                    className={cn(
                                      'rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors',
                                      isSelected
                                        ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                                        : 'text-muted border-white/10 hover:border-white/30',
                                    )}
                                  >
                                    {category.name}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {formData.serviceCategory.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.serviceCategory.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-md bg-black px-3 py-2.5 text-xs text-white"
                    >
                      {item}
                      <XCircle
                        className="text-muted size-4 cursor-pointer hover:text-white"
                        onClick={() => toggleCategory(item)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Offerings Dropdown & Multi-Select */}
            <div ref={offeringContainerRef} className="relative">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-medium text-white">Offerings</label>
                <span className="text-[11px] text-white/40">
                  Select from dropdown or add custom
                </span>
              </div>

              <div className="relative mb-3">
                <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <input
                  value={offeringInput}
                  onFocus={() => setOfferingDropdownOpen(true)}
                  onChange={(e) => {
                    setOfferingInput(e.target.value)
                    setOfferingDropdownOpen(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addOffering(offeringInput, () => {
                        setOfferingInput('')
                        setOfferingDropdownOpen(false)
                      })
                    }
                  }}
                  placeholder="Select from dropdown or search offerings..."
                  className={`${fieldClass} ui-input-icon-left pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setOfferingDropdownOpen((prev) => !prev)}
                  className="text-muted absolute top-1/2 right-2.5 -translate-y-1/2 p-1 hover:text-white"
                >
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform duration-200',
                      offeringDropdownOpen && 'rotate-180',
                    )}
                  />
                </button>
              </div>

              {/* Offerings Suggestions Dropdown */}
              {offeringDropdownOpen && (
                <div className="absolute z-50 mb-2 max-h-56 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#161616] p-2 shadow-2xl backdrop-blur-md">
                  {filteredOfferings.length === 0 ? (
                    <div className="p-3 text-center text-xs text-white/50">
                      {offeringInput.trim() ? (
                        <button
                          type="button"
                          onClick={() => {
                            addOffering(offeringInput, () => {
                              setOfferingInput('')
                              setOfferingDropdownOpen(false)
                            })
                          }}
                          className="text-brand-accent inline-flex items-center gap-1 font-semibold hover:underline"
                        >
                          <Plus className="size-3.5" />
                          Add &quot;{offeringInput}&quot; as custom offering
                        </button>
                      ) : (
                        'All standard offerings selected'
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredOfferings.map((offering) => (
                        <button
                          key={offering}
                          type="button"
                          onClick={() => {
                            addOffering(offering, () => {
                              setOfferingInput('')
                            })
                          }}
                          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <span>{offering}</span>
                          <Plus className="size-3.5 text-white/40" />
                        </button>
                      ))}
                      {offeringInput.trim() &&
                        !filteredOfferings.includes(offeringInput.trim()) && (
                          <button
                            type="button"
                            onClick={() => {
                              addOffering(offeringInput, () => {
                                setOfferingInput('')
                                setOfferingDropdownOpen(false)
                              })
                            }}
                            className="text-brand-accent flex w-full items-center gap-1.5 border-t border-white/10 px-3 pt-2 pb-1 text-xs font-semibold hover:underline"
                          >
                            <Plus className="size-3.5" />
                            Add custom &quot;{offeringInput}&quot;
                          </button>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Offerings Chips */}
              {formData.offerings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold tracking-wider text-white/50 uppercase">
                    Selected Offerings ({formData.offerings.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.offerings.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d0d0d] px-3 py-1.5 text-xs font-medium text-white"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${item}`}
                          onClick={() => removeOffering(item)}
                          className="text-white/40 transition-colors hover:text-white"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-white">Verification</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Phone Number <RequiredMark />
                  </label>

                  <div className="flex items-center gap-3">
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phoneNumber: sanitizeMobileNumber(e.target.value),
                          isPhoneVerified: false,
                        }))
                      }
                      placeholder="Enter phone number"
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
