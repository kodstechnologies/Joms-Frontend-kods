import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { fetchConsultationById, fetchServiceById } from '../../api/service-api'
import { ConsultationViewPage } from './consultation-view-page'
import { ServiceViewPage } from './service-view-page'

type ListingKind = 'service' | 'consultation'

function kindFromTypeParam(type: string): ListingKind | null {
  if (!type.trim()) return null
  return type.toLowerCase().includes('consultation') ? 'consultation' : 'service'
}

async function probeKind(id: string, preferred: ListingKind | null): Promise<ListingKind> {
  const tryService = async () => {
    await fetchServiceById(id)
    return 'service' as const
  }
  const tryConsultation = async () => {
    await fetchConsultationById(id)
    return 'consultation' as const
  }

  const primary = preferred === 'consultation' ? tryConsultation : tryService
  const secondary = preferred === 'consultation' ? tryService : tryConsultation

  try {
    return await primary()
  } catch {
    try {
      return await secondary()
    } catch {
      return preferred ?? 'service'
    }
  }
}

export const ServiceManagementViewRoute = () => {
  const { id = '' } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const typeParam = searchParams.get('type') || ''
  const hintedKind = kindFromTypeParam(typeParam)

  const [kind, setKind] = useState<ListingKind | 'loading'>('loading')

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setKind('loading')
      if (!id) {
        if (!cancelled) setKind('service')
        return
      }

      const resolved = await probeKind(id, hintedKind)
      if (cancelled) return

      setKind(resolved)

      const expectedType = resolved === 'consultation' ? 'Consultation' : 'Service'
      if (kindFromTypeParam(typeParam) !== resolved) {
        const params = new URLSearchParams(searchParams)
        params.set('type', expectedType)
        setSearchParams(params, { replace: true })
      }
    }

    void run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: avoid loop on setSearchParams
  }, [id])

  if (kind === 'loading') {
    return (
      <div className="text-muted flex h-96 w-full items-center justify-center text-sm">
        Loading listing…
      </div>
    )
  }

  if (kind === 'consultation') {
    return <ConsultationViewPage />
  }

  return <ServiceViewPage />
}
