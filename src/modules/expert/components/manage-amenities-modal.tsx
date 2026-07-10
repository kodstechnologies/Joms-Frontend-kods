import { useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { fetchAmenityMasters } from '../api/venue-api'
import type { VenueFormData } from '../utils/venue-form'

type AmenitySubCategory = {
  _id: string
  name: string
  image: string
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

  const categories =
    (amenitiesResponse?.data || []) as AmenityCategory[]

  const toggleAmenity = (
    categoryId: string,
    subCategoryId: string,
    name : string,
    image : string,
  ) => {
    setVenueData((prev) => {
      const exists = prev.amenities.some(
        (item) =>
          item.categoryId === categoryId &&
          item.subCategoryId === subCategoryId,
      )

      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(
            (item) =>
              !(
                item.categoryId === categoryId &&
                item.subCategoryId === subCategoryId
              ),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-[#121212]">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-[#121212] p-5">
          <h2 className="text-xl font-semibold text-white">
            Manage amenities
          </h2>

          <button onClick={onClose}>
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="p-5">
          <label className="mb-2 block text-xs text-white">
            Search amenities
          </label>

          <div className="mb-5 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search amenities"
                className="h-10 w-full rounded-md border border-slate-700 bg-black pl-10 pr-4 text-sm text-white outline-none"
              />
            </div>

            <button
              onClick={onAddAmenity}
              className="flex items-center gap-2 rounded-md bg-brand-accent px-4 text-sm font-medium text-brand-text-dark"
            >
              <Plus size={16} />
              Add Amenities
            </button>
          </div>

          {isLoading && (
            <p className="text-sm text-slate-400">
              Loading amenities...
            </p>
          )}

          {!isLoading &&
            categories.map((category) => {
              const filteredSubCategories =
                category.subCategories.filter((item) =>
                  item.name
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )

              if (!filteredSubCategories.length) return null

              return (
                <div
                  key={category._id}
                  className="mb-6"
                >
                  <h3 className="mb-3 text-sm font-medium text-white">
                    {category.category}
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    {filteredSubCategories.map((item) => {
                      const isSelected = selectedAmenities.some(
                        (amenity) =>
                          amenity.categoryId === category._id &&
                          amenity.subCategoryId === item._id,
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
                              item.image,
                            )
                          }
                          className={`flex items-center gap-2 rounded-md border px-4 py-2 text-xs transition ${isSelected
                            ? 'border-white bg-white text-black'
                            : 'border-slate-700 bg-black text-white'
                            }`}
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-4 w-4 object-contain"
                            />
                          )}

                          {isSelected && (
                            <span>×</span>
                          )}

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