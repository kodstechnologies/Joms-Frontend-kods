import { useRef } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'

import {
  assertFileWithinUploadLimit,
  FILE_TOO_LARGE_MESSAGE,
  MAX_UPLOAD_FILE_SIZE_MB,
} from '@/shared/lib/api-error'

import InfoTooltip from './InfoTooltip'
import { categoryFormTheme } from './category-form.theme'

interface UploadBoxProps {
  preview?: string
  onChange: (file: File | null) => void
  label?: string
  helperText?: string
  placeholderText?: string
  variant?: 'default' | 'compact'
  disabled?: boolean
}

const UploadBox = ({
  label,
  helperText,
  placeholderText = 'Upload here',
  preview,
  onChange,
  variant = 'default',
  disabled = false,
}: UploadBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      assertFileWithinUploadLimit(file)
    } catch {
      toast.error(FILE_TOO_LARGE_MESSAGE)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
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
          {helperText ? <InfoTooltip text={helperText} /> : null}
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
        className={`relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors ${
          isCompact ? 'h-11' : 'h-[72px]'
        } ${
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-brand-accent cursor-pointer'
        } ${preview ? 'border-brand-accent/60' : 'border-white/10'}`}
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
            className={`text-muted flex items-center justify-center gap-2 ${
              isCompact ? 'px-2' : 'flex-col gap-1'
            }`}
          >
            <UploadCloud size={isCompact ? 16 : 18} className="shrink-0" aria-hidden="true" />
            {!isCompact ? (
              <>
                <span className="text-body-sm">{placeholderText}</span>
                <span className="text-[10px] text-white/40">Max {MAX_UPLOAD_FILE_SIZE_MB}MB</span>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadBox
