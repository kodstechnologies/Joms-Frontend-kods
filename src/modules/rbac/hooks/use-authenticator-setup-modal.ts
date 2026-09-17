import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { AUTHENTICATOR_SETUP_QUERY } from '../utils/authenticator-setup'

export function useAuthenticatorSetupModal() {
  const [searchParams, setSearchParams] = useSearchParams()
  const forcedOpen = searchParams.get(AUTHENTICATOR_SETUP_QUERY) === '1'
  const [manualOpen, setManualOpen] = useState(false)
  const open = manualOpen || forcedOpen

  const clearQuery = useCallback(() => {
    if (!searchParams.has(AUTHENTICATOR_SETUP_QUERY)) return
    const next = new URLSearchParams(searchParams)
    next.delete(AUTHENTICATOR_SETUP_QUERY)
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const close = useCallback(() => {
    setManualOpen(false)
    clearQuery()
  }, [clearQuery])

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        setManualOpen(true)
        return
      }
      close()
    },
    [close],
  )

  return { open, setOpen, close }
}
