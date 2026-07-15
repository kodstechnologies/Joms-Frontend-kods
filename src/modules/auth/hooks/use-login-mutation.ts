import { useMutation } from '@tanstack/react-query'

import { login } from '@/modules/auth/api/auth-api'

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
  })
}
