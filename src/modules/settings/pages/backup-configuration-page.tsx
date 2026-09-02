import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { BackupConfigurationPanel } from '../components/backup-configuration-panel'
import { SettingsFooterActions } from '../components/settings-footer-actions'
import {
  useResetSettings,
  useSettingsDraft,
  useSettingsModule,
  useUpdateSettings,
} from '../hooks/use-settings'
import { backupDefaults } from '../config/settings.config'
import { SectionHeader } from '@/shared/components/dashboard/section-header'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { getApiErrorMessage } from '@/shared/lib/api-error'

export function BackupConfigurationPage() {
  const navigate = useNavigate()
  const backupQuery = useSettingsModule('backup')
  const updateBackup = useUpdateSettings('backup')
  const resetBackup = useResetSettings('backup')
  const [backupConfig, setBackupConfig] = useSettingsDraft(backupQuery.data, backupDefaults)

  const handleSave = async () => {
    try {
      await updateBackup.mutateAsync(backupConfig)
      toast.success('Saved')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Save failed'))
    }
  }

  const handleReset = async () => {
    try {
      const result = await resetBackup.mutateAsync()
      setBackupConfig(result.config)
      toast.success('Reset to defaults')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Reset failed'))
    }
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() =>
          navigateBackOrFallback(navigate, '/settings/main', { state: { settingsTab: 'backup' } })
        }
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Settings / Backups & Restore / Backup Configuration
      </button>

      <SectionHeader
        title="Backup Configuration"
        subtitle="Schedule, scope, and retention"
        actions={[
          {
            label: 'Settings Logs',
            onClick: () => navigate('/settings/logs'),
            variant: 'secondary',
          },
        ]}
      />

      {backupQuery.isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 text-sm text-slate-400">
          Loading...
        </div>
      ) : (
        <>
          <BackupConfigurationPanel value={backupConfig} onChange={setBackupConfig} />
          <SettingsFooterActions
            onReset={handleReset}
            onSave={handleSave}
            isSaving={updateBackup.isPending}
            isResetting={resetBackup.isPending}
          />
        </>
      )}
    </div>
  )
}
