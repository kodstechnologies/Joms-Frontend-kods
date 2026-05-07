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
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {chars.map((char, index) => (
        <input
          key={`${id}-${index}`}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={char.trim()}
          onChange={(event) => {
            const nextChar = event.target.value.replace(/\D/g, '').slice(0, 1)
            const next = value.padEnd(length, ' ').slice(0, length).split('')
            next[index] = nextChar
            onChange(next.join('').replace(/\s/g, ''))

            if (nextChar) {
              const nextInput = document.getElementById(`${id}-${index + 1}`) as HTMLInputElement | null
              nextInput?.focus()
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !chars[index].trim()) {
              const prevInput = document.getElementById(`${id}-${index - 1}`) as HTMLInputElement | null
              prevInput?.focus()
            }
          }}
          id={`${id}-${index}`}
          className={cn(
            'h-12 w-10 rounded-xl border border-white/10 bg-white/5 text-center text-lg font-semibold text-slate-100 outline-none focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/20',
          )}
        />
      ))}
    </div>
  )
}

