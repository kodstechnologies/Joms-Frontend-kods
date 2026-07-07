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
    <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-6">
      <Button
        variant="secondary"
        onClick={onReset}
        disabled={resetDisabled || isResetting || isSaving}
      >
        {isResetting ? 'Resetting...' : 'Reset'}
      </Button>
      <Button onClick={onSave} disabled={saveDisabled || isSaving || isResetting}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
