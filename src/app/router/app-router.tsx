import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { ProtectedRoute } from '@/app/router/protected-route'
import { PermissionRoute } from '@/app/router/permission-route'
import { HomeRedirect } from '@/app/router/home-redirect'
import { SuperAdminRoute } from '@/app/router/super-admin-route'
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

const ExpertDashboardPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertDashboardPage,
  })),
)
const ExpertMetricsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertMetricsPage,
  })),
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
const ExpertApplicationViewPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertApplicationViewPage,
  })),
)
const ExpertProfileViewPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertProfileViewPage,
  })),
)
const ExpertPendingApprovalsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertPendingApprovalsPage,
  })),
)
const ExpertSuspendedExpertsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertSuspendedExpertsPage,
  })),
)
const ExpertDeletedExpertsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertDeletedExpertsPage,
  })),
)
const ExpertReportedExpertsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertReportedExpertsPage,
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
const ReferralManagementPage = lazy(() =>
  import('@/modules/referrals').then((m) => ({
    default: m.ReferralManagementPage,
  })),
)
const MembershipPlansPage = lazy(() =>
  import('@/modules/memberships').then((m) => ({
    default: m.MembershipPlansPage,
  })),
)
const MembershipPlanFormPage = lazy(() =>
  import('@/modules/memberships').then((m) => ({
    default: m.MembershipPlanFormPage,
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
const RbacHubPage = lazy(() =>
  import('@/modules/rbac').then((m) => ({
    default: m.RbacHubPage,
  })),
)
const CreateRolePage = lazy(() =>
  import('@/modules/rbac').then((m) => ({
    default: m.CreateRolePage,
  })),
)
const CreateSubAdminPage = lazy(() =>
  import('@/modules/rbac').then((m) => ({
    default: m.CreateSubAdminPage,
  })),
)
const SubAdminDetailPage = lazy(() =>
  import('@/modules/rbac').then((m) => ({
    default: m.SubAdminDetailPage,
  })),
)
const SpaceDetailsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.SpaceDetailsPage,
  })),
)
const CategoryManagementPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.CategoryManagementPage,
  }))
);

const CreateCategoryPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.CreateCategoryPage,
  }))
);

const CreateSubCategoryPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.CreateSubCategoryPage,
  }))
);

const PausedCategoriesPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.PausedCategoriesPage,
  }))
);

const RenameCategoryPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.RenameCategoryPage,
  }))
);

const DeletedCategoriesPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.DeletedCategoriesPage,
  }))
);

const CategoryViewPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.CategoryViewPage,
  }))
);

const SubCategoryViewPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.SubCategoryViewPage,
  }))
);

const VenueCategoryManagementPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.VenueCategoryManagementPage,
  }))
);

const CreateVenueCategoryPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.CreateVenueCategoryPage,
  }))
);

const CreateVenueSubCategoryPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.CreateVenueSubCategoryPage,
  }))
);

const PausedVenueCategoriesPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.PausedVenueCategoriesPage,
  }))
);

const DeletedVenueCategoriesPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.DeletedVenueCategoriesPage,
  }))
);

const RenameVenueCategoryPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.RenameVenueCategoryPage,
  }))
);

const VenueCategoryViewPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.VenueCategoryViewPage,
  }))
);

const VenueSubCategoryViewPage = lazy(() =>
  import("@/modules/expert").then((m) => ({
    default: m.VenueSubCategoryViewPage,
  }))
);


const CommunicationListPage = lazy(() =>
  import("@/modules/communication").then((m) => ({
    default: m.CommunicationListPage,
  }))
);

const CreateCommunicationPage = lazy(() =>
  import("@/modules/communication").then((m) => ({
    default: m.CreateCommunicationPage,
  }))
);

const ViewCommunicationPage = lazy(() =>
  import("@/modules/communication").then((m) => ({
    default: m.ViewCommunicationPage,
  }))
);

const PageLoader = () => (
  <div className="flex h-dvh w-full items-center justify-center bg-brand-bg">
    <div className="flex flex-col items-center gap-4">
      <div className="size-10 animate-spin rounded-full border-4 border-brand-accent border-t-transparent" />
      <p className="animate-pulse text-sm font-medium text-brand-muted">Loading...</p>
    </div>
  </div>
)

