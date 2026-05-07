import { useMutation } from '@tanstack/react-query'

import { loginMock } from '@/modules/auth/api/auth-mock'

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginMock,
  })
}
