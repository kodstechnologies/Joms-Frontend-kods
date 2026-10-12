import { Navigate } from 'react-router-dom'

import { getDefaultHomeRoute } from '@/app/layouts/navigation/navigation.filter'
import { useAuthStore } from '@/modules/auth/store/auth-store'

// An unknown address sends the admin to the home their role is allowed to open.
export function HomeRedirect() {
  const user = useAuthStore((state) => state.user)
  return <Navigate to={getDefaultHomeRoute(user)} replace />
}
