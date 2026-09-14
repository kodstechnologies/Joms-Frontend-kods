import { useCallback, useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  sendPartnerEmailOtp,
  sendPartnerPhoneOtp,
  verifyPartnerEmailOtp,
  verifyPartnerPhoneOtp,
} from '@/modules/auth/api/auth-api'
import { OtpInput } from '@/shared/components/form/otp-input'

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
  const [prevOpen, setPrevOpen] = useState(open)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setOtp('')
      setTimer(30)
    }
  }

  const requestOtp = useCallback(async () => {
    if (!targetValue?.trim()) return
    setIsSending(true)
    try {
      if (sendOtp) {
        await sendOtp(targetValue.trim())
      } else if (type === 'phone') {
        await sendPartnerPhoneOtp(targetValue.trim())
      } else {
        await sendPartnerEmailOtp(targetValue.trim())
      }
      toast.success(`OTP sent to ${targetValue}`)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string }; status?: number } }
      const msg =
        error?.response?.data?.message || 'Failed to send OTP. Please check the backend service.'
      toast.error(msg)
      if (
        error?.response?.status === 409 ||
        /already using|already registered|already exists/i.test(msg)
      ) {
        onClose()
      }
    } finally {
      setIsSending(false)
    }
  }, [onClose, sendOtp, targetValue, type])

  useEffect(() => {
    if (!open) return

    const sendId = window.setTimeout(() => {
      void requestOtp()
    }, 0)

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.clearTimeout(sendId)
      clearInterval(interval)
      document.body.style.overflow = previousOverflow
    }
  }, [open, requestOtp])

  if (!open) return null

  const handleResend = async () => {
    if (isSending) return
    setIsSending(true)
    try {
      setTimer(30)
      setOtp('')
      await requestOtp()
    } finally {
      setIsSending(false)
    }
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
      const error = err as { response?: { data?: { message?: string } } }
      const msg = error?.response?.data?.message || 'Invalid or expired OTP. Please try again.'
      toast.error(msg)
    } finally {
      setIsVerifying(false)
    }
  }

  const title = type === 'email' ? 'Verify Email ID' : 'Verify Phone Number'
  const subtitle = `Enter the ${length}-digit OTP sent to ${targetValue || (type === 'email' ? 'your email' : 'your phone number')}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050505]/80 px-4 py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
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
                onClick={handleResend}
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
            onClick={handleVerify}
            className="inline-flex h-11 w-[238px] flex-1 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-xs font-semibold text-[#050505] transition-all hover:brightness-95 disabled:opacity-60"
          >
            <span>{isVerifying ? 'Verifying…' : 'Verify OTP'}</span>
            <span className="flex size-4 items-center justify-center rounded-full bg-black text-[#F6CB86]">
              <Check className="size-2.5 stroke-[3]" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
