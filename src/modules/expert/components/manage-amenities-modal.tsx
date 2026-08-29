import { useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { fetchAmenityMasters } from '../api/venue-api'
import type { VenueFormData } from '../utils/venue-form'

type AmenitySubCategory = {
  _id: string
  name: string
  image?: string
  icon?: string
}

type AmenityCategory = {
  _id: string
  category: string
  subCategories: AmenitySubCategory[]
}

interface ManageAmenitiesModalProps {
  onClose: () => void
  onAddAmenity: () => void
  selectedAmenities: VenueFormData['amenities']
  setVenueData: React.Dispatch<React.SetStateAction<VenueFormData>>
}

export const ManageAmenitiesModal = ({
  onClose,
  onAddAmenity,
  selectedAmenities,
  setVenueData,
}: ManageAmenitiesModalProps) => {
  const [search, setSearch] = useState('')

  const { data: amenitiesResponse, isLoading } = useQuery({
    queryKey: ['amenities-master'],
    queryFn: fetchAmenityMasters,
  })

  const categories = (amenitiesResponse?.data || []) as AmenityCategory[]

  const toggleAmenity = (
    categoryId: string,
    subCategoryId: string,
    name: string,
    image: string,
  ) => {
    setVenueData((prev) => {
      const exists = prev.amenities.some(
        (item) => item.categoryId === categoryId && item.subCategoryId === subCategoryId,
      )

      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(
              (item) => !(item.categoryId === categoryId && item.subCategoryId === subCategoryId),
            )
          : [
              ...prev.amenities,
              {
                categoryId,
                subCategoryId,
                name,
                image,
              },
            ],
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 backdrop-blur-sm">
      <div className="ui-modal-shell max-h-[80vh] max-w-4xl overflow-y-auto">
        <div className="ui-modal-header bg-brand-surface sticky top-0">
          <h2 className="text-h2 font-semibold text-white">Manage amenities</h2>

          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="ui-modal-body">
          <label className="text-body-sm mb-2 block text-white">Search amenities</label>

          <div className="mb-5 flex gap-3">
            <div className="relative flex-1">
              <Search className="text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search amenities"
                className="ui-input ui-input-icon-left"
              />
            </div>

            <button
              type="button"
              onClick={onAddAmenity}
              className="ui-cta ui-cta-primary flex items-center gap-2 px-4"
            >
              <Plus size={16} />
              Add Amenities
            </button>
          </div>

          {isLoading && <p className="text-body-md text-muted">Loading amenities...</p>}

          {!isLoading &&
            categories.map((category) => {
              const filteredSubCategories = category.subCategories.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase()),
              )

              if (!filteredSubCategories.length) return null

              return (
                <div key={category._id} className="mb-6">
                  <h3 className="text-body-md mb-3 font-medium text-white">{category.category}</h3>

                  <div className="flex flex-wrap gap-3">
                    {filteredSubCategories.map((item) => {
                      const isSelected = selectedAmenities.some(
                        (amenity) =>
                          amenity.categoryId === category._id && amenity.subCategoryId === item._id,
                      )

                      return (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() =>
                            toggleAmenity(
                              category._id,
                              item._id,
                              item.name,
                              item.image || item.icon || '',
                            )
                          }
                          className={`text-body-sm flex items-center gap-2 rounded-md border px-4 py-2 transition ${
                            isSelected
                              ? 'border-white bg-white text-black'
                              : 'border-white/10 bg-black text-white'
                          }`}
                        >
                          {(item.image || item.icon) && (
                            <img
                              src={item.image || item.icon}
                              alt={item.name}
                              className="h-4 w-4 object-contain"
                            />
                          )}

                          {isSelected && <span>×</span>}

                          {item.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
