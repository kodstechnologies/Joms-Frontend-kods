import { useRef, useState } from 'react'
import { Search, Upload, User, Phone, Mail, Plus, X, Trash2 } from 'lucide-react'

import { ManageAmenitiesModal } from './manage-amenities-modal'
import { AddAmenityModal } from './add-amenity-modal'
import { useQuery } from '@tanstack/react-query'
import { fetchAmenityMasters } from '../api/venue-api'
import type { VenueFormData } from '../utils/venue-form'
import { rebuildVenueGalleryPreviewsFromForm } from '../utils/venue-form'

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

interface AmenitiesMediaStepProps {
  venueData: VenueFormData
  setVenueData: React.Dispatch<React.SetStateAction<VenueFormData>>
}
export const AmenitiesMediaStep = ({ venueData, setVenueData }: AmenitiesMediaStepProps) => {
  const [showManageAmenities, setShowManageAmenities] = useState(false)
  const [showAddAmenity, setShowAddAmenity] = useState(false)
  const [amenitySearch, setAmenitySearch] = useState('')

  const coverImageRef = useRef<HTMLInputElement>(null)
  const venueImageRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const selectedAmenities = venueData.amenities || []

  const { data: amenitiesResponse, isLoading: amenitiesLoading } = useQuery({
    queryKey: ['amenities-master'],
    queryFn: fetchAmenityMasters,
  })

  const amenityCategories = (amenitiesResponse?.data || []) as AmenityCategory[]
  const filterSubCategories = (subCategories: AmenitySubCategory[]) => {
    if (!amenitySearch.trim()) return subCategories
    return subCategories.filter((item) =>
      item.name.toLowerCase().includes(amenitySearch.toLowerCase()),
    )
  }

  const toggleAmenity = (
    categoryId: string,
    subCategoryId: string,
    name: string,
    image: string,
  ) => {
    const exists = venueData.amenities.some(
      (item) => item.categoryId === categoryId && item.subCategoryId === subCategoryId,
    )

    setVenueData((prev) => ({
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
    }))
  }

  const syncGalleryPreviews = (
    prev: VenueFormData,
    patch: Partial<VenueFormData>,
  ): VenueFormData => {
    const next = { ...prev, ...patch }
    return {
      ...next,
      galleryPreviews: rebuildVenueGalleryPreviewsFromForm(next),
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setVenueData((prev) =>
      syncGalleryPreviews(prev, {
        venueCoverImage: file,
        venueCoverImageUrl: file ? '' : prev.venueCoverImageUrl,
      }),
    )
    e.target.value = ''
  }

  const handleVenueImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setVenueData((prev) =>
      syncGalleryPreviews(prev, {
        venueImage: file,
        venueImageUrl: file ? '' : prev.venueImageUrl,
      }),
    )
    e.target.value = ''
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setVenueData((prev) =>
      syncGalleryPreviews(prev, {
        galleryImages: [...prev.galleryImages, ...files],
      }),
    )
    e.target.value = ''
  }

  const removeGalleryImage = (index: number) => {
    setVenueData((prev) =>
      syncGalleryPreviews(prev, {
        galleryImages: prev.galleryImages.filter((_, i) => i !== index),
      }),
    )
  }

  const contacts = venueData.contacts || [{ name: '', phone: '', email: '' }]

  const addContact = () => {
    setVenueData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', phone: '', email: '' }],
    }))
  }

  const removeContact = (index: number) => {
    setVenueData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }))
  }

  const updateContact = (index: number, field: 'name' | 'phone' | 'email', value: string) => {
    const updated = contacts.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    setVenueData((prev) => ({ ...prev, contacts: updated }))
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1140px] space-y-5">
        <div className="bg-brand-surface rounded-lg border border-white/5 p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Amenities</h2>
              <p className="text-body-sm text-muted">Provide details about your service offering</p>
            </div>

            <button
              type="button"
              onClick={() => setShowManageAmenities(true)}
              className="ui-cta ui-cta-primary h-8 px-3"
            >
              Manage Amenities
            </button>
          </div>

          <p className="text-body-sm text-muted mb-1">Search amenities</p>
          <div className="relative mb-5">
            <Search size={13} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              value={amenitySearch}
              onChange={(e) => setAmenitySearch(e.target.value)}
              placeholder="Search"
              className="ui-input ui-input-icon-left h-9"
            />
          </div>

          {amenitiesLoading && <p className="text-muted text-xs">Loading amenities…</p>}

          {!amenitiesLoading && amenityCategories.length === 0 && (
            <p className="text-muted text-xs">No amenities found.</p>
          )}

          {amenityCategories.map((category) => {
            const filtered = filterSubCategories(category.subCategories)
            if (filtered.length === 0) return null

            return (
              <div key={category._id} className="mb-5">
                <h3 className="mb-2 text-xs font-medium text-white capitalize">
                  {category.category}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {filtered.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => toggleAmenity(category._id, item._id, item.name, item.image)}
                      className={`text-body-sm flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium transition-all ${
                        selectedAmenities.some((a) => a.subCategoryId === item._id)
                          ? 'border-white bg-white text-black'
                          : 'border-white/10 bg-transparent text-white hover:border-white/30'
                      }`}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-3.5 w-3.5 object-contain"
                        />
                      )}
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-brand-surface rounded-lg border border-white/5 p-5 shadow-xl">
          <h2 className="text-sm font-semibold text-white">Gallery</h2>
          <p className="text-body-sm text-muted mb-5">
            Provide details about your service offering
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-xs font-medium text-white">Venue Cover Image</p>
              <input
                ref={coverImageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverImageChange}
              />
              <div
                onClick={() => coverImageRef.current?.click()}
                className="bg-brand-bg hover:border-brand-accent/50 flex h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/10"
              >
                <Upload size={18} className="text-muted mb-1.5" />
                <span className="text-body-sm text-muted">Upload Image</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-white">Venue Image</p>
              <input
                ref={venueImageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleVenueImageChange}
              />
              <div
                onClick={() => venueImageRef.current?.click()}
                className="bg-brand-bg hover:border-brand-accent/50 flex h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/10"
              >
                <Upload size={18} className="text-muted mb-1.5" />
                <span className="text-body-sm text-muted">Upload Image</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-white">Photo Gallery</p>
            <input
              ref={galleryRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleGalleryChange}
            />
            <div
              onClick={() => galleryRef.current?.click()}
              className="bg-brand-bg hover:border-brand-accent/50 flex h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/10"
            >
              <Upload size={18} className="text-muted mb-1.5" />
              <span className="text-body-sm text-muted">Upload Images</span>
            </div>
          </div>

          {(venueData.venueCoverImage ||
            venueData.venueImage ||
            venueData.galleryImages.length > 0) && (
            <div className="mt-5">
              <p className="mb-3 text-xs font-medium text-white">Uploaded Images</p>

              <div className="flex flex-wrap gap-3">
                {venueData.venueCoverImage && (
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={URL.createObjectURL(venueData.venueCoverImage)}
                      alt="venue cover"
                      className="h-[80px] w-[120px] object-cover"
                    />
                    <span className="absolute right-0 bottom-0 left-0 bg-black/60 py-0.5 text-center text-[9px] text-white">
                      Cover
                    </span>
                    <button
                      type="button"
                      onClick={() => setVenueData((prev) => ({ ...prev, venueCoverImage: null }))}
                      className="bg-brand-danger absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-white shadow"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
                {venueData.venueImage && (
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={URL.createObjectURL(venueData.venueImage)}
                      alt="venue"
                      className="h-[80px] w-[120px] object-cover"
                    />
                    <span className="absolute right-0 bottom-0 left-0 bg-black/60 py-0.5 text-center text-[9px] text-white">
                      Venue
                    </span>
                    <button
                      type="button"
                      onClick={() => setVenueData((prev) => ({ ...prev, venueImage: null }))}
                      className="bg-brand-danger absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-white shadow"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
                {venueData.galleryImages.map((file, index) => (
                  <div
                    key={`gfile-${index}`}
                    className="relative h-[80px] w-[80px] overflow-hidden rounded-lg"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`gallery-new-${index}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="bg-brand-danger absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-white shadow"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-brand-surface rounded-lg border border-white/5 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Contact details</h2>
              <p className="text-body-sm text-muted">Provide details about your venue</p>
            </div>

            <button
              type="button"
              onClick={addContact}
              className="ui-cta ui-cta-primary flex h-8 items-center gap-1.5 px-3"
            >
              <Plus size={13} />
              Add contact
            </button>
          </div>

          {contacts.map((contact, index) => (
            <div key={index} className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-white">
                  Contact <span className="text-brand-accent">{index + 1}</span>
                </p>

                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="bg-brand-danger flex h-6 w-6 items-center justify-center rounded-md text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <User size={13} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
                  <input
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                    placeholder="Enter name here..."
                    className="ui-input ui-input-icon-left"
                  />
                </div>

                <div className="relative">
                  <Phone
                    size={13}
                    className="text-muted absolute top-1/2 left-3 -translate-y-1/2"
                  />
                  <input
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    placeholder="Phone"
                    className="ui-input ui-input-icon-left"
                  />
                </div>

                <div className="relative">
                  <Mail size={13} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
                  <input
                    value={contact.email}
                    onChange={(e) => updateContact(index, 'email', e.target.value)}
                    placeholder="Email ID"
                    className="ui-input ui-input-icon-left"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showManageAmenities && (
        <ManageAmenitiesModal
          onClose={() => setShowManageAmenities(false)}
          onAddAmenity={() => setShowAddAmenity(true)}
          selectedAmenities={selectedAmenities}
          setVenueData={setVenueData}
        />
      )}

      {showAddAmenity && <AddAmenityModal onClose={() => setShowAddAmenity(false)} />}
    </>
  )
}
