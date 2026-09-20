import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  sendPartnerEmailOtp,
  sendPartnerPhoneOtp,
  verifyPartnerEmailOtp,
  verifyPartnerPhoneOtp,
} from '@/modules/auth/api/auth-api'
import { OtpInput } from '@/shared/components/form/otp-input'
import { useDialogFocusTrap } from '@/shared/hooks/use-dialog-focus-trap'
import { getApiErrorMessage } from '@/shared/lib/api-error'

type VerificationOtpModalProps = {
  open: boolean
  type: 'phone' | 'email'
  targetValue: string
  onClose: () => void
  onVerified: () => void
  length?: number
  sendOtp?: (target: string) => Promise<void>
  verifyOtp?: (target: string, code: string) => Promise<void>
}

/** Survives React Strict Mode remount so one Verify click cannot fire two OTP APIs. */
const inflightOtpSends = new Map<string, Promise<boolean>>()
const recentOtpSendAt = new Map<string, number>()
const OTP_CLIENT_DEDUP_MS = 3_000

const buildOtpSendKey = (type: 'phone' | 'email', value: string) =>
  `${type}:${value.trim().toLowerCase()}`

export function VerificationOtpModal({
  open,
  type,
  targetValue,
  onClose,
  onVerified,
  length = 4,
  sendOtp,
  verifyOtp,
}: VerificationOtpModalProps) {
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(30)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const sendOtpRef = useRef(sendOtp)
  const openSendKeyRef = useRef<string | null>(null)

  onCloseRef.current = onClose
  sendOtpRef.current = sendOtp

  const isVisible = open && otpSent
  useDialogFocusTrap(isVisible, onClose, dialogRef)

  const dispatchOtp = useCallback(
    async (value: string) => {
      if (sendOtpRef.current) {
        await sendOtpRef.current(value)
        return
      }
      if (type === 'phone') {
        await sendPartnerPhoneOtp(value)
        return
      }
      await sendPartnerEmailOtp(value)
    },
    [type],
  )

  const requestOtp = useCallback(
    async (options?: { force?: boolean }) => {
      const value = targetValue.trim()
      if (!value) return false

      const sendKey = buildOtpSendKey(type, value)
      const now = Date.now()

      if (!options?.force) {
        const lastSentAt = recentOtpSendAt.get(sendKey) || 0
        if (now - lastSentAt < OTP_CLIENT_DEDUP_MS) {
          setOtpSent(true)
          setTimer(30)
          return true
        }

        const existing = inflightOtpSends.get(sendKey)
        if (existing) {
          setIsSending(true)
          try {
            const ok = await existing
            if (ok) {
              setOtpSent(true)
              setTimer(30)
            }
            return ok
          } finally {
            setIsSending(false)
          }
        }
      }

      setIsSending(true)
      const sendPromise = (async () => {
        try {
          await dispatchOtp(value)
          recentOtpSendAt.set(sendKey, Date.now())
          toast.success(`OTP sent to ${value}`)
          return true
        } catch (err: unknown) {
          toast.error(
            getApiErrorMessage(err, 'Failed to send OTP. Please check the backend service.'),
          )
          return false
        }
      })()

      inflightOtpSends.set(sendKey, sendPromise)
      try {
        const ok = await sendPromise
        if (ok) {
          setOtpSent(true)
          setTimer(30)
        }
        return ok
      } finally {
        setIsSending(false)
        window.setTimeout(() => {
          if (inflightOtpSends.get(sendKey) === sendPromise) {
            inflightOtpSends.delete(sendKey)
          }
        }, 1500)
      }
    },
    [dispatchOtp, targetValue, type],
  )

  useEffect(() => {
    if (!open) {
      openSendKeyRef.current = null
      setOtp('')
      setTimer(30)
      setOtpSent(false)
      setIsSending(false)
      setIsVerifying(false)
      return
    }

    const value = targetValue.trim()
    if (!value) return

    const sendKey = buildOtpSendKey(type, value)
    // Same open session / Strict Mode remount: do not send again.
    if (openSendKeyRef.current === sendKey) return
    openSendKeyRef.current = sendKey

    let cancelled = false
    void requestOtp().then((ok) => {
      if (cancelled || ok) return
      openSendKeyRef.current = null
      onCloseRef.current()
    })

    return () => {
      cancelled = true
    }
  }, [open, requestOtp, targetValue, type])

  useEffect(() => {
    if (!isVisible) return

    const interval = window.setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isVisible])

  if (typeof document === 'undefined' || !isVisible) return null

  const handleResend = async () => {
    if (isSending) return
    setOtp('')
    await requestOtp({ force: true })
  }

  const handleVerify = async () => {
    if (otp.length < length) {
      toast.error(`Please enter the complete ${length}-digit OTP.`)
      return
    }

    try {
      setIsVerifying(true)
      if (verifyOtp) {
        await verifyOtp(targetValue.trim(), otp)
      } else if (type === 'phone') {
        await verifyPartnerPhoneOtp(targetValue.trim(), otp)
      } else {
        await verifyPartnerEmailOtp(targetValue.trim(), otp)
      }

      toast.success(
        type === 'email' ? 'Email verified successfully!' : 'Phone number verified successfully!',
      )
      onVerified()
      onClose()
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Invalid or expired OTP. Please try again.'))
    } finally {
      setIsVerifying(false)
    }
  }

  const title = type === 'email' ? 'Verify Email ID' : 'Verify Phone Number'
  const subtitle = `Enter the ${length}-digit OTP sent to ${targetValue || (type === 'email' ? 'your email' : 'your phone number')}`

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[#050505]/80 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-otp-modal-title"
        className="w-full max-w-[551px] rounded-2xl bg-[#141414] p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="verification-otp-modal-title" className="text-lg font-bold text-white">
              {title}
            </h2>
            <p className="mt-1 text-[13px] text-white/50">{subtitle}</p>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="my-8">
          <OtpInput
            length={length}
            value={otp}
            onChange={setOtp}
            autoFocus
            disabled={isVerifying}
            className="gap-3 sm:gap-5"
          />

          <div className="mt-6 text-center">
            {timer > 0 ? (
              <p className="text-xs font-medium text-white/50">
                0:{timer < 10 ? `0${timer}` : timer}
              </p>
            ) : (
              <button
                type="button"
                disabled={isSending}
                onClick={() => void handleResend()}
                className="text-xs font-semibold text-[#F6CB86] transition-colors hover:underline disabled:opacity-50"
              >
                {isSending ? 'Sending OTP…' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-[239px] flex-1 rounded-xl border border-white/30 bg-transparent text-xs font-medium text-white transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => void handleVerify()}
            className="inline-flex h-11 w-[238px] flex-1 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-xs font-semibold text-[#050505] transition-all hover:brightness-95 disabled:opacity-60"
          >
            <span>{isVerifying ? 'Verifying…' : 'Verify OTP'}</span>
            <span className="flex size-4 items-center justify-center rounded-full bg-black text-[#F6CB86]">
              <Check className="size-2.5 stroke-[3]" />
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
