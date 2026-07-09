import { useMutation, useQueryClient } from '@tanstack/react-query'

import { logout } from '@/modules/auth/api/auth-api'

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear()
    },
  })
}
