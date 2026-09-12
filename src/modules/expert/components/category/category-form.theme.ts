export const categoryFormTheme = {
  pageBg: '#050505',
  surface: '#141414',
  inputBg: '#050505',
  inputBorder: 'rgb(255 255 255 / 10%)',
  uploadBg: '#050505',
  uploadBorder: 'rgb(255 255 255 / 20%)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgb(255 255 255 / 30%)',
  textMuted: 'rgb(255 255 255 / 30%)',
  accentGradient: 'bg-[image:var(--brand-gold-gradient)]',
  accentGradientHover: 'hover:brightness-[0.96]',
  inputClass:
    'ui-input !bg-[#050505] placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-60',
  textareaClass:
    'ui-textarea !bg-[#050505] placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-60',
  sectionTitleClass: 'text-h4 font-semibold text-white',
  sectionSubtitleClass: 'text-body-md text-white/30',
  tooltipClass:
    'box-border flex items-center rounded-md bg-white px-2 py-1.5 text-left text-[12px] leading-[16px] font-normal text-black shadow-lg',
} as const
