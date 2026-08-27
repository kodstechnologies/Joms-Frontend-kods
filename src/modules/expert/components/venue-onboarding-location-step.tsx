import { useRef } from 'react'
import { Upload, X } from 'lucide-react'

import type { VenueOnboardingFormData } from '../utils/venue-onboarding-form'
import { RequiredMark } from '@/shared/components/form/required-mark'
import { GoogleMapPicker, type LocationDetails } from '@/shared/components/map'

const fieldClass = 'ui-input'

const MAX_VENUE_IMAGES = 3

type Props = {
  formData: VenueOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<VenueOnboardingFormData>>
}

export const VenueOnboardingLocationStep = ({ formData, setFormData }: Props) => {
  const imageInputRef = useRef<HTMLInputElement>(null)

  const totalImages = formData.venueImages.length + formData.venueImageUrls.length

  const handleImagesAdd = (files: FileList | null) => {
    if (!files?.length) return
    const remaining = MAX_VENUE_IMAGES - totalImages
    if (remaining <= 0) return
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

  const handleMapLocationSelect = (details: LocationDetails) => {
    setFormData((prev) => ({
      ...prev,
      latitude: details.latitude,
      longitude: details.longitude,
      address: details.address || prev.address,
      city: details.city || prev.city,
      state: details.state || prev.state,
      country: details.country || prev.country,
      pincode: details.pincode || prev.pincode,
      landmark: details.landmark || prev.landmark,
    }))
  }

  return (
    <div className="mx-auto w-full max-w-[1140px] space-y-6">
      <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface rounded-lg border border-white/5 p-6 duration-300">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-white">Add Venue Location</h2>
          <p className="text-muted mt-1 text-xs">Provide details about your service offering</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Address <RequiredMark />
            </label>
            <input
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="e.g. 100 Feet Rd, Indiranagar"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                City <RequiredMark />
              </label>
              <input
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Enter name here"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Pin code <RequiredMark />
              </label>
              <input
                value={formData.pincode}
                onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
                placeholder="Enter name here"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-white">
              Upload Venue Images <RequiredMark />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {formData.venueImageUrls.map((url, index) => (
                <div
                  key={`existing-${url}-${index}`}
                  className="relative flex h-24 items-center justify-center overflow-hidden rounded-md border border-dashed border-white/20 bg-black"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {formData.venueImages.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="relative flex h-24 items-center justify-center overflow-hidden rounded-md border border-dashed border-white/20 bg-black"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {totalImages < MAX_VENUE_IMAGES && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="hover:border-brand-accent/50 text-muted flex h-24 items-center justify-center rounded-md border border-dashed border-white/20 bg-black text-xs transition-colors"
                >
                  <Upload className="mr-1 size-4" />
                  Upload here
                </button>
              )}
            </div>
            <p className="text-muted mt-2 text-xs">
              Upload up to {MAX_VENUE_IMAGES} images ({totalImages}/{MAX_VENUE_IMAGES})
            </p>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleImagesAdd(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          <div className="pt-2">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-white">Location on Map</h3>
              <p className="text-muted mt-1 text-xs">Based on the address you provided</p>
            </div>
            <GoogleMapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              address={formData.address}
              city={formData.city}
              landmark={formData.landmark}
              height="280px"
              onLocationSelect={handleMapLocationSelect}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
