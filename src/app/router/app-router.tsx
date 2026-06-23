import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { ProtectedRoute } from '@/app/router/protected-route'

const LoginPage = lazy(() =>
  import('@/modules/auth/pages/login-page').then(m => ({
    default: m.LoginPage,
  })),
)

const ExecutiveOverviewPage = lazy(() =>
  import('@/modules/dashboard/pages/executive-overview-page').then(m => ({
    default: m.ExecutiveOverviewPage,
  })),
)

const ServiceManagementPage = lazy(() =>
  import('@/modules/expert').then(m => ({
    default: m.ServiceManagementPage,
  })),
)

const ServiceViewPage = lazy(() =>
  import('@/modules/expert').then(m => ({
    default: m.ServiceViewPage,
  })),
)


const VenueManagementPage = lazy(() =>
  import('@/modules/expert').then(m => ({
    default: m.VenueManagementPage,
  })),
)

const CreateVenueListingPage = lazy(() =>
  import('@/modules/expert').then(m => ({
    default: m.CreateVenueListingPage,
  })),
)



const PageLoader = () => (
  <div className="flex h-dvh w-full items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="size-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
      <p className="animate-pulse text-sm font-medium text-slate-400">
        Loading...
      </p>
    </div>
  </div>
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/auth/login"
            element={<LoginPage />}
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route
                path="/"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

              <Route
                path="/dashboard"
                element={
                  <Navigate
                    to="/dashboard/executive"
                    replace
                  />
                }
              />

              <Route
                path="/dashboard/executive"
                element={<ExecutiveOverviewPage />}
              />

              <Route
                path="/services/management"
                element={<ServiceManagementPage />}
              />

              <Route
                path="/services/management/view/:id"
                element={<ServiceViewPage />}
              />

              <Route
                path="/venues/management"
                element={<VenueManagementPage />}
              />

              <Route
                path="/venues/management/create"
                element={<CreateVenueListingPage />}
              />

              
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}