import { Button } from '@/shared/components/ui/button'

type SettingsFooterActionsProps = {
  onReset: () => void
  onSave: () => void
  isSaving?: boolean
  isResetting?: boolean
  saveDisabled?: boolean
  resetDisabled?: boolean
}

export function SettingsFooterActions({
  onReset,
  onSave,
  isSaving = false,
  isResetting = false,
  saveDisabled = false,
  resetDisabled = false,
}: SettingsFooterActionsProps) {
  return (
    <div className="settings-page-footer">
      <Button
        variant="secondary"
        onClick={onReset}
        disabled={resetDisabled || isResetting || isSaving}
        className="settings-page-footer-reset"
      >
        {isResetting ? 'Resetting...' : 'Reset'}
      </Button>
      <Button
        variant="primary"
        type="button"
        onClick={(e) => {
          e.preventDefault()
          if (saveDisabled || isSaving || isResetting) return
          onSave()
        }}
        disabled={saveDisabled || isSaving || isResetting}
        className="settings-page-footer-save"
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
