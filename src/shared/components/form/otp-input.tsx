import { useId, useMemo } from 'react'

import { cn } from '@/shared/lib/cn'

type OtpInputProps = {
  value: string
  onChange: (next: string) => void
  length?: number
  className?: string
}

export function OtpInput({ value, onChange, length = 6, className }: OtpInputProps) {
  const id = useId()
  const chars = useMemo(() => value.padEnd(length, ' ').slice(0, length).split(''), [length, value])

  return (
    <div
      className={cn('flex items-center justify-center gap-2', className)}
      role="group"
      aria-label="One-time password"
    >
      {chars.map((char, index) => (
        <input
          key={`${id}-${index}`}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1} of ${length}`}
          value={char.trim()}
          onChange={(event) => {
            const nextChar = event.target.value.replace(/\D/g, '').slice(0, 1)
            const next = value.padEnd(length, ' ').slice(0, length).split('')
            next[index] = nextChar
            onChange(next.join('').replace(/\s/g, ''))

            if (nextChar) {
              const nextInput = document.getElementById(
                `${id}-${index + 1}`,
              ) as HTMLInputElement | null
              nextInput?.focus()
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !chars[index].trim()) {
              const prevInput = document.getElementById(
                `${id}-${index - 1}`,
              ) as HTMLInputElement | null
              prevInput?.focus()
            }
          }}
          id={`${id}-${index}`}
          className={cn(
            'rounded-brand-md bg-brand-surface text-brand-text focus:border-brand-accent/50 focus:ring-brand-accent/20 h-12 w-10 border border-white/10 text-center text-lg font-semibold outline-none focus:ring-2',
          )}
        />
      ))}
    </div>
  )
}
