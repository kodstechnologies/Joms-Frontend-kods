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
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { Button } from '@/shared/components/ui/button'

export function BackupConfigurationPage() {
  const navigate = useNavigate()
  const backupQuery = useSettingsModule('backup')
  const updateBackup = useUpdateSettings('backup')
  const resetBackup = useResetSettings('backup')
  const [backupConfig, setBackupConfig] = useSettingsDraft(backupQuery.data, backupDefaults)

  const goToBackupTab = () =>
    navigate('/settings/main?tab=backup', { state: { settingsTab: 'backup' } })

  const handleSave = async () => {
    try {
      await updateBackup.mutateAsync(backupConfig)
      toast.success('Saved')
      goToBackupTab()
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
        <button type="button" onClick={goToBackupTab} className="backup-config-breadcrumb-link">
          Settings
        </button>
        <span> / </span>
        <button type="button" onClick={goToBackupTab} className="backup-config-breadcrumb-link">
          Backups &amp; Restore
        </button>
        <span> / </span>
        <span className="backup-config-breadcrumb-current">Backup Configuration</span>
      </p>

      <div className="backup-config-heading-row">
        <div>
          <button type="button" onClick={goToBackupTab} className="backup-config-back">
            <ArrowLeft className="size-5" aria-hidden="true" />
            <span>Backup Configuration</span>
          </button>
          <p className="backup-config-subtitle">
            Configure automated backup settings and preferences
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="inline-flex items-center gap-2"
          onClick={() => navigate('/settings/logs', { state: { module: 'backup' } })}
        >
          Settings Logs
        </Button>
      </div>

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
