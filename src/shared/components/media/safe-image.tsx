import { useState, type ReactNode } from 'react'
import { ImageOff } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

export function SafeImage({
  src,
  alt,
  className,
  fallback,
}: {
  src?: string | null
  alt: string
  className?: string
  fallback?: ReactNode
}) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    if (fallback) return <>{fallback}</>
    return (
      <div className={cn('text-muted flex items-center justify-center bg-black', className)}>
        <ImageOff className="size-5" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  )
}
