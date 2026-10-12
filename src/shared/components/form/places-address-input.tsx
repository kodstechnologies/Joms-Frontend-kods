import { useEffect, useRef } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

import { env } from '@/config/env'
import { cn } from '@/shared/lib/cn'

type PlacesAddressValue = {
  address: string
  district: string
  state: string
  pincode: string
}

type PlacesAddressInputProps = {
  value: string
  onChange: (value: string) => void
  onPlaceSelect?: (value: PlacesAddressValue) => void
  className?: string
  placeholder?: string
  id?: string
}

let hasSetOptions = false

function initGoogleMapsOptions() {
  if (!hasSetOptions && env.googleMapsApiKey) {
    setOptions({
      key: env.googleMapsApiKey,
      v: 'weekly',
    })
    hasSetOptions = true
  }
}

export function PlacesAddressInput({
  value,
  onChange,
  onPlaceSelect,
  className,
  placeholder = 'Search address',
  id,
}: PlacesAddressInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!env.googleMapsApiKey) return
    let autocomplete: google.maps.places.Autocomplete | null = null
    let cancelled = false

    initGoogleMapsOptions()
    void importLibrary('places').then(() => {
      if (cancelled || !inputRef.current) return
      autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode', 'establishment'],
        fields: ['address_components', 'formatted_address', 'name'],
      })
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete?.getPlace()
        if (!place) return

        let route = ''
        let streetNumber = ''
        let locality = ''
        let sublocality = ''
        let adminArea = ''
        let postalCode = ''

        for (const component of place.address_components || []) {
          const types = component.types
          if (types.includes('street_number')) streetNumber = component.long_name
          if (types.includes('route')) route = component.long_name
          if (types.includes('locality')) locality = component.long_name
          if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            sublocality = component.long_name
          }
          if (types.includes('administrative_area_level_1')) adminArea = component.long_name
          if (types.includes('postal_code')) postalCode = component.long_name
        }

        const street = [streetNumber, route].filter(Boolean).join(' ')
        const address = street || place.formatted_address || place.name || value
        onChange(address)
        onPlaceSelect?.({
          address,
          district: sublocality || locality,
          state: adminArea,
          pincode: postalCode,
        })
      })
    })

    return () => {
      cancelled = true
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete)
      }
    }
  }, [onChange, onPlaceSelect])

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className={cn(className)}
    />
  )
}
