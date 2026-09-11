import { useRef, useState, type DragEvent } from 'react'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { guardUploadFiles } from '@/shared/lib/upload-file'

import type { ExpertOnboardingFormData } from '../utils/expert-onboarding-form'

const MAX_IMAGES = 5

type Props = {
  formData: ExpertOnboardingFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpertOnboardingFormData>>
}

export const ExpertGalleryStep = ({ formData, setFormData }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const incoming = guardUploadFiles(files).filter((file) => file.type.startsWith('image/'))
    if (incoming.length === 0) return

    setFormData((prev) => {
      const availableSlots = MAX_IMAGES - prev.galleryPreviews.length
      if (availableSlots <= 0) {
        toast.error(`A maximum of ${MAX_IMAGES} images are allowed`)
        return prev
      }

      const accepted = incoming.slice(0, availableSlots)
      if (incoming.length > availableSlots) {
        toast.error(`A maximum of ${MAX_IMAGES} images are allowed`)
      }

      return {
        ...prev,
        galleryImages: [...prev.galleryImages, ...accepted],
        galleryPreviews: [
          ...prev.galleryPreviews,
          ...accepted.map((file) => URL.createObjectURL(file)),
        ],
      }
    })
  }

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const existingCount = Math.max(0, prev.galleryPreviews.length - prev.galleryImages.length)

      if (index < existingCount) {
        return {
          ...prev,
          galleryPreviews: prev.galleryPreviews.filter((_, i) => i !== index),
        }
      }

      const fileIndex = index - existingCount
      return {
        ...prev,
        galleryImages: prev.galleryImages.filter((_, i) => i !== fileIndex),
        galleryPreviews: prev.galleryPreviews.filter((_, i) => i !== index),
      }
    })
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(false)
    addFiles(event.dataTransfer.files)
  }

  return (
    <div className="mx-auto w-full max-w-[999px]">
      <div className="animate-in fade-in slide-in-from-right-4 h-[478px] w-full overflow-y-auto rounded-[10px] bg-[#141414] p-6 shadow-[0px_4px_4px_0px_#00000040] duration-300">
        <div>
          <h2 className="text-[16px] leading-5 font-semibold tracking-normal text-white">
            Gallery
          </h2>
          <p className="mt-[10px] text-[14px] leading-5 font-normal tracking-normal text-[#FFFFFF80]">
            Upload visual assets to support your service (optional)
          </p>
        </div>

        <p className="mt-[15px] mb-4 text-[14px] leading-5 font-semibold tracking-normal text-white">
          Maximum 5 images. Allowed formats: JPG, PNG, WebP
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className="relative flex h-[150px] w-full max-w-[914px] flex-col items-center rounded-[10px] bg-[#050505] pt-[17px] transition-colors"
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <rect
              x="0.5"
              y="0.5"
              width="99.7%"
              height="99%"
              rx="10"
              ry="10"
              fill="none"
              stroke={isDragging ? 'var(--brand-accent)' : '#FFFFFF80'}
              strokeWidth="1"
              strokeDasharray="5 5"
            />
          </svg>
          <div className="relative mb-[10px] flex size-[50px] items-center justify-center rounded-full bg-[#141414]">
            <Upload className="size-6 text-white" strokeWidth={1.75} />
          </div>
          <p className="relative text-[14px] leading-5 font-semibold tracking-normal text-white">
            Click to upload Images
          </p>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />

        <div className="mt-6">
          <p className="mb-3 text-xs font-medium text-white">
            Uploaded Images ({formData.galleryPreviews.length}/{MAX_IMAGES})
          </p>

          {formData.galleryPreviews.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {formData.galleryPreviews.map((preview, index) => (
                <div
                  key={preview}
                  className="relative size-20 overflow-hidden rounded-md border border-white/10"
                >
                  <img
                    src={preview}
                    alt={`Gallery ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-brand-danger absolute top-1 right-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
                  >
                    <X className="size-2.5" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-xs">No images uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
