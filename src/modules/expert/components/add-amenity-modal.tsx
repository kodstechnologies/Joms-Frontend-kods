import { useRef, useState } from 'react'
import { Save, Upload, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { addAmenity } from '../api/venue-api'
import { RequiredMark } from '@/shared/components/form/required-mark'

interface AddAmenityModalProps {
  onClose: () => void
}

export const AddAmenityModal = ({ onClose }: AddAmenityModalProps) => {
  const queryClient = useQueryClient()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [amenityName, setAmenityName] = useState('')

  const [venueCategory, setVenueCategory] = useState('')

  const [subCategory, setSubCategory] = useState('')

  const [iconFile, setIconFile] = useState<File | null>(null)

  const { mutate: saveAmenity, isPending } = useMutation({
    mutationFn: (formData: FormData) => addAmenity(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities-master'] })
      toast.success('Amenity added successfully')
      onClose()
    },
    onError: (error: unknown) => {
      const message =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : 'Failed to add amenity'
      toast.error(message)
    },
  })

  const handleSave = () => {
    if (!amenityName || !venueCategory || !iconFile) {
      toast.error('Please fill all required fields')
      return
    }

    const formData = new FormData()
    formData.append('name', amenityName.trim())
    formData.append('category', venueCategory.trim())
    formData.append('image', iconFile)

    saveAmenity(formData)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050505]/80">
      <div className="ui-modal-shell w-[580px] max-w-[580px]">
        <div className="ui-modal-header">
          <h2 className="text-h4 font-semibold text-white">Add amenities</h2>

          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="ui-modal-body">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="text-body-md mb-2 block font-medium text-white">
                Amenities name <RequiredMark />
              </label>

              <input
                value={amenityName}
                onChange={(e) => setAmenityName(e.target.value)}
                className="ui-input"
              />
            </div>

            <div>
              <label className="text-body-md mb-2 block font-medium text-white">
                Upload icon <RequiredMark />
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]

                  if (file) {
                    setIconFile(file)
                  }
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="hover:border-brand-accent flex h-[84px] w-[84px] cursor-pointer items-center justify-center rounded-md border border-dashed border-white/20"
              >
                {iconFile ? (
                  <img
                    src={URL.createObjectURL(iconFile)}
                    alt="icon"
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <Upload className="text-muted h-5 w-5" />
                )}
              </div>
            </div>

            <div>
              <label className="text-body-md mb-2 block font-medium text-white">
                Venue category <RequiredMark />
              </label>

              <input
                value={venueCategory}
                onChange={(e) => setVenueCategory(e.target.value)}
                className="ui-input"
              />
            </div>

            <div>
              <label className="text-body-md mb-2 block font-medium text-white">
                Sub-category (optional)
              </label>

              <input
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="ui-input"
              />
            </div>
          </div>
        </div>

        <div className="ui-modal-footer justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="ui-modal-btn ui-modal-btn-gold flex w-auto flex-none items-center gap-2 px-5"
          >
            <Save size={15} />
            {isPending ? 'Saving…' : 'Save amenity'}
          </button>
        </div>
      </div>
    </div>
  )
}
