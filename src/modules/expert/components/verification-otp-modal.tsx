import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  sendPartnerEmailOtp,
  sendPartnerPhoneOtp,
  verifyPartnerEmailOtp,
  verifyPartnerPhoneOtp,
} from '@/modules/auth/api/auth-api'

type VerificationOtpModalProps = {
  open: boolean
  type: 'phone' | 'email'
  targetValue: string
  onClose: () => void
  onVerified: () => void
}

export function VerificationOtpModal({
  open,
  type,
  targetValue,
  onClose,
  onVerified,
}: VerificationOtpModalProps) {
  const [otp, setOtp] = useState(['', '', '', ''])
  const [timer, setTimer] = useState(30)
  const [prevOpen, setPrevOpen] = useState(open)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setOtp(['', '', '', ''])
      setTimer(30)
    }
  }

  const requestOtp = useCallback(async () => {
    if (!targetValue?.trim()) return
    try {
      if (type === 'phone') {
        await sendPartnerPhoneOtp(targetValue.trim())
      } else {
        await sendPartnerEmailOtp(targetValue.trim())
      }
      toast.success(`OTP sent to ${targetValue}`)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const msg =
        error?.response?.data?.message || 'Failed to send OTP. Please check the backend service.'
      toast.error(msg)
    }
  }, [targetValue, type])

  useEffect(() => {
    if (!open) return

    void requestOtp()

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    const timerFocus = setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      clearInterval(interval)
      clearTimeout(timerFocus)
      document.body.style.overflow = previousOverflow
    }
  }, [open, requestOtp])

  if (!open) return null

  const handleInputChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '')
    if (!clean) {
      const nextOtp = [...otp]
      nextOtp[index] = ''
      setOtp(nextOtp)
      return
    }

    const nextOtp = [...otp]
    if (clean.length > 1) {
      const digits = clean.slice(0, 4).split('')
      digits.forEach((digit, dIdx) => {
        if (index + dIdx < 4) {
          nextOtp[index + dIdx] = digit
        }
      })
      setOtp(nextOtp)
      const nextFocusIdx = Math.min(index + digits.length, 3)
      inputRefs.current[nextFocusIdx]?.focus()
      return
    }

    nextOtp[index] = clean.slice(-1)
    setOtp(nextOtp)

    if (index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResend = async () => {
    if (isSending) return
    setIsSending(true)
    try {
      setTimer(30)
      setOtp(['', '', '', ''])
      inputRefs.current[0]?.focus()
      await requestOtp()
    } finally {
      setIsSending(false)
    }
  }

  const handleVerify = async () => {
    const fullOtp = otp.join('')
    if (fullOtp.length < 4) {
      toast.error('Please enter the complete 4-digit OTP.')
      return
    }

    try {
      setIsVerifying(true)
      if (type === 'phone') {
        await verifyPartnerPhoneOtp(targetValue.trim(), fullOtp)
      } else {
        await verifyPartnerEmailOtp(targetValue.trim(), fullOtp)
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
  const subtitle = `Enter the 4-digit OTP sent to ${targetValue || (type === 'email' ? 'your email' : 'your phone number')}`

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
            className="flex size-6 items-center justify-center text-white/70 transition-colors hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="my-8">
          <div className="flex items-center justify-center gap-5">
            {otp.map((digit, index) => (
              <div
                key={index}
                className="flex cursor-text flex-col items-center"
                onClick={() => inputRefs.current[index]?.focus()}
              >
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="h-10 w-[50px] bg-transparent text-center text-2xl font-bold text-white caret-white focus:outline-none"
                />
                <svg
                  className={`mt-1 h-[10px] w-[50px] transition-colors ${
                    digit ? 'text-white' : 'text-white/40'
                  }`}
                  viewBox="0 0 50 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 2 1.5 C 2 7, 7 8.5, 12 8.5 L 38 8.5 C 43 8.5, 48 7, 48 1.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ))}
          </div>

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
