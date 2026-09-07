import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { toast } from 'sonner'

export type IpAddressFormValues = {
  ipAddress: string
  description: string
}

type IpAddressModalProps = {
  open: boolean
  mode: 'add' | 'edit'
  initialValues?: IpAddressFormValues
  onClose: () => void
  onSubmit: (values: IpAddressFormValues) => void
}

export function IpAddressModal({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: IpAddressModalProps) {
  if (!open) return null

  return createPortal(
    <IpAddressModalContent
      key={`${mode}-${initialValues?.ipAddress ?? 'new'}`}
      mode={mode}
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
    />,
    document.body,
  )
}

function IpAddressModalContent({
  mode,
  initialValues,
  onClose,
  onSubmit,
}: {
  mode: 'add' | 'edit'
  initialValues?: IpAddressFormValues
  onClose: () => void
  onSubmit: (values: IpAddressFormValues) => void
}) {
  const [ipAddress, setIpAddress] = useState(initialValues?.ipAddress ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const title = mode === 'add' ? 'Add IP Address' : 'Edit IP Address'
  const subtitle =
    mode === 'add' ? 'Add a new IP address to the whitelist' : 'Update the IP address details'
  const submitLabel = mode === 'add' ? 'Add IP Address' : 'Update IP Address'

  const handleSubmit = () => {
    const trimmedIp = ipAddress.trim()
    if (!trimmedIp) {
      toast.error('Enter an IP address')
      return
    }
    onSubmit({
      ipAddress: trimmedIp,
      description: description.trim(),
    })
  }

  return (
    <div className="ip-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="ip-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ip-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ip-modal-header">
          <div className="ip-modal-heading">
            <h2 id="ip-modal-title" className="ip-modal-title">
              {title}
            </h2>
            <p className="ip-modal-subtitle">{subtitle}</p>
          </div>
          <button type="button" className="ip-modal-close" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </button>
        </header>

        <div className="ip-modal-body">
          <div className="ip-modal-field">
            <label className="ip-modal-label" htmlFor="ip-modal-address">
              IP Address
            </label>
            <input
              id="ip-modal-address"
              className="ip-modal-input"
              value={ipAddress}
              onChange={(event) => setIpAddress(event.target.value)}
              placeholder="Text here"
              autoFocus
            />
          </div>

          <div className="ip-modal-field">
            <label className="ip-modal-label" htmlFor="ip-modal-description">
              Description
            </label>
            <input
              id="ip-modal-description"
              className="ip-modal-input"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Text here"
            />
          </div>
        </div>

        <footer className="ip-modal-footer">
          <button type="button" className="ip-modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ip-modal-btn-submit" onClick={handleSubmit}>
            {submitLabel}
          </button>
        </footer>
      </div>
    </div>
  )
}
