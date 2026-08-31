import { useRef, type RefObject } from 'react'

import { useDialogFocusTrap } from '@/shared/hooks/use-dialog-focus-trap'

export function useMountedDialog(onClose: () => void): RefObject<HTMLDivElement | null> {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogFocusTrap(true, onClose, dialogRef)
  return dialogRef
}
