import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/modules/auth/store/auth-store'

export function ProtectedRoute() {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)

  if (!isAuthenticated || !token) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
