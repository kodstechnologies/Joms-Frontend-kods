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
    <div className="mt-6 flex justify-end rounded-xl border border-white/10 bg-brand-surface px-6 py-5">
      <Button
        type="button"
        onClick={onSubmit}
        disabled={disabled || isSubmitting}
        className="h-11 rounded-lg border border-[#3A3A3A] bg-[#FBC46B] px-6 text-white hover:bg-[#FBC46B] hover:text-black active:bg-[#F0BC52] active:text-black disabled:opacity-50"
      >
        {isSubmitting ? 'Saving…' : submitText}
      </Button>
    </div>
  )
}

export default FooterActions
