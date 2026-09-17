import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Copy, X } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { startAuthenticatorSetup, verifyAuthenticatorSetup } from '@/modules/rbac/api/rbac-api'
import { rbacKeys } from '@/modules/rbac/hooks/use-rbac'
import { cn } from '@/shared/lib/cn'

type AuthenticatorSetupModalProps = {
  open: boolean
  onClose: () => void
  onEnrolled?: () => void
}

export function AuthenticatorSetupModal({
  open,
  onClose,
  onEnrolled,
}: AuthenticatorSetupModalProps) {
  const [secret, setSecret] = useState('')
  const [enrolled, setEnrolled] = useState(false)
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setCode('')
    setIsLoading(true)

    void startAuthenticatorSetup()
      .then((response) => {
        if (cancelled) return
        const data = response.data
        setSecret(data.secret || '')
        setEnrolled(Boolean(data.enrolled || data.mfaEnabled))
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, 'Failed to start authenticator setup'))
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  const handleCopy = async () => {
    const value = secret.replace(/\s+/g, '')
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Authenticator setup key copied')
    } catch {
      toast.error('Failed to copy code')
    }
  }

  const handleVerify = async () => {
    if (enrolled) {
      onClose()
      return
    }
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error('Enter a valid 6 digit authenticator code')
      return
    }
    try {
      setIsVerifying(true)
      await verifyAuthenticatorSetup(code.trim())
      setEnrolled(true)
      await queryClient.invalidateQueries({ queryKey: rbacKeys.me })
      await queryClient.invalidateQueries({ queryKey: rbacKeys.contactSetup })
      toast.success('Authenticator enrolled successfully')
      onEnrolled?.()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid authenticator code'))
    } finally {
      setIsVerifying(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[310] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#141414] p-6 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold">Authenticator setup required</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close authenticator setup"
          >
            <X className="size-5" />
          </button>
        </div>

        {isLoading ? (
          <p className="mt-8 text-center text-sm text-white/50">Loading authenticator setup…</p>
        ) : enrolled ? (
          <div className="mt-8 rounded-xl border border-[#1E563D]/50 bg-[#143D2B] px-4 py-5 text-center">
            <p className="text-sm font-semibold text-[#00E065]">Authenticator is enrolled</p>
            <p className="mt-1 text-xs text-white/60">
              This account will use a 6-digit authenticator code at login when MFA is enabled.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Authenticator app code
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={secret}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#050505] px-4 pr-11 font-mono text-sm tracking-[0.18em] text-white"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white/70 hover:text-white"
                  aria-label="Copy authenticator setup key"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Enter 6 digit code here <span className="text-[#E0A263]">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter here"
                className="h-11 w-full rounded-xl border border-white/10 bg-[#050505] px-4 text-sm text-white placeholder:text-white/35"
              />
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-white/20 bg-transparent text-sm font-medium text-white hover:bg-white/5"
          >
            Cancel
          </button>
          {!enrolled ? (
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying}
              className={cn(
                'h-11 rounded-xl bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-sm font-semibold text-[#050505] hover:brightness-95 disabled:opacity-50',
              )}
            >
              {isVerifying ? 'Setting up…' : 'Set Up Authenticator'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-sm font-semibold text-[#050505] hover:brightness-95"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
