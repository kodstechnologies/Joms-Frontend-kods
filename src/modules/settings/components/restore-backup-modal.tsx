import { useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

import type { BackupHistoryRow } from '../types/settings'
import { cn } from '@/shared/lib/cn'

type RestoreBackupModalProps = {
  open: boolean
  backup: BackupHistoryRow | null
  onClose: () => void
  onSubmit: (mode: string) => void
}

const restoreOptions = [
  {
    key: 'immediate',
    label: 'Restore Immediately',
    description: 'Restore to production environment now',
  },
  {
    key: 'staging',
    label: 'Restore to staging',
    description: 'Verify data in staging before pushing to production',
  },
  {
    key: 'schedule',
    label: 'Schedule Restore',
    description: 'Set specific time for a new restore',
  },
]

export function RestoreBackupModal({ open, backup, onClose, onSubmit }: RestoreBackupModalProps) {
  const [selected, setSelected] = useState('immediate')
  const [confirmText, setConfirmText] = useState('')

  if (!open || !backup) return null

  const canSubmit = confirmText.trim().toUpperCase() === 'CONFIRM'

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="ui-modal-shell">
        <div className="ui-modal-header">
          <div>
            <h2 className="text-h2 text-brand-text">Restore System Backup</h2>
            <p className="text-body-sm text-muted mt-1">
              Choose how you want to restore this backup
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body space-y-5">
          <div className="radius-lg bg-brand-bg border border-white/10 p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <p className="text-body-md text-muted">
                Backup ID: <span className="text-brand-text">#{backup.id.padStart(5, '0')}</span>
              </p>
              <p className="text-body-md text-muted">
                Scope: <span className="text-brand-text">{backup.scope}</span>
              </p>
              <p className="text-body-md text-muted">
                Size: <span className="text-brand-text">{backup.size}</span>
              </p>
              <p className="text-body-md text-muted">
                Date: <span className="text-brand-text">{backup.timestamp}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {restoreOptions.map((option) => (
              <label
                key={option.key}
                className={cn(
                  'radius-lg flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors',
                  selected === option.key
                    ? 'border-brand-accent bg-brand-accent/10'
                    : 'bg-brand-bg border-white/10 hover:border-white/20',
                )}
              >
                <input
                  type="radio"
                  name="restore-option"
                  checked={selected === option.key}
                  onChange={() => setSelected(option.key)}
                  className="accent-brand-accent mt-1"
                />
                <div>
                  <p className="text-body-md-medium text-brand-text">{option.label}</p>
                  <p className="text-body-sm text-muted">{option.description}</p>
                </div>
              </label>
            ))}
          </div>

          <label className="block space-y-2">
            <span className="text-body-md-medium text-brand-text">
              Type &apos;CONFIRM&apos; to Proceed
            </span>
            <input
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="CONFIRM"
              className="ui-input"
            />
          </label>
        </div>

        <div className="ui-modal-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSubmit(selected)}
            className="ui-modal-btn ui-modal-btn-gold"
          >
            Restore Now
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
