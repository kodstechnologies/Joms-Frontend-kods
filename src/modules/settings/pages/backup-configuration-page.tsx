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
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
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
      <div className="backup-config-breadcrumb">
        <PageBreadcrumb
          items={[
            { label: 'Settings', to: '/settings/main' },
            {
              label: 'Backups & Restore',
              to: '/settings/main',
              state: { settingsTab: 'backup' },
            },
            { label: 'Backup Configuration', isActive: true },
          ]}
        />
      </div>

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
