import { useEffect, useId, useMemo, useRef } from 'react'

import { cn } from '@/shared/lib/cn'

export const OTP_SLOT_CLASSNAME =
  'h-12 w-11 rounded-b-2xl border-0 border-b-2 border-[#717182]/50 bg-transparent text-center text-xl font-semibold text-white outline-none transition-colors sm:h-14 sm:w-13 sm:text-2xl focus:border-b-2 focus:border-[#E0A263] focus:ring-0'

type OtpInputProps = {
  value: string
  onChange: (next: string) => void
  length?: number
  className?: string
  slotClassName?: string
  autoFocus?: boolean
  disabled?: boolean
}

const digitsOnly = (raw: string, length: number) => raw.replace(/\D/g, '').slice(0, length)

export function OtpInput({
  value,
  onChange,
  length = 6,
  className,
  slotClassName,
  autoFocus = false,
  disabled = false,
}: OtpInputProps) {
  const id = useId()
  const firstRef = useRef<HTMLInputElement | null>(null)
  const chars = useMemo(
    () => digitsOnly(value, length).padEnd(length, ' ').slice(0, length).split(''),
    [length, value],
  )

  useEffect(() => {
    if (!autoFocus || disabled) return
    const timer = window.setTimeout(() => firstRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [autoFocus, disabled])

  const focusAt = (index: number) => {
    const el = document.getElementById(`${id}-${index}`) as HTMLInputElement | null
    el?.focus()
  }

  return (
    <div
      className={cn('flex items-center justify-center gap-2.5 sm:gap-3', className)}
      role="group"
      aria-label="One-time password"
    >
      {chars.map((char, index) => (
        <input
          key={`${id}-${index}`}
          ref={index === 0 ? firstRef : undefined}
          id={`${id}-${index}`}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1} of ${length}`}
          value={char.trim()}
          disabled={disabled}
          onChange={(event) => {
            const nextChar = event.target.value.replace(/\D/g, '').slice(0, 1)
            const next = digitsOnly(value, length).padEnd(length, ' ').slice(0, length).split('')
            next[index] = nextChar
            onChange(next.join('').replace(/\s/g, ''))

            if (nextChar) {
              focusAt(index + 1)
            }
          }}
          onPaste={(event) => {
            event.preventDefault()
            const pasted = digitsOnly(event.clipboardData.getData('text'), length)
            if (!pasted) return
            const current = digitsOnly(value, length).padEnd(length, ' ').slice(0, length).split('')
            pasted.split('').forEach((digit, offset) => {
              if (index + offset < length) {
                current[index + offset] = digit
              }
            })
            onChange(current.join('').replace(/\s/g, ''))
            focusAt(Math.min(index + pasted.length, length - 1))
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !chars[index].trim()) {
              focusAt(index - 1)
            }
          }}
          className={cn(OTP_SLOT_CLASSNAME, char.trim() && 'border-white', slotClassName)}
        />
      ))}
    </div>
  )
}
