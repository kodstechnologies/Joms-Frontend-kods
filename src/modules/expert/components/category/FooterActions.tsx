interface Props {
  onSubmit: () => void;
  submitText?: string;
}

const FooterActions = ({
  onSubmit,
  submitText = "Create Category",
  
}: Props) => {
  return (
    <div className="mt-8 flex justify-end rounded-xl bg-[#181818] p-5">
      <button
        onClick={onSubmit}
        className="rounded-lg bg-[#F5C16C] px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-[#E9B85D]"
      >
        {submitText}
      </button>
    </div>
  );
};

export default FooterActions;