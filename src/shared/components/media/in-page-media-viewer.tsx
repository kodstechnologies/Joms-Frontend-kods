import { useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export type InPageMediaItem = {
  url: string
  title?: string
  mimeType?: string
}

const isPdfMedia = (item: InPageMediaItem) => {
  if (item.mimeType === 'application/pdf') return true
  const cleanUrl = item.url.split('?')[0]?.toLowerCase() || ''
  const name = (item.title || '').toLowerCase()
  return (
    cleanUrl.endsWith('.pdf') ||
    name.endsWith('.pdf') ||
    /\/raw\/upload\//i.test(item.url) ||
    /format=pdf/i.test(item.url)
  )
}

type InPageMediaViewerProps = {
  open: boolean
  items: InPageMediaItem[]
  index: number
  onClose: () => void
  onIndexChange?: (index: number) => void
}

/** Fullscreen in-page image/PDF viewer — does not open a new browser tab. */
export function InPageMediaViewer({
  open,
  items,
  index,
  onClose,
  onIndexChange,
}: InPageMediaViewerProps) {
  const safeIndex = items.length > 0 ? Math.min(Math.max(index, 0), items.length - 1) : 0
  const current = items[safeIndex]
  const showPdf = current ? isPdfMedia(current) : false

  const showPrevious = useCallback(() => {
    if (items.length <= 1 || !onIndexChange) return
    onIndexChange((safeIndex - 1 + items.length) % items.length)
  }, [items.length, onIndexChange, safeIndex])

  const showNext = useCallback(() => {
    if (items.length <= 1 || !onIndexChange) return
    onIndexChange((safeIndex + 1) % items.length)
  }, [items.length, onIndexChange, safeIndex])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') showPrevious()
      if (event.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, showNext, showPrevious])

  if (!open || !current?.url) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close media viewer"
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

      {items.length > 1 ? (
        <button
          type="button"
          aria-label="Previous media"
          onClick={(event) => {
            event.stopPropagation()
            showPrevious()
          }}
          className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          <ChevronLeft className="size-6" />
        </button>
      ) : null}

      <div
        className="flex max-h-[85vh] w-full max-w-[min(960px,92vw)] flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        {showPdf ? (
          <iframe
            title={current.title || 'Document'}
            src={`${current.url}#toolbar=1&navpanes=0`}
            className="h-[78vh] w-full rounded-lg bg-white"
          />
        ) : (
          <img
            src={current.url}
            alt={current.title || 'Media'}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
          />
        )}
        <p className="mt-3 text-[13px] text-white/70">
          {current.title ? `${current.title} · ` : ''}
          {safeIndex + 1} / {items.length}
        </p>
      </div>

      {items.length > 1 ? (
        <button
          type="button"
          aria-label="Next media"
          onClick={(event) => {
            event.stopPropagation()
            showNext()
          }}
          className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          <ChevronRight className="size-6" />
        </button>
      ) : null}
    </div>
  )
}
