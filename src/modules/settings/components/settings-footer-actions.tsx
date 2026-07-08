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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2.5">
      <Button
        variant="secondary"
        onClick={onReset}
        disabled={resetDisabled || isResetting || isSaving}
        className="h-8 border-white/20 bg-transparent px-4 text-xs"
      >
        {isResetting ? 'Resetting...' : 'Reset'}
      </Button>
      <Button
        onClick={onSave}
        disabled={saveDisabled || isSaving || isResetting}
        className="h-8 min-w-[132px] px-5 text-xs"
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
