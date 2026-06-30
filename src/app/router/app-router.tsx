import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { ProtectedRoute } from '@/app/router/protected-route'
import { DeletedExpertsPage } from '@/modules/expert'
import { SuspendedExpertsPage } from '@/modules/expert'
const LoginPage = lazy(() =>
  import('@/modules/auth/pages/login-page').then((m) => ({ default: m.LoginPage })),
)
const ExecutiveOverviewPage = lazy(() =>
  import('@/modules/dashboard/pages/executive-overview-page').then((m) => ({
    default: m.ExecutiveOverviewPage,
  })),
)
const ServiceMarketplacePage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.ServiceMarketplacePage })),
)
const PendingApprovalsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.PendingApprovalsPage })),
)
const SuspendedServicesPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.SuspendedServicesPage })),
)
const ServiceManagementPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.ServiceManagementPage })),
)
const ServiceViewPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.ServiceViewPage })),
)
const CreateServiceListingPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.CreateServiceListingPage })),
)

const ExpertManagementPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertManagementPage,
  })),
)
const CreateExpertPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.CreateExpertPage,
  })),
)
const LeaderboardPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.LeaderboardPage,
  })),
)
const VenueDashboardPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueDashboardPage,
  })),
)
const VenueManagementPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueManagementPage,
  })),
)

const CreateVenueListingPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.CreateVenueListingPage,
  })),
)
const CreateVenueOnboardingPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.CreateVenueOnboardingPage,
  })),
)
const VenuePendingApprovalsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenuePendingApprovalsPage,
  })),
)
const VenueSuspendedPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueSuspendedPage,
  })),
)
const ApplicationDetailsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ApplicationDetailsPage,
  })),
)
const VenueProfileViewPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueProfileViewPage,
  })),
)
const MembershipPlansPage = lazy(() =>
  import('@/modules/memberships').then((m) => ({
    default: m.MembershipPlansPage,
  })),
)
const MembershipPausedPlansPage = lazy(() =>
  import('@/modules/memberships').then((m) => ({
    default: m.MembershipPausedPlansPage,
  })),
)
const MembershipInactivePlansPage = lazy(() =>
  import('@/modules/memberships').then((m) => ({
    default: m.MembershipInactivePlansPage,
  })),
)
const MembershipDeletedPlansPage = lazy(() =>
  import('@/modules/memberships').then((m) => ({
    default: m.MembershipDeletedPlansPage,
  })),
)
const ExpertMembershipsPage = lazy(() =>
  import('@/modules/memberships').then((m) => ({
    default: m.ExpertMembershipsPage,
  })),
)
const MembershipDetailsPage = lazy(() =>
  import('@/modules/memberships').then((m) => ({
    default: m.MembershipDetailsPage,
  })),
)
const SpaceDetailsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.SpaceDetailsPage,
  })),
)
const PageLoader = () => (
  <div className="flex h-dvh w-full items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="size-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
      <p className="animate-pulse text-sm font-medium text-slate-400">Loading...</p>
    </div>
  </div>
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Navigate to="/dashboard/executive" replace />} />
              <Route path="/dashboard/executive" element={<ExecutiveOverviewPage />} />
              <Route path="/services/dashboard" element={<ServiceMarketplacePage />} />
              <Route path="/experts/management" element={<ExpertManagementPage />} />
              <Route path="/experts/management" element={<ExpertManagementPage />} />
              <Route path="/services/dashboard" element={<ServiceMarketplacePage />} />
              <Route path="/services/management" element={<ServiceManagementPage />} />
              <Route path="/services/management/pending" element={<PendingApprovalsPage />} />
              <Route path="/services/management/suspended" element={<SuspendedServicesPage />} />
              <Route path="/services/management/create" element={<CreateServiceListingPage />} />
              <Route path="/experts/management/create" element={<CreateExpertPage />} />
              <Route path="/experts/suspended" element={<SuspendedExpertsPage />} />
              <Route path="/experts/deleted" element={<DeletedExpertsPage />} />
              <Route path="/experts/pending-approvals" element={<PendingApprovalsPage />} />
              <Route path="/services/management/view/:id" element={<ServiceViewPage />} />
              <Route path="/services/leaderboard" element={<LeaderboardPage />} />

              <Route path="/venues/dashboard" element={<VenueDashboardPage />} />
              <Route path="/venues/leaderboard" element={<LeaderboardPage />} />
              <Route path="/venues/management" element={<VenueManagementPage />} />
              <Route
                path="/venues/management/application/:id"
                element={<ApplicationDetailsPage />}
              />
              <Route
                path="/venues/management/profile/:venueId"
                element={<VenueProfileViewPage />}
              />
              <Route
                path="/venues/management/profile/:venueId/space/:spaceId"
                element={<SpaceDetailsPage />}
              />
              <Route path="/venues/management/pending" element={<VenuePendingApprovalsPage />} />
              <Route path="/venues/management/suspended" element={<VenueSuspendedPage />} />

              <Route path="/venues/management/onboarding" element={<CreateVenueOnboardingPage />} />
              <Route path="/venues/management/create" element={<CreateVenueListingPage />} />

              <Route path="/memberships/plans" element={<MembershipPlansPage />} />
              <Route path="/memberships/plans/paused" element={<MembershipPausedPlansPage />} />
              <Route path="/memberships/plans/inactive" element={<MembershipInactivePlansPage />} />
              <Route path="/memberships/plans/deleted" element={<MembershipDeletedPlansPage />} />
              <Route path="/memberships/experts" element={<ExpertMembershipsPage />} />
              <Route path="/memberships/experts/:id" element={<MembershipDetailsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
