import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/shared/lib/cn'
import type { ExpertCustomLinkDetails } from '@/modules/expert/api/expert-api'

type CustomUrlModalProps = {
  open: boolean
  expertName: string
  details: ExpertCustomLinkDetails | null
  isLoading?: boolean
  isSaving?: boolean
  onClose: () => void
  onToggleVisible: (visible: boolean) => void
}

const formatCreatedAt = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  const time = date
    .toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(' ', '')
    .replace(/([ap]m)/i, (match) => match.toUpperCase())
  return `${month} ${day} , ${time}`
}

function CustomUrlModalContent({
  expertName,
  details,
  isLoading,
  isSaving,
  onClose,
  onToggleVisible,
}: Omit<CustomUrlModalProps, 'open'>) {
  const [visible, setVisible] = useState(details?.visible !== false)
  const link = details?.link || '—'

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050505]/80 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-url-modal-title"
        className="ui-modal-shell w-full max-w-[560px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header items-start">
          <div>
            <h2 id="custom-url-modal-title" className="text-h4 text-brand-text">
              Custom URL
            </h2>
            <p className="text-body-sm text-muted mt-1">Expert: {expertName || '—'}</p>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="text-muted hover:text-brand-text rounded-full p-1.5 transition-colors hover:bg-white/10"
          >
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          {isLoading ? (
            <p className="text-muted text-sm">Loading custom URL details...</p>
          ) : (
            <>
              <div>
                <label className="text-body-sm text-muted mb-1.5 block">Link</label>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2.5">
                  <input
                    type="text"
                    readOnly
                    value={link}
                    className="text-body-sm text-brand-text min-w-0 flex-1 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    role="switch"
                    aria-checked={visible}
                    aria-label="Activate or suspend custom URL microsite"
                    disabled={!details?.link || isSaving}
                    onClick={() => {
                      if (!details?.link) {
                        toast.error('This expert does not have a custom URL yet')
                        return
                      }
                      const next = !visible
                      setVisible(next)
                      onToggleVisible(next)
                    }}
                    className={cn(
                      'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                      visible ? 'bg-white' : 'bg-white/20',
                      (!details?.link || isSaving) && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 size-5 rounded-full bg-[#111] transition-transform',
                        visible ? 'left-[22px]' : 'left-0.5',
                      )}
                    />
                  </button>
                </div>
                <p className="text-body-sm text-muted mt-2">
                  {visible
                    ? 'Custom URL is active — visible in Profile and the partner app.'
                    : 'Custom URL is suspended — partner app shows "Custom link unavailable" and the public microsite is offline.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                <div>
                  <p className="text-body-sm text-muted">Created at</p>
                  <p className="text-body-md-semibold text-brand-text mt-1">
                    {formatCreatedAt(details?.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-muted">Status</p>
                  <p className="text-body-md-semibold text-brand-text mt-1">
                    {details?.status || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-muted">Usage</p>
                  <p className="text-body-md-semibold text-brand-text mt-1">
                    {details?.usage || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-muted">Traffic</p>
                  <p className="text-body-md-semibold text-brand-text mt-1">
                    {details?.traffic || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-muted">Orders</p>
                  <p className="text-body-md-semibold text-brand-text mt-1">
                    {details?.orders ?? 0}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function CustomUrlModal({
  open,
  expertName,
  details,
  isLoading,
  isSaving,
  onClose,
  onToggleVisible,
}: CustomUrlModalProps) {
  if (!open) return null

  const contentKey = details
    ? `${details.link ?? 'none'}:${details.visible ? 'on' : 'off'}`
    : `pending:${isLoading ? '1' : '0'}`

  return (
    <CustomUrlModalContent
      key={contentKey}
      expertName={expertName}
      details={details}
      isLoading={isLoading}
      isSaving={isSaving}
      onClose={onClose}
      onToggleVisible={onToggleVisible}
    />
  )
}
