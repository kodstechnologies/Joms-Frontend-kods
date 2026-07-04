import { categoryFormTheme } from "./category-form.theme";

interface Props {
  onSubmit: () => void;
  submitText?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
}

const FooterActions = ({
  onSubmit,
  submitText = "Create Category",
  isSubmitting = false,
  disabled = false,
}: Props) => {
  return (
    <div
      className="mt-6 flex justify-end rounded-xl border border-[#242424] px-6 py-5"
      style={{ backgroundColor: categoryFormTheme.surface }}
    >
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || isSubmitting}
        className={`rounded-lg px-8 py-2.5 text-[13px] font-semibold ${categoryFormTheme.accentGradient} ${categoryFormTheme.accentGradientHover} text-black transition-all disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isSubmitting ? "Saving…" : submitText}
      </button>
    </div>
  );
};

export default FooterActions;
