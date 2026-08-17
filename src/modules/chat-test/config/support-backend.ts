export type SupportBackendMode = 'local' | 'server'

export const SUPPORT_MODE_STORAGE_KEY = 'joms_support_backend_mode'
export const SUPPORT_LOCAL_BASE_URL = 'http://localhost:8001'
export const SUPPORT_SERVER_BASE_URL = 'https://admin.api.kods.online'

export const resolveSupportBaseUrl = (mode: SupportBackendMode) =>
  mode === 'server' ? SUPPORT_SERVER_BASE_URL : SUPPORT_LOCAL_BASE_URL

export const loadSupportBackendMode = (): SupportBackendMode => {
  try {
    const raw = localStorage.getItem(SUPPORT_MODE_STORAGE_KEY)
    return raw === 'server' ? 'server' : 'local'
  } catch {
    return 'local'
  }
}

export const saveSupportBackendMode = (mode: SupportBackendMode) => {
  try {
    localStorage.setItem(SUPPORT_MODE_STORAGE_KEY, mode)
  } catch {
    // ignore storage failures
  }
}

export const DEFAULT_SUPPORT_CATEGORIES = [
  'Service Marketplace',
  'Milestones',
  "FAQ's",
  'Others',
] as const
