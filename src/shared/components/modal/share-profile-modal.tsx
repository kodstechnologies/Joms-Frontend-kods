import { Check, Link2, Mail, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

type ShareProfileModalProps = {
  open: boolean
  url: string
  title?: string
  onClose: () => void
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.78 11.78 0 0 0 12.04 0C5.5 0 .16 5.34.16 11.88c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.86 11.86 0 0 0 5.74 1.46h.01c6.54 0 11.88-5.34 11.88-11.88 0-3.18-1.24-6.16-3.41-8.45ZM12.05 21.15h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.74.98 1-3.64-.23-.37a9.82 9.82 0 0 1-1.5-5.24c0-5.42 4.41-9.83 9.84-9.83 2.63 0 5.1 1.02 6.96 2.88a9.78 9.78 0 0 1 2.88 6.95c0 5.43-4.42 9.85-9.84 9.85Zm5.4-7.37c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.62.72.23 1.37.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
    <path d="M22 12.07C22 6.5 17.52 2 12 2S2 6.5 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H8.08v-2.9h2.36V9.41c0-2.34 1.4-3.63 3.52-3.63 1.02 0 2.09.18 2.09.18v2.3h-1.18c-1.16 0-1.52.72-1.52 1.46v1.75h2.59l-.41 2.9h-2.18V22c4.78-.75 8.44-4.91 8.44-9.93Z" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
    <path d="M18.24 2H21l-6.51 7.44L22 22h-6.17l-4.82-6.3L5.4 22H2.63l6.97-7.97L2 2h6.32l4.36 5.77L18.24 2Zm-2.16 18h1.7L7.99 3.9H6.17L16.08 20Z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z" />
  </svg>
)

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
    <path d="M11.94 0C5.34 0 0 5.34 0 11.94S5.34 23.88 11.94 23.88 23.88 18.54 23.88 11.94 18.54 0 11.94 0Zm5.9 8.16-1.97 9.3c-.15.66-.54.82-1.1.51l-3.04-2.24-1.47 1.41c-.16.16-.3.3-.61.3l.22-3.09 5.62-5.08c.24-.22-.05-.34-.38-.13l-6.95 4.38-2.99-.93c-.65-.2-.66-.65.14-.97l11.7-4.51c.54-.2 1.02.13.83.85Z" />
  </svg>
)

export function ShareProfileModal({
  open,
  url,
  title = 'Share profile',
  onClose,
}: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false)

  if (!open || !url) return null

  const message = `${title} ${url}`.trim()

  const methods = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(message)}`,
      className: 'bg-[#25D366] text-white',
      icon: <WhatsAppIcon />,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      className: 'bg-[#1877F2] text-white',
      icon: <FacebookIcon />,
    },
    {
      id: 'x',
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      className: 'bg-black text-white',
      icon: <XIcon />,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      className: 'bg-[#0A66C2] text-white',
      icon: <LinkedInIcon />,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      className: 'bg-[#229ED9] text-white',
      icon: <TelegramIcon />,
    },
    {
      id: 'email',
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`,
      className: 'bg-white/15 text-white',
      icon: <Mail className="size-6" />,
    },
  ]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Unable to copy link')
    }
  }

  const openShare = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-profile-modal-title"
        className="ui-modal-shell w-full max-w-[520px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="share-profile-modal-title" className="text-h4 text-brand-text">
            Share
          </h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-brand-text">
            <X className="icon-md" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          <div className="flex gap-4 overflow-x-auto pb-1">
            {methods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => openShare(method.href)}
                className="flex w-[72px] shrink-0 flex-col items-center gap-2"
              >
                <span
                  className={`grid size-12 place-items-center rounded-full ${method.className}`}
                >
                  {method.icon}
                </span>
                <span className="text-body-sm text-brand-text text-center">{method.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
            <Link2 className="text-muted size-4 shrink-0" />
            <input
              readOnly
              value={url}
              className="text-body-sm min-w-0 flex-1 bg-transparent text-white outline-none"
            />
            <button
              type="button"
              onClick={() => void copyLink()}
              className="ui-modal-btn ui-modal-btn-gold h-8 shrink-0 px-3 text-[12px]"
            >
              {copied ? <Check className="size-3.5" /> : null}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
