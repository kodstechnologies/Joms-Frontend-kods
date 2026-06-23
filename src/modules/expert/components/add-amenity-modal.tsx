import { useRef, useState } from 'react'
import { Save, Upload, X } from 'lucide-react'

interface AddAmenityModalProps {
  onClose: () => void
}

export const AddAmenityModal = ({
  onClose,
}: AddAmenityModalProps) => {
  const fileInputRef =
    useRef<HTMLInputElement>(null)

  const [amenityName, setAmenityName] =
    useState('')

  const [venueCategory, setVenueCategory] =
    useState('')

  const [subCategory, setSubCategory] =
    useState('')

  const [iconFile, setIconFile] =
    useState<File | null>(null)

  const handleSave = () => {
    if (
      !amenityName ||
      !venueCategory ||
      !iconFile
    ) {
      alert(
        'Please fill all required fields',
      )
      return
    }

    console.log({
      amenityName,
      venueCategory,
      subCategory,
      iconFile,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75">
      <div className="w-[580px] rounded-2xl bg-[#161616] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-5">
          <h2 className="text-[18px] font-semibold text-white">
            Add amenities
          </h2>

          <button onClick={onClose}>
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Amenities Name */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-white">
                Amenities name *
              </label>

              <input
                value={amenityName}
                onChange={e =>
                  setAmenityName(
                    e.target.value,
                  )
                }
                className="h-10 w-full rounded-md border border-[#1F1F1F] bg-black px-3 text-sm text-white outline-none focus:border-[#F5C37A]"
              />
            </div>

            {/* Upload Icon */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-white">
                Upload icon *
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file =
                    e.target.files?.[0]

                  if (file) {
                    setIconFile(file)
                  }
                }}
              />

              <div
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex h-[84px] w-[84px] cursor-pointer items-center justify-center rounded-md border border-dashed border-[#666666] hover:border-[#F5C37A]"
              >
                {iconFile ? (
                  <img
                    src={URL.createObjectURL(
                      iconFile,
                    )}
                    alt="icon"
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <Upload className="h-5 w-5 text-slate-500" />
                )}
              </div>
            </div>

            {/* Venue Category */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-white">
                Venue category *
              </label>

              <input
                value={venueCategory}
                onChange={e =>
                  setVenueCategory(
                    e.target.value,
                  )
                }
                className="h-10 w-full rounded-md border border-[#1F1F1F] bg-black px-3 text-sm text-white outline-none focus:border-[#F5C37A]"
              />
            </div>

            {/* Sub Category */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-white">
                Sub-category (optional)
              </label>

              <input
                value={subCategory}
                onChange={e =>
                  setSubCategory(
                    e.target.value,
                  )
                }
                className="h-10 w-full rounded-md border border-[#1F1F1F] bg-black px-3 text-sm text-white outline-none focus:border-[#F5C37A]"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#F5C37A] px-5 text-sm font-medium text-black"
            >
              <Save size={15} />
              Save amenity
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}