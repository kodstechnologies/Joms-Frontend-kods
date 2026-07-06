import { Button } from '@/shared/components/ui/button'

type SettingsFooterActionsProps = {
  onReset: () => void
  onSave: () => void
  isSaving?: boolean
  isResetting?: boolean
}

export function SettingsFooterActions({
  onReset,
  onSave,
  isSaving = false,
  isResetting = false,
}: SettingsFooterActionsProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-6">
      <Button variant="secondary" onClick={onReset} disabled={isResetting || isSaving}>
        {isResetting ? 'Resetting...' : 'Reset'}
      </Button>
      <Button onClick={onSave} disabled={isSaving || isResetting}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
