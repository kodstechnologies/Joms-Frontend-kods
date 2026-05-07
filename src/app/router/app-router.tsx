import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { ProtectedRoute } from '@/app/router/protected-route'
import { LoginPage } from '@/modules/auth/pages/login-page'
import { ExecutiveOverviewPage } from '@/modules/dashboard/pages/executive-overview-page'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/executive" replace />} />
            <Route path="/dashboard/executive" element={<ExecutiveOverviewPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
