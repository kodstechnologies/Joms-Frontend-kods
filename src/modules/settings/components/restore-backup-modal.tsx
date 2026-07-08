import { useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

import type { BackupHistoryRow } from '../types/settings'
import { cn } from '@/shared/lib/cn'

type RestoreBackupModalProps = {
  open: boolean
  backup: BackupHistoryRow | null
  onClose: () => void
  onSubmit: () => void
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
      <div className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Restore System Backup</h2>
            <p className="mt-1 text-xs text-slate-500">Choose how you want to restore this backup</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <p className="text-slate-400">
              Backup ID: <span className="text-white">#{backup.id.padStart(5, '0')}</span>
            </p>
            <p className="text-slate-400">
              Scope: <span className="text-white">{backup.scope}</span>
            </p>
            <p className="text-slate-400">
              Size: <span className="text-white">{backup.size}</span>
            </p>
            <p className="text-slate-400">
              Date: <span className="text-white">{backup.timestamp}</span>
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {restoreOptions.map((option) => (
            <label
              key={option.key}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
                selected === option.key
                  ? 'border-[#F0C27B] bg-[#F0C27B]/10'
                  : 'border-white/10 bg-black/20 hover:border-white/20',
              )}
            >
              <input
                type="radio"
                name="restore-option"
                checked={selected === option.key}
                onChange={() => setSelected(option.key)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-white">{option.label}</p>
                <p className="text-xs text-slate-500">{option.description}</p>
              </div>
            </label>
          ))}
        </div>

        <label className="mt-5 block space-y-2 text-sm">
          <span className="font-medium text-white">Type &apos;CONFIRM&apos; to Proceed</span>
          <input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="CONFIRM"
            className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-white"
          />
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className="rounded-xl bg-[#F0C27B] px-5 py-2.5 text-sm font-semibold text-[#050505] disabled:opacity-50"
          >
            Restore Now
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