export function AppRouter() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/dashboard" element={<HomeRedirect />} />

              <Route element={<SuperAdminRoute />}>
                <Route path="/dashboard/executive" element={<ExecutiveOverviewPage />} />
                <Route path="/experts/dashboard" element={<ExpertDashboardPage />} />
                <Route path="/experts/dashboard/metrics" element={<ExpertMetricsPage />} />
                <Route path="/experts/management" element={<ExpertManagementPage />} />
                <Route path="/experts/management/create" element={<CreateExpertPage />} />
                <Route
                  path="/experts/management/profile/:id"
                  element={<ExpertProfileViewPage />}
                />
                <Route
                  path="/experts/management/application/:id"
                  element={<ExpertApplicationViewPage />}
                />
                <Route path="/experts/suspended" element={<ExpertSuspendedExpertsPage />} />
                <Route path="/experts/deleted" element={<ExpertDeletedExpertsPage />} />
                <Route path="/experts/reported" element={<ExpertReportedExpertsPage />} />
                <Route path="/experts/pending-approvals" element={<ExpertPendingApprovalsPage />} />
                <Route path="/referrals/management" element={<ReferralManagementPage />} />
                <Route path="/memberships/plans" element={<MembershipPlansPage />} />
                <Route path="/memberships/plans/create" element={<MembershipPlanFormPage />} />
                <Route path="/memberships/plans/:id/edit" element={<MembershipPlanFormPage />} />
                <Route path="/memberships/plans/paused" element={<MembershipPausedPlansPage />} />
                <Route path="/memberships/plans/inactive" element={<MembershipInactivePlansPage />} />
                <Route path="/memberships/plans/deleted" element={<MembershipDeletedPlansPage />} />
                <Route path="/memberships/experts" element={<ExpertMembershipsPage />} />
                <Route path="/memberships/experts/:id" element={<MembershipDetailsPage />} />
                <Route path="/settings/access" element={<RbacHubPage />} />
                <Route path="/settings/access/roles/create" element={<CreateRolePage />} />
                <Route path="/settings/access/roles/:id/edit" element={<CreateRolePage />} />
                <Route path="/settings/access/users/create" element={<CreateSubAdminPage />} />
                <Route path="/settings/access/users/:id" element={<SubAdminDetailPage />} />
              </Route>

              <Route element={<PermissionRoute module="services" />}>
                <Route path="/services/dashboard" element={<ServiceMarketplacePage />} />
                <Route path="/services/management" element={<ServiceManagementPage />} />
                <Route path="/services/management/pending" element={<PendingApprovalsPage />} />
                <Route path="/services/management/suspended" element={<SuspendedServicesPage />} />
                <Route path="/services/management/create" element={<CreateServiceListingPage />} />
                <Route path="/services/management/view/:id" element={<ServiceViewPage />} />
                <Route path="/services/leaderboard" element={<LeaderboardPage />} />
                <Route path="/categories/management" element={<CategoryManagementPage />} />
                <Route path="/categories/management/create" element={<CreateCategoryPage />} />
                <Route
                  path="/categories/management/create-subcategory/:id"
                  element={<CreateSubCategoryPage />}
                />
                <Route path="/categories/management/paused" element={<PausedCategoriesPage />} />
                <Route path="/categories/management/deleted" element={<DeletedCategoriesPage />} />
                <Route path="/categories/management/rename/:id" element={<RenameCategoryPage />} />
                <Route path="/categories/management/view/:id" element={<CategoryViewPage />} />
                <Route
                  path="/categories/management/:id/subcategory/:subCategoryId"
                  element={<SubCategoryViewPage />}
                />
              </Route>

              <Route element={<PermissionRoute module="venues" />}>
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
                <Route
                  path="/communication/management"
                  element={<CommunicationListPage />}
                />
                <Route
                  path="/communication/create"
                  element={<CreateCommunicationPage />}
                />


                <Route
  path="/communication/view"
  element={<ViewCommunicationPage />}
/>
                <Route path="/venues/management/pending" element={<VenuePendingApprovalsPage />} />
                <Route path="/venues/management/suspended" element={<VenueSuspendedPage />} />
                <Route path="/venues/management/onboarding" element={<CreateVenueOnboardingPage />} />
                <Route path="/venues/management/create" element={<CreateVenueListingPage />} />
                <Route
                  path="/venues/categories/management"
                  element={<VenueCategoryManagementPage />}
                />
                <Route
                  path="/venues/categories/management/create"
                  element={<CreateVenueCategoryPage />}
                />
                <Route
                  path="/venues/categories/management/create-subcategory/:id"
                  element={<CreateVenueSubCategoryPage />}
                />
                <Route
                  path="/venues/categories/management/paused"
                  element={<PausedVenueCategoriesPage />}
                />
                <Route
                  path="/venues/categories/management/deleted"
                  element={<DeletedVenueCategoriesPage />}
                />
                <Route
                  path="/venues/categories/management/rename/:id"
                  element={<RenameVenueCategoryPage />}
                />
                <Route
                  path="/venues/categories/management/view/:id"
                  element={<VenueCategoryViewPage />}
                />
                <Route
                  path="/venues/categories/management/:id/subcategory/:subCategoryId"
                  element={<VenueSubCategoryViewPage />}
                />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
