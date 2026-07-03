import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/modules/auth/store/auth-store'

export function ProtectedRoute() {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  const token = useAuthStore((state) => state.token)
  if (!token) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
