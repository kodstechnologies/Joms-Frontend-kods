import { useCallback } from 'react'
import type { NavigateFunction, NavigateOptions, To } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const hasHistoryEntry = () => {
  if (typeof window === 'undefined') return false
  const idx = (window.history.state as { idx?: number } | null)?.idx
  return typeof idx === 'number' ? idx > 0 : window.history.length > 1
}

// Goes back when this tab has history. Otherwise it replaces the page with the fallback.
export const navigateBackOrFallback = (
  navigate: NavigateFunction,
  fallback: To,
  options?: NavigateOptions,
) => {
  if (hasHistoryEntry()) {
    navigate(-1)
    return
  }

  navigate(fallback, { replace: true, ...options })
}

export const useNavigateBackOrFallback = (fallback: To, options?: NavigateOptions) => {
  const navigate = useNavigate()

  return useCallback(
    () => navigateBackOrFallback(navigate, fallback, options),
    [fallback, navigate, options],
  )
}
