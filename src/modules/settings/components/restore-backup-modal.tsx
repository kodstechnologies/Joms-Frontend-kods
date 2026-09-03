import { useEffect, useState } from 'react'
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
    description: 'Verify Data in staging before pushing to production',
  },
  {
    key: 'schedule',
    label: 'Schedule Restore',
    description: 'Schedule Restore for a specific date',
  },
]

function formatBackupId(backup: BackupHistoryRow) {
  const raw = String(backup.name || backup.id || '').trim()
  if (!raw) return '—'
  if (/^BACK/i.test(raw) || raw.includes('_') || raw.length <= 12) return raw
  return raw
}

export function RestoreBackupModal({ open, backup, onClose, onSubmit }: RestoreBackupModalProps) {
  const [selected, setSelected] = useState('immediate')
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    if (!open) {
      setSelected('immediate')
      setConfirmText('')
    }
  }, [open])

  if (!open || !backup) return null

  const canSubmit = confirmText.trim().toUpperCase() === 'CONFIRM'

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="restore-backup-title"
        className="ui-modal-shell restore-backup-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h2 id="restore-backup-title" className="restore-backup-title">
            Restore System Backup
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-brand-muted rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="icon-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="ui-modal-body restore-backup-body">
          <div className="restore-backup-summary">
            <p className="restore-backup-summary-intro">You are about to restore</p>
            <div className="restore-backup-summary-grid">
              <div className="restore-backup-summary-row">
                <span>Backup ID</span>
                <strong>{formatBackupId(backup)}</strong>
              </div>
              <div className="restore-backup-summary-row">
                <span>Scope</span>
                <strong>{backup.scope}</strong>
              </div>
              <div className="restore-backup-summary-row">
                <span>Size</span>
                <strong>{backup.size}</strong>
              </div>
              <div className="restore-backup-summary-row">
                <span>Date &amp; Time</span>
                <strong>{backup.timestamp}</strong>
              </div>
            </div>
          </div>

          <div className="restore-backup-options">
            <p className="restore-backup-options-label">Select Restore Option</p>
            <div className="restore-backup-options-list">
              {restoreOptions.map((option) => {
                const isSelected = selected === option.key
                return (
                  <button
                    key={option.key}
                    type="button"
                    className={cn('restore-backup-option', isSelected && 'is-selected')}
                    onClick={() => setSelected(option.key)}
                    aria-pressed={isSelected}
                  >
                    <span className={cn('restore-backup-radio', isSelected && 'is-on')} />
                    <span className="restore-backup-option-copy">
                      <span className="restore-backup-option-title">{option.label}</span>
                      <span className="restore-backup-option-desc">{option.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="restore-backup-confirm">
            <span className="restore-backup-confirm-label">
              Type <span className="is-danger">CONFIRM</span> to Proceed
            </span>
            <input
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="Text here"
              className="restore-backup-confirm-input"
            />
          </label>
        </div>

        <div className="ui-modal-footer restore-backup-footer">
          <button type="button" onClick={onClose} className="ui-modal-btn ui-modal-btn-cancel">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSubmit(selected)}
            className="ui-modal-btn restore-backup-submit"
          >
            Restore Now
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
