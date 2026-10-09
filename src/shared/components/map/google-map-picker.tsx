import { useEffect, useRef, useState, useCallback } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { MapPin, Locate, Search, Loader2 } from 'lucide-react'
import { env } from '@/config/env'

export interface LocationDetails {
  latitude: number
  longitude: number
  address?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  landmark?: string
  formattedAddress?: string
}

interface GoogleMapPickerProps {
  latitude?: number | null
  longitude?: number | null
  address?: string
  city?: string
  landmark?: string
  height?: string
  readOnly?: boolean
  showSearch?: boolean
  onLocationSelect?: (details: LocationDetails) => void
  className?: string
}

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }

const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1a1d24' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1d24' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a99ad' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e0a263' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e0a263' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#14282a' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5f9175' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2c3340' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1c222d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#97a3b5' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#4a3f32' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1c222d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f5cb86' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#252d3a' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e0a263' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1726' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4e5b70' }],
  },
]

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

export function GoogleMapPicker({
  latitude,
  longitude,
  address,
  city,
  landmark,
  height = '240px',
  readOnly = false,
  showSearch = true,
  onLocationSelect,
  className = '',
}: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerInstanceRef = useRef<google.maps.Marker | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [isLocating, setIsLocating] = useState(false)

  const extractAddressComponents = useCallback(
    (
      place: google.maps.GeocoderResult | google.maps.places.PlaceResult,
      lat: number,
      lng: number,
    ): LocationDetails => {
      let streetNumber = ''
      let route = ''
      let locality = ''
      let sublocality = ''
      let adminArea = ''
      let countryName = ''
      let postalCode = ''

      if (place.address_components) {
        for (const component of place.address_components) {
          const types = component.types
          if (types.includes('street_number')) streetNumber = component.long_name
          if (types.includes('route')) route = component.long_name
          if (types.includes('locality')) locality = component.long_name
          if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            sublocality = component.long_name
          }
          if (types.includes('administrative_area_level_1')) adminArea = component.long_name
          if (types.includes('country')) countryName = component.long_name
          if (types.includes('postal_code')) postalCode = component.long_name
        }
      }

      const placeName = 'name' in place && typeof place.name === 'string' ? place.name : ''
      const fullStreetAddress = [streetNumber, route].filter(Boolean).join(' ') || placeName || ''
      const displayLandmark = sublocality || landmark || ''
      const displayCity = locality || city || ''

      return {
        latitude: lat,
        longitude: lng,
        address: fullStreetAddress || place.formatted_address || '',
        city: displayCity,
        state: adminArea,
        country: countryName,
        pincode: postalCode,
        landmark: displayLandmark,
        formattedAddress: place.formatted_address || '',
      }
    },
    [city, landmark],
  )

  const handleReverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (!geocoderRef.current) return

      geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const firstResult = results[0]
          setSearchValue(firstResult.formatted_address || '')
          if (onLocationSelect) {
            onLocationSelect(extractAddressComponents(firstResult, lat, lng))
          }
        } else {
          if (onLocationSelect) {
            onLocationSelect({
              latitude: lat,
              longitude: lng,
              address: address || '',
              city: city || '',
              landmark: landmark || '',
            })
          }
        }
      })
    },
    [address, city, extractAddressComponents, landmark, onLocationSelect],
  )

  useEffect(() => {
    let isMounted = true

    if (!env.googleMapsApiKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadError('Google Maps API Key is missing.')
      setIsLoading(false)
      return
    }

    initGoogleMapsOptions()

    Promise.all([importLibrary('maps'), importLibrary('places')])
      .then(() => {
        if (!isMounted || !mapRef.current) return

        const initialLat = latitude ?? DEFAULT_CENTER.lat
        const initialLng = longitude ?? DEFAULT_CENTER.lng
        const centerPos = { lat: initialLat, lng: initialLng }

        const map = new google.maps.Map(mapRef.current, {
          center: centerPos,
          zoom: latitude && longitude ? 15 : 12,
          styles: DARK_MAP_STYLE,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: !readOnly,
        })
        mapInstanceRef.current = map

        const marker = new google.maps.Marker({
          position: centerPos,
          map,
          draggable: !readOnly,
          title: 'Venue Location',
          animation: google.maps.Animation.DROP,
        })
        markerInstanceRef.current = marker

        geocoderRef.current = new google.maps.Geocoder()

        if (!readOnly) {
          marker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              const lat = e.latLng.lat()
              const lng = e.latLng.lng()
              handleReverseGeocode(lat, lng)
            }
          })

          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              const lat = e.latLng.lat()
              const lng = e.latLng.lng()
              marker.setPosition({ lat, lng })
              handleReverseGeocode(lat, lng)
            }
          })

          if (searchInputRef.current) {
            const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
              types: ['geocode', 'establishment'],
            })
            autocompleteRef.current = autocomplete

            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace()
              if (place.geometry?.location) {
                const lat = place.geometry.location.lat()
                const lng = place.geometry.location.lng()
                map.setCenter({ lat, lng })
                map.setZoom(16)
                marker.setPosition({ lat, lng })
                setSearchValue(place.formatted_address || place.name || '')
                if (onLocationSelect) {
                  onLocationSelect(extractAddressComponents(place, lat, lng))
                }
              }
            })
          }
        }

        setIsLoading(false)
      })
      .catch(() => {
        if (!isMounted) return
        setLoadError('Failed to load Google Maps API.')
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [readOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      mapInstanceRef.current &&
      markerInstanceRef.current &&
      latitude != null &&
      longitude != null
    ) {
      const pos = { lat: latitude, lng: longitude }
      mapInstanceRef.current.setCenter(pos)
      markerInstanceRef.current.setPosition(pos)
    }
  }, [latitude, longitude])

  const handleLocateMe = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        if (mapInstanceRef.current && markerInstanceRef.current) {
          const pos = { lat, lng }
          mapInstanceRef.current.setCenter(pos)
          mapInstanceRef.current.setZoom(16)
          markerInstanceRef.current.setPosition(pos)
          handleReverseGeocode(lat, lng)
        }
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showSearch && !readOnly && (
        <div className="relative">
          <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search location or landmark on Google Maps..."
            className="ui-input ui-input-icon-left w-full"
          />
        </div>
      )}

      <div
        className="bg-brand-surface relative overflow-hidden rounded-lg border border-white/10"
        style={{ height }}
      >
        <div ref={mapRef} className="h-full w-full" />

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white backdrop-blur-xs">
            <Loader2 className="text-brand-accent mb-2 size-7 animate-spin" />
            <p className="text-xs font-medium text-slate-300">Loading Google Maps...</p>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-4 text-center text-white">
            <MapPin className="mb-2 size-8 text-amber-400" />
            <p className="text-xs font-semibold text-red-400">{loadError}</p>
            <p className="text-muted mt-1 text-[11px]">
              {address ? `${address}, ${city || ''}` : 'Bengaluru, Karnataka'}
            </p>
          </div>
        )}

        {!readOnly && !isLoading && !loadError && (
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            title="Use current location"
            className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-md border border-white/20 bg-black/80 px-3 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-xs transition-colors hover:bg-black disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Locate className="size-3.5 text-amber-400" />
            )}
            Locate Me
          </button>
        )}
      </div>
    </div>
  )
}
