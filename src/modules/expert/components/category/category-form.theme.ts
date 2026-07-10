export const categoryFormTheme = {
  pageBg: "#000000",
  surface: "#181818",
  inputBg: "#000000",
  inputBorder: "#2A2A2A",
  uploadBg: "#0A0A0A",
  uploadBorder: "#333333",
  textPrimary: "#FFFFFF",
  textSecondary: "#888888",
  textMuted: "#666666",
  accentGradient:
    "bg-gradient-to-b from-brand-gold-from via-brand-accent to-brand-gold-to",
  accentGradientHover:
    "hover:from-brand-gold-from hover:via-brand-accent hover:to-brand-gold-to",
  inputClass:
    "h-11 w-full rounded-lg border border-[#2A2A2A] bg-black px-4 text-sm text-white outline-none transition placeholder:text-[#666666] focus:border-brand-accent",
  textareaClass:
    "w-full resize-none rounded-lg border border-[#2A2A2A] bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#666666] focus:border-brand-accent",
  sectionTitleClass:
    "font-sans text-[16px] font-semibold leading-5 tracking-normal text-white",
  sectionSubtitleClass:
    "font-sans text-[14px] font-normal leading-5 tracking-normal text-[#888888]",
  tooltipClass:
    "font-sans box-border flex w-[126px] min-h-[34px] items-center rounded-md bg-black px-2 text-[12px] font-normal leading-[17px] tracking-normal text-white shadow-lg",
} as const;
