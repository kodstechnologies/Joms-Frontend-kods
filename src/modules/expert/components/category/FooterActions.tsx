import { Button } from '@/shared/components/ui/button'

interface Props {
  onSubmit: () => void
  submitText?: string
  isSubmitting?: boolean
  disabled?: boolean
}

const FooterActions = ({
  onSubmit,
  submitText = 'Create Category',
  isSubmitting = false,
  disabled = false,
}: Props) => {
  return (
    <div className="bg-brand-surface mt-6 flex justify-end rounded-xl border border-white/10 px-6 py-5">
      <Button
        type="button"
        onClick={onSubmit}
        disabled={disabled || isSubmitting}
        className="h-11 rounded-lg px-6"
      >
        {isSubmitting ? 'Saving…' : submitText}
      </Button>
    </div>
  )
}

export default FooterActions
