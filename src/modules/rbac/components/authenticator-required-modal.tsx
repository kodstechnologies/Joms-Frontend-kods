import { useRef } from 'react'
import { AlertTriangle } from 'lucide-react'

import { useDialogFocusTrap } from '@/shared/hooks/use-dialog-focus-trap'

type AuthenticatorRequiredModalProps = {
  open: boolean
  onSetup: () => void
}

export function AuthenticatorRequiredModal({ open, onSetup }: AuthenticatorRequiredModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogFocusTrap(open, () => undefined, dialogRef)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="authenticator-required-title"
        aria-describedby="authenticator-required-description"
        className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#1A1A1A] px-8 py-8 text-white shadow-2xl"
      >
        <h3
          id="authenticator-required-title"
          className="text-center text-lg font-semibold tracking-tight"
        >
          Authenticator setup required
        </h3>

        <div className="mt-8 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-[#3B1010]">
            <AlertTriangle
              className="size-8 text-[#E5484D]"
              fill="currentColor"
              aria-hidden="true"
            />
          </div>
        </div>

        <p
          id="authenticator-required-description"
          className="mt-6 text-center text-sm leading-6 text-white/70"
        >
          MFA is now enabled for your account. Please visit your profile to complete the
          authenticator setup.
        </p>

        <button
          type="button"
          onClick={onSetup}
          className="mt-8 h-11 w-full rounded-xl bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-sm font-semibold text-[#050505] hover:brightness-95"
        >
          Set Up Authenticator
        </button>
      </div>
    </div>
  )
}
