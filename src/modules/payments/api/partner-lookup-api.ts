import { authApiClient } from '@/shared/lib/axios'

type PartnerDetailsRow = {
  _id?: string
  id?: string
  fullname?: string
  name?: string
}

export async function fetchPartnerDisplayNames(ids: string[]) {
  const unique = [...new Set(ids.map(String).filter(Boolean))]
  if (!unique.length) return {} as Record<string, string>

  const res = await authApiClient.post<{
    success?: boolean
    data?: PartnerDetailsRow[]
  }>('/auth/partners/details', { ids: unique })

  const map: Record<string, string> = {}
  for (const row of res.data?.data || []) {
    const id = String(row._id || row.id || '')
    const name = row.fullname || row.name
    if (id && name) map[id] = name
  }
  return map
}
