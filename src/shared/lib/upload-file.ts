import { toast } from 'sonner'

import {
  assertFileWithinUploadLimit,
  FILE_TOO_LARGE_MESSAGE,
  MAX_UPLOAD_FILE_SIZE_MB,
} from '@/shared/lib/api-error'

export { MAX_UPLOAD_FILE_SIZE_MB, FILE_TOO_LARGE_MESSAGE }

export function guardUploadFile(file: File | null | undefined): file is File {
  if (!file) return false

  try {
    assertFileWithinUploadLimit(file)
    return true
  } catch {
    toast.error(FILE_TOO_LARGE_MESSAGE)
    return false
  }
}

export function guardUploadFiles(files: FileList | File[] | null | undefined): File[] {
  if (!files?.length) return []

  const accepted: File[] = []
  for (const file of Array.from(files)) {
    if (guardUploadFile(file)) accepted.push(file)
  }
  return accepted
}
