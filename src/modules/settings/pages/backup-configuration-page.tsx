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
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { getApiErrorMessage } from '@/shared/lib/api-error'

export function BackupConfigurationPage() {
  const navigate = useNavigate()
  const backupQuery = useSettingsModule('backup')
  const updateBackup = useUpdateSettings('backup')
  const resetBackup = useResetSettings('backup')
  const [backupConfig, setBackupConfig] = useSettingsDraft(backupQuery.data, backupDefaults)

  const goBack = () =>
    navigateBackOrFallback(navigate, '/settings/main', { state: { settingsTab: 'backup' } })

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
    <div className="backup-config-page">
      <p className="backup-config-breadcrumb">
        <button type="button" onClick={goBack} className="backup-config-breadcrumb-link">
          Settings
        </button>
        <span> / </span>
        <button type="button" onClick={goBack} className="backup-config-breadcrumb-link">
          Backups &amp; Restore
        </button>
        <span> / </span>
        <span className="backup-config-breadcrumb-current">Backup Configuration</span>
      </p>

      <button type="button" onClick={goBack} className="backup-config-back">
        <ArrowLeft className="size-5" aria-hidden="true" />
        <span>Backup Configuration</span>
      </button>
      <p className="backup-config-subtitle">Configure automated backup settings and preferences</p>

      {backupQuery.isLoading ? (
        <div className="backup-config-loading">Loading...</div>
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
