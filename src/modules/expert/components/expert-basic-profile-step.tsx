import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ImageIcon, Search, Upload, XCircle } from 'lucide-react'

import { useServiceCategoriesByType } from '../hooks/use-service-categories'
import type { ExpertOnboardingFormData } from '../utils/expert-onboarding-form'
import { cn } from '@/shared/lib/cn'
import { sanitizeMobileNumber } from '@/shared/lib/phone'

const fieldClass =
  'h-11 w-full rounded-md bg-black px-3 text-sm text-white outline-none placeholder:text-[#666] focus:ring-1 focus:ring-[#FBC078]/40'

const SERVICE_TYPE_OPTIONS = [
  { value: 'concierge', label: 'Concierge' },
  { value: 'venue', label: 'Venue' },
] as const

type Props = {
  formData: ExpertOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpertOnboardingFormData>>
  lockedServiceType?: 'concierge' | 'venue'
}

export const ExpertBasicProfileStep = ({
  formData,
  setFormData,
  lockedServiceType,
}: Props) => {
  const coverInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const sampleFileInputRef = useRef<HTMLInputElement>(null)

  const [categorySearch, setCategorySearch] = useState('')
  const [offeringInput, setOfferingInput] = useState('')

  const serviceType = formData.serviceType as 'concierge' | 'venue' | ''
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useServiceCategoriesByType(serviceType, categorySearch.trim() || undefined)

  const categoryGroups = categoriesResponse?.data || {}
  const flattenedCategories = useMemo(
    () =>
      Object.values(categoryGroups).flatMap((items) =>
        items.map((item) => item.name),
      ),
    [categoryGroups],
  )

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

  const toggleCategory = (categoryName: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceCategory: prev.serviceCategory.includes(categoryName)
        ? prev.serviceCategory.filter((item) => item !== categoryName)
        : [...prev.serviceCategory, categoryName],
    }))
  }

  useEffect(() => {
    if (!lockedServiceType || formData.serviceType === lockedServiceType) return

    setFormData((prev) => ({
      ...prev,
      serviceType: lockedServiceType,
      serviceCategory: prev.serviceType === lockedServiceType ? prev.serviceCategory : [],
    }))
    setCategorySearch('')
  }, [formData.serviceType, lockedServiceType, setFormData])

  const addOffering = (value: string, reset: () => void) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setFormData((prev) =>
      prev.offerings.includes(trimmed)
        ? prev
        : { ...prev, offerings: [...prev.offerings, trimmed] },
    )
    reset()
  }

  const removeOffering = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      offerings: prev.offerings.filter((item) => item !== value),
    }))
  }

  return (
    <div className="mx-auto w-full max-w-[850px]">
      <div className="animate-in fade-in slide-in-from-right-4 rounded-lg border border-white/5 bg-[#151515] p-6 duration-300">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-white">Basic Profile Setup</h2>
          <p className="mt-1 text-xs text-[#777777]">
            Core identity details and profile media
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="relative">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-[#444] bg-black transition-colors hover:border-[#FBC078]/50"
              >
                {formData.coverImageUrl ? (
                  <img
                    src={formData.coverImageUrl}
                    alt="Cover"
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <p className="mb-2 text-xs text-[#777]">Upload Cover Image</p>
                    <ImageIcon className="mx-auto size-5 text-[#777]" />
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
                className="absolute -bottom-8 left-6 size-16 overflow-hidden rounded-full border-4 border-[#151515] bg-slate-600"
              >
                {formData.profileImageUrl ? (
                  <img
                    src={formData.profileImageUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Upload className="size-4 text-[#999]" />
                  </div>
                )}
              </button>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  handleImageChange('profileImage', e.target.files?.[0] ?? null)
                }
              />
            </div>

            <div className="pt-10">
              <label className="mb-2 block text-xs font-medium text-white">
                Full Name *
              </label>
              <input
                value={formData.fullname}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullname: e.target.value }))
                }
                placeholder="Full Name"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">Location</label>
              <input
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Enter Location"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Write a short bio"
                className="h-32 w-full rounded-md bg-black p-3 text-sm text-white outline-none placeholder:text-[#666] focus:ring-1 focus:ring-[#FBC078]/40"
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
                className="rounded-md border border-dashed border-[#444] px-8 py-3 text-xs text-[#999] transition-colors hover:border-[#FBC078]/50"
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

          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white">Professional Information</h3>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">Industry</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777]" />
                <input
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, industry: e.target.value }))
                  }
                  placeholder="Search industry"
                  className={`${fieldClass} pl-10`}
                />
              </div>
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
                  placeholder="Enter Years"
                  type="number"
                  min={0}
                  className={fieldClass}
                />
                <input
                  value={formData.experienceMonths}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, experienceMonths: e.target.value }))
                  }
                  placeholder="Enter Month"
                  type="number"
                  min={0}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Service Type *
              </label>
              <div className="relative">
                <select
                  value={formData.serviceType}
                  onChange={(e) => handleServiceTypeChange(e.target.value)}
                  disabled={Boolean(lockedServiceType)}
                  className={cn(
                    fieldClass,
                    'appearance-none pr-10',
                    lockedServiceType
                      ? 'cursor-not-allowed text-[#888] opacity-70'
                      : 'cursor-pointer',
                  )}
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
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#777]" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Service Category *
              </label>
              {!formData.serviceType ? (
                <p className="rounded-md bg-black px-3 py-2.5 text-xs text-[#777]">
                  Select a service type first
                </p>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777]" />
                    <input
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search categories"
                      className={`${fieldClass} pl-10`}
                    />
                  </div>

                  <div className="mt-3 max-h-48 overflow-y-auto rounded-md border border-white/5 bg-black p-3">
                    {isCategoriesLoading ? (
                      <p className="text-xs text-[#777]">Loading categories...</p>
                    ) : flattenedCategories.length === 0 ? (
                      <p className="text-xs text-[#777]">No categories found</p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(categoryGroups).map(([groupName, items]) => (
                          <div key={groupName}>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#777]">
                              {groupName}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {items.map((category) => {
                                const isSelected = formData.serviceCategory.includes(
                                  category.name,
                                )

                                return (
                                  <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => toggleCategory(category.name)}
                                    className={cn(
                                      'rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors',
                                      isSelected
                                        ? 'border-[#FBC078] bg-[#FBC078]/10 text-[#FBC078]'
                                        : 'border-white/10 text-[#888888] hover:border-white/30',
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
                        className="size-4 cursor-pointer text-[#999] hover:text-white"
                        onClick={() => toggleCategory(item)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">Offerings</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777]" />
                <input
                  value={offeringInput}
                  onChange={(e) => setOfferingInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addOffering(offeringInput, () => setOfferingInput(''))
                    }
                  }}
                  placeholder="Search and press Enter"
                  className={`${fieldClass} pl-10`}
                />
              </div>
              {formData.offerings.length > 0 && (
                <div className="space-y-2">
                  {formData.offerings.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-md bg-black px-3 py-2.5 text-xs text-white"
                    >
                      {item}
                      <XCircle
                        className="size-4 cursor-pointer text-[#999] hover:text-white"
                        onClick={() => removeOffering(item)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold text-white">Verification</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: sanitizeMobileNumber(e.target.value),
                      }))
                    }
                    placeholder="Enter 10-digit mobile number"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white">
                    Email ID *
                  </label>
                  <input
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Enter Email ID"
                    type="email"
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
