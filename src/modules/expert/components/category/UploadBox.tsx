import { useRef } from 'react'
import { UploadCloud, X } from 'lucide-react'

import { guardUploadFile } from '@/shared/lib/upload-file'

import InfoTooltip from './InfoTooltip'
import { categoryFormTheme } from './category-form.theme'

interface UploadBoxProps {
  preview?: string
  onChange: (file: File | null) => void
  label?: string
  helperText?: string
  tooltipWidth?: number
  tooltipMinHeight?: number
  placeholderText?: string
  variant?: 'default' | 'compact'
  disabled?: boolean
}

const UploadBox = ({
  label,
  helperText,
  tooltipWidth,
  tooltipMinHeight,
  placeholderText = 'Upload here',
  preview,
  onChange,
  variant = 'default',
  disabled = false,
}: UploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !guardUploadFile(file)) {
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    onChange(file)
  }

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onChange(null)
  }

  const isCompact = variant === 'compact'

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center gap-1.5">
          <label className="text-body-sm-medium text-brand-text">{label}</label>
          {helperText ? (
            <InfoTooltip text={helperText} width={tooltipWidth} minHeight={tooltipMinHeight} />
          ) : null}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        disabled={disabled}
        onChange={handleFile}
      />

      <div
        onClick={() => {
          if (!disabled) {
            inputRef.current?.click()
          }
        }}
        className={`relative flex h-10 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors ${
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-brand-accent cursor-pointer'
        } ${preview ? 'border-brand-accent/60' : 'border-white/20'}`}
        style={{ backgroundColor: categoryFormTheme.uploadBg }}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="h-full w-full object-cover" />

            {!disabled ? (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1.5 right-1.5 z-10 grid size-6 place-items-center rounded-full bg-white shadow-md"
              >
                <X size={14} strokeWidth={3} className="text-red-600" />
              </button>
            ) : null}
          </>
        ) : (
          <div
            className={`flex items-center justify-center gap-2 text-white/30 ${
              isCompact ? 'px-2' : 'px-3'
            }`}
          >
            <UploadCloud size={16} className="shrink-0" aria-hidden="true" />
            {!isCompact ? (
              <span className="text-body-sm text-white/30">{placeholderText}</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadBox
