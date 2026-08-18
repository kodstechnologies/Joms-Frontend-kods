import { useEffect, useRef, useState } from 'react'

import {
  fetchGoogleAuthConfig,
  partnerSignInWithGoogle,
  persistPartnerSession,
  type PartnerLoginResult,
} from '../api/partner-auth.api'

type PartnerGoogleSignInProps = {
  onSuccess: (partner: PartnerLoginResult) => void
}

type GisCredentialResponse = {
  credential?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: {
            client_id: string
            callback: (response: GisCredentialResponse) => void
            ux_mode?: string
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

const loadGsiScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existing = document.getElementById('google-gsi-client') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.id = 'google-gsi-client'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'))
    document.head.appendChild(script)
  })

export function PartnerGoogleSignIn({ onSuccess }: PartnerGoogleSignInProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const onSuccessRef = useRef(onSuccess)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const config = await fetchGoogleAuthConfig()
        await loadGsiScript()
        if (!active || !buttonRef.current || !window.google?.accounts?.id) return

        window.google.accounts.id.initialize({
          client_id: config.clientId,
          ux_mode: 'popup',
          callback: (response) => {
            const idToken = response.credential
            if (!idToken) {
              setError('Google did not return an ID token')
              return
            }
            setBusy(true)
            setError(null)
            void partnerSignInWithGoogle(idToken)
              .then((data) => {
                if (!data?.accessToken || !data?.id) {
                  throw new Error('Google sign-in response missing token')
                }
                persistPartnerSession(data)
                onSuccessRef.current(data)
              })
              .catch((err: unknown) => {
                const msg =
                  (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || (err instanceof Error ? err.message : 'Google sign-in failed')
                setError(msg)
              })
              .finally(() => setBusy(false))
          },
        })

        buttonRef.current.replaceChildren()
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 320,
        })
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Could not start Google Sign-In')
      }
    })()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-2">
      <div ref={buttonRef} className="flex min-h-10 justify-center overflow-hidden" />
      {busy ? <p className="text-center text-xs text-zinc-400">Signing in with Google…</p> : null}
      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  )
}
