import { useRef } from 'react'
import { MapPin, Maximize2, Search, Upload, X } from 'lucide-react'

import type { VenueOnboardingFormData } from '../utils/venue-onboarding-form'

const fieldClass =
  'h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none placeholder:text-[#666] focus:border-[#FBC078]'

const MAX_VENUE_IMAGES = 10

type Props = {
  formData: VenueOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<VenueOnboardingFormData>>
}

export const VenueOnboardingLocationStep = ({ formData, setFormData }: Props) => {
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImagesAdd = (files: FileList | null) => {
    if (!files?.length) return
    const remaining = MAX_VENUE_IMAGES - formData.venueImages.length
    const newFiles = Array.from(files).slice(0, remaining)
    setFormData((prev) => ({
      ...prev,
      venueImages: [...prev.venueImages, ...newFiles],
    }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      venueImages: prev.venueImages.filter((_, i) => i !== index),
    }))
  }

  const removeExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      venueImageUrls: prev.venueImageUrls.filter((_, i) => i !== index),
    }))
  }

  const totalImages = formData.venueImages.length + formData.venueImageUrls.length

  return (
    <div className="mx-auto w-full max-w-[850px] space-y-6">
      <div className="animate-in fade-in slide-in-from-right-4 rounded-lg border border-white/5 bg-[#151515] p-6 duration-300">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-white">Add Venue Location</h2>
          <p className="mt-1 text-xs text-[#777777]">
            Provide details about your service offering
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium text-white">Address *</label>
            <input
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="e.g NDA Review & Legal Advisory"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-white">City *</label>
              <input
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="Enter name here"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Pin code *
              </label>
              <input
                value={formData.pincode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pincode: e.target.value }))
                }
                placeholder="Enter name here"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Upload Venue Images *
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {formData.venueImageUrls.map((url, index) => (
                <div
                  key={`existing-${url}-${index}`}
                  className="relative flex h-24 items-center justify-center overflow-hidden rounded-md border border-dashed border-[#444] bg-black"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {formData.venueImages.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="relative flex h-24 items-center justify-center overflow-hidden rounded-md border border-dashed border-[#444] bg-black"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {totalImages < MAX_VENUE_IMAGES && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex h-24 items-center justify-center rounded-md border border-dashed border-[#444] bg-black text-xs text-[#777] transition-colors hover:border-[#FBC078]/50"
                >
                  <Upload className="mr-1 size-4" />
                  Upload here
                </button>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImagesAdd(e.target.files)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/5 bg-[#151515] p-6">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white">Location on Map</h3>
          <p className="mt-1 text-xs text-[#777777]">Based on the address you provided</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777]" />
          <input
            value={formData.landmark}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, landmark: e.target.value }))
            }
            placeholder="Search by Location"
            className={`${fieldClass} pl-10`}
          />
        </div>

        <div className="relative overflow-hidden rounded-md border border-white/10 bg-[#1a1a1a]">
          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center">
              <MapPin className="mx-auto mb-2 size-8 text-red-500" />
              <p className="text-xs text-[#888]">{formData.city || 'Bengaluru'}</p>
            </div>
          </div>
          <button
            type="button"
            className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white"
          >
            <Maximize2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
