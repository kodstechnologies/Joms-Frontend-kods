import { useRef, useState, type KeyboardEvent } from 'react'
import { ImageIcon, Search, Upload, XCircle } from 'lucide-react'

import type { ExpertOnboardingFormData } from '../utils/expert-onboarding-form'

const fieldClass =
  'h-11 w-full rounded-md bg-black px-3 text-sm text-white outline-none placeholder:text-[#666] focus:ring-1 focus:ring-[#FBC078]/40'

type Props = {
  formData: ExpertOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpertOnboardingFormData>>
}

export const ExpertBasicProfileStep = ({ formData, setFormData }: Props) => {
  const coverInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const sampleFileInputRef = useRef<HTMLInputElement>(null)

  const [categoryInput, setCategoryInput] = useState('')
  const [offeringInput, setOfferingInput] = useState('')

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

  const addChip = (
    key: 'serviceCategory' | 'offerings',
    value: string,
    reset: () => void,
  ) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setFormData((prev) =>
      prev[key].includes(trimmed)
        ? prev
        : { ...prev, [key]: [...prev[key], trimmed] },
    )
    reset()
  }

  const removeChip = (key: 'serviceCategory' | 'offerings', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item !== value),
    }))
  }

  const handleChipKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    key: 'serviceCategory' | 'offerings',
    value: string,
    reset: () => void,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addChip(key, value, reset)
    }
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
                Service Type
              </label>
              <input value="Concierge" readOnly className={fieldClass} />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Service Category
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777]" />
                <input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={(e) =>
                    handleChipKeyDown(e, 'serviceCategory', categoryInput, () =>
                      setCategoryInput(''),
                    )
                  }
                  placeholder="Search and press Enter"
                  className={`${fieldClass} pl-10`}
                />
              </div>
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
                        onClick={() => removeChip('serviceCategory', item)}
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
                  onKeyDown={(e) =>
                    handleChipKeyDown(e, 'offerings', offeringInput, () =>
                      setOfferingInput(''),
                    )
                  }
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
                        onClick={() => removeChip('offerings', item)}
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
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                    }
                    placeholder="Enter phone number"
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
