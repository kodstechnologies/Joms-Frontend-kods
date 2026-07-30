import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { ProtectedRoute } from '@/app/router/protected-route'
import { ContactSetupRoute } from '@/app/router/contact-setup-route'
import { PermissionRoute } from '@/app/router/permission-route'
import { HomeRedirect } from '@/app/router/home-redirect'
import { SuperAdminRoute } from '@/app/router/super-admin-route'
const LoginPage = lazy(() =>
  import('@/modules/auth/pages/login-page').then((m) => ({ default: m.LoginPage })),
)
const ChatTestPage = lazy(() =>
  import('@/modules/chat-test').then((m) => ({ default: m.ChatTestPage })),
)
const UserChatTestPage = lazy(() =>
  import('@/modules/chat-test').then((m) => ({ default: m.UserChatTestPage })),
)
const PartnerChatTestPage = lazy(() =>
  import('@/modules/chat-test').then((m) => ({ default: m.PartnerChatTestPage })),
)
const ExecutiveOverviewPage = lazy(() =>
  import('@/modules/dashboard/pages/executive-overview-page').then((m) => ({
    default: m.ExecutiveOverviewPage,
  })),
)
const SharedModuleMetricsPage = lazy(() =>
  import('@/shared/pages/shared-module-metrics-page').then((m) => ({
    default: m.SharedModuleMetricsPage,
  })),
)
const ServiceMarketplacePage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.ServiceMarketplacePage })),
)
const ServiceMetricsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.ServiceMetricsPage })),
)
const ServiceDashboardMetricsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.ServiceDashboardMetricsPage })),
)
const PendingApprovalsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.PendingApprovalsPage })),
)
const SuspendedServicesPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.SuspendedServicesPage })),
)
const DeletedServicesPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.DeletedServicesPage })),
)
const ServiceManagementPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.ServiceManagementPage })),
)
const ServiceViewPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.ServiceViewPage })),
)
const ConsultationViewPage = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.ConsultationViewPage })),
)
const ServiceManagementViewRoute = lazy(() =>
  import('@/modules/expert').then((m) => ({ default: m.ServiceManagementViewRoute })),
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
const ExpertManagementMetricsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertManagementMetricsPage,
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
const ExpertApplicationRoute = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertApplicationRoute,
  })),
)
const ExpertProfileViewPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertProfileViewPage,
  })),
)
const ExpertProfileAnalyticsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ExpertProfileAnalyticsPage,
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
const VenueMetricsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueMetricsPage,
  })),
)
const VenueDashboardMetricsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueDashboardMetricsPage,
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
const CreateVenueOnboardingPage = lazy(
  () => import('@/modules/expert/pages/venue/create-venue-onboarding-page'),
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
const VenueRejectedPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueRejectedPage,
  })),
)
const VenueDeletedPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueDeletedPage,
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
const SpaceAnalyticsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.SpaceAnalyticsPage,
  })),
)
const VenueProfileAnalyticsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueProfileAnalyticsPage,
  })),
)
const ReferralManagementPage = lazy(() =>
  import('@/modules/referrals').then((m) => ({
    default: m.ReferralManagementPage,
  })),
)
const SupportDashboardPage = lazy(() =>
  import('@/modules/support-management').then((m) => ({
    default: m.SupportDashboardPage,
  })),
)
const MainSettingsPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.MainSettingsPage,
  })),
)
const PlatformHealthPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.PlatformHealthPage,
  })),
)
const SettingsLogsPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.SettingsLogsPage,
  })),
)
const BackupConfigurationPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.BackupConfigurationPage,
  })),
)
const LockedAccountsPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.LockedAccountsPage,
  })),
)
const LoginTrailsPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.LoginTrailsPage,
  })),
)
const CategoryHubPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.CategoryHubPage,
  })),
)
const SystemConfigurationPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.SystemConfigurationPage,
  })),
)

const ApiKeyManagementPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.ApiKeyManagementPage,
  })),
)
const PolicyManagementPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.PolicyManagementPage,
  })),
)
const PolicyCreatePage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.PolicyCreatePage,
  })),
)
const PolicyTimelinePage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.PolicyTimelinePage,
  })),
)
const PolicyDetailPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.PolicyDetailPage,
  })),
)
const TemplatesPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.TemplatesPage,
  })),
)
const TicketManagementPage = lazy(() =>
  import('@/modules/support-management').then((m) => ({
    default: m.TicketManagementPage,
  })),
)
const SupportWorkspacePage = lazy(() =>
  import('@/modules/support-management').then((m) => ({
    default: m.SupportWorkspacePage,
  })),
)
const PastTicketsPage = lazy(() =>
  import('@/modules/support-management').then((m) => ({
    default: m.PastTicketsPage,
  })),
)
const TicketDetailPage = lazy(() =>
  import('@/modules/support-management').then((m) => ({
    default: m.TicketDetailPage,
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
const AdminDetailPage = lazy(() =>
  import('@/modules/rbac').then((m) => ({
    default: m.AdminDetailPage,
  })),
)
const RoleUsersPage = lazy(() =>
  import('@/modules/rbac').then((m) => ({
    default: m.RoleUsersPage,
  })),
)
const AdminLogsPage = lazy(() =>
  import('@/modules/rbac').then((m) => ({
    default: m.AdminLogsPage,
  })),
)
const UpdateContactInformationPage = lazy(() =>
  import('@/modules/rbac').then((m) => ({
    default: m.UpdateContactInformationPage,
  })),
)
const MyProfilePage = lazy(() =>
  import('@/modules/rbac').then((m) => ({
    default: m.MyProfilePage,
  })),
)
const MyTasksPage = lazy(() =>
  import('@/modules/my-tasks').then((m) => ({
    default: m.MyTasksPage,
  })),
)
const SpaceDetailsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.SpaceDetailsPage,
  })),
)
const CategoryManagementPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.CategoryManagementPage,
  })),
)
const CategoryManagementMetricsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.CategoryManagementMetricsPage,
  })),
)

const CreateCategoryPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.CreateCategoryPage,
  })),
)

const CreateSubCategoryPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.CreateSubCategoryPage,
  })),
)

const PausedCategoriesPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.PausedCategoriesPage,
  })),
)

const RenameCategoryPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.RenameCategoryPage,
  })),
)

const DeletedCategoriesPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.DeletedCategoriesPage,
  })),
)

const CategoryViewPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.CategoryViewPage,
  })),
)

const FinanceDashboardPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.FinanceDashboardPage,
  })),
)

const RevenueOverviewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.RevenueOverviewPage,
  })),
)

const PaymentDetailViewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.PaymentDetailViewPage,
  })),
)

const FinanceServicesPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.FinanceServicesPage,
  })),
)

const ServicePaymentDetailViewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.ServicePaymentDetailViewPage,
  })),
)

const FinanceVenuesPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.FinanceVenuesPage,
  })),
)

const VenuePaymentDetailViewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.VenuePaymentDetailViewPage,
  })),
)

const FinanceTaxCompliancePage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.FinanceTaxCompliancePage,
  })),
)

const TaxComplianceDetailViewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.TaxComplianceDetailViewPage,
  })),
)

const FinanceReconciliationPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.FinanceReconciliationPage,
  })),
)

const ReconciliationDetailViewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.ReconciliationDetailViewPage,
  })),
)

const EscrowManagementPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.EscrowManagementPage,
  })),
)

const EscrowDetailViewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.EscrowDetailViewPage,
  })),
)

const FinanceRefundsPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.FinanceRefundsPage,
  })),
)

const RefundDetailViewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.RefundDetailViewPage,
  })),
)

const DisputeDetailViewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.DisputeDetailViewPage,
  })),
)

const AssignRefundAuthorityPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.AssignRefundAuthorityPage,
  })),
)

const FinanceEventsPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.FinanceEventsPage,
  })),
)

const MembershipManagementPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.MembershipManagementPage,
  })),
)

const MembershipDetailViewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.MembershipDetailViewPage,
  })),
)

const PayoutManagementPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.PayoutManagementPage,
  })),
)

const PayoutDetailViewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.PayoutDetailViewPage,
  })),
)

const InvoicesBillingPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.InvoicesBillingPage,
  })),
)

const InvoiceDetailViewPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.InvoiceDetailViewPage,
  })),
)

const FinanceCategoryPage = lazy(() =>
  import('@/modules/payments').then((m) => ({
    default: m.FinanceCategoryPage,
  })),
)

const SubCategoryViewPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.SubCategoryViewPage,
  })),
)
const ServiceCategoryFilterPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.ServiceCategoryFilterPage,
  })),
)

const VenueCategoryManagementPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueCategoryManagementPage,
  })),
)
const VenueCategoryManagementMetricsPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueCategoryManagementMetricsPage,
  })),
)

const CreateVenueCategoryPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.CreateVenueCategoryPage,
  })),
)

const CreateVenueSubCategoryPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.CreateVenueSubCategoryPage,
  })),
)

const PausedVenueCategoriesPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.PausedVenueCategoriesPage,
  })),
)

const DeletedVenueCategoriesPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.DeletedVenueCategoriesPage,
  })),
)

const RenameVenueCategoryPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.RenameVenueCategoryPage,
  })),
)

const VenueCategoryViewPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueCategoryViewPage,
  })),
)

const VenueSubCategoryViewPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueSubCategoryViewPage,
  })),
)
const VenueCategoryFilterPage = lazy(() =>
  import('@/modules/expert').then((m) => ({
    default: m.VenueCategoryFilterPage,
  })),
)

const CommunicationListPage = lazy(() =>
  import('@/modules/communication').then((m) => ({
    default: m.CommunicationListPage,
  })),
)

const CreateCommunicationPage = lazy(() =>
  import('@/modules/communication').then((m) => ({
    default: m.CreateCommunicationPage,
  })),
)

const ViewCommunicationPage = lazy(() =>
  import('@/modules/communication').then((m) => ({
    default: m.ViewCommunicationPage,
  })),
)

const EscalationPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.EscalationPage,
  })),
)

const RefundDetailsPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.RefundDetailsPage,
  })),
)

const MembershipUpgradeDetailsPage = lazy(() =>
  import('@/modules/settings').then((m) => ({
    default: m.MembershipUpgradeDetailsPage,
  })),
)

const PageLoader = () => (
  <div className="bg-brand-bg flex h-dvh w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="border-brand-accent size-10 animate-spin rounded-full border-4 border-t-transparent" />
      <p className="text-brand-muted animate-pulse text-sm font-medium">Loading...</p>
    </div>
  </div>
)

export function AppRouter() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        <Route
          path="/auth/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          }
        />

        <Route
          path="/dev/chat-test"
          element={
            <Suspense fallback={<PageLoader />}>
              <ChatTestPage />
            </Suspense>
          }
        />
        <Route
          path="/dev/chat-partner"
          element={
            <Suspense fallback={<PageLoader />}>
              <PartnerChatTestPage />
            </Suspense>
          }
        />
        <Route
          path="/dev/chat-user"
          element={
            <Suspense fallback={<PageLoader />}>
              <UserChatTestPage />
            </Suspense>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/auth/contact-information"
            element={
              <Suspense fallback={<PageLoader />}>
                <UpdateContactInformationPage />
              </Suspense>
            }
          />

          <Route element={<ContactSetupRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/dashboard" element={<HomeRedirect />} />
              <Route path="/metrics/:moduleKey" element={<SharedModuleMetricsPage />} />
              <Route path="/settings/access/my-profile" element={<MyProfilePage />} />
              <Route path="/my-tasks" element={<MyTasksPage />} />

              <Route element={<SuperAdminRoute />}>
                <Route path="/dashboard/executive" element={<ExecutiveOverviewPage />} />
                <Route path="/referrals/management" element={<ReferralManagementPage />} />
                <Route path="/support/dashboard" element={<SupportDashboardPage />} />
                <Route path="/support/tickets" element={<TicketManagementPage />} />
                <Route path="/support/tickets/:id" element={<TicketDetailPage />} />
                <Route path="/support/workspace" element={<SupportWorkspacePage />} />
                <Route path="/support/past-tickets/:userId" element={<PastTicketsPage />} />
                <Route path="/memberships/plans" element={<MembershipPlansPage />} />
                <Route path="/memberships/plans/create" element={<MembershipPlanFormPage />} />
                <Route path="/memberships/plans/:id/edit" element={<MembershipPlanFormPage />} />
                <Route path="/memberships/plans/paused" element={<MembershipPausedPlansPage />} />
                <Route
                  path="/memberships/plans/inactive"
                  element={<MembershipInactivePlansPage />}
                />
                <Route path="/memberships/plans/deleted" element={<MembershipDeletedPlansPage />} />
                <Route path="/memberships/experts" element={<ExpertMembershipsPage />} />
                <Route path="/memberships/experts/:id" element={<MembershipDetailsPage />} />
                <Route path="/settings/health" element={<PlatformHealthPage />} />
                <Route path="/settings/logs" element={<SettingsLogsPage />} />
                <Route path="/settings/backup/configure" element={<BackupConfigurationPage />} />
                <Route path="/settings/security/locked-accounts" element={<LockedAccountsPage />} />
                <Route path="/settings/security/login-trails" element={<LoginTrailsPage />} />
                <Route path="/settings/main" element={<MainSettingsPage />} />
                <Route path="/settings/policies" element={<PolicyManagementPage />} />
                <Route path="/settings/policies/create" element={<PolicyCreatePage />} />
                <Route path="/settings/policies/:id/timeline" element={<PolicyTimelinePage />} />
                <Route path="/settings/policies/:id" element={<PolicyDetailPage />} />
                <Route path="/settings/templates" element={<TemplatesPage />} />
                <Route path="/content-moderation/templates" element={<TemplatesPage />} />
                <Route path="/settings/categories" element={<CategoryHubPage />} />
                <Route path="/settings/system" element={<SystemConfigurationPage />} />

                <Route path="/settings/api-keys" element={<ApiKeyManagementPage />} />
                <Route path="/settings/access" element={<RbacHubPage />} />
                <Route path="/settings/access/roles/create" element={<CreateRolePage />} />
                <Route path="/settings/access/roles/:id/edit" element={<CreateRolePage />} />
                <Route path="/settings/access/users/create" element={<CreateSubAdminPage />} />
                <Route path="/settings/access/users/:id/logs" element={<AdminLogsPage />} />
                <Route path="/settings/access/users/:id/invites" element={<SubAdminDetailPage />} />
                <Route path="/settings/access/users/:id" element={<AdminDetailPage />} />
                <Route path="/settings/access/roles/:id/users" element={<RoleUsersPage />} />
                <Route path="/settings/access/roles/:id/logs" element={<AdminLogsPage />} />
                <Route path="/finance/dashboard" element={<FinanceDashboardPage />} />
                <Route path="/finance/revenue" element={<RevenueOverviewPage />} />
                <Route path="/finance/revenue/:id" element={<PaymentDetailViewPage />} />
                <Route path="/finance/events" element={<FinanceEventsPage />} />
                <Route path="/finance/services" element={<FinanceServicesPage />} />
                <Route path="/finance/services/:id" element={<ServicePaymentDetailViewPage />} />
                <Route path="/finance/venues" element={<FinanceVenuesPage />} />
                <Route path="/finance/venues/:id" element={<VenuePaymentDetailViewPage />} />
                <Route path="/finance/memberships" element={<MembershipManagementPage />} />
                <Route path="/finance/memberships/:id" element={<MembershipDetailViewPage />} />
                <Route path="/finance/payouts" element={<PayoutManagementPage />} />
                <Route path="/finance/payouts/:id" element={<PayoutDetailViewPage />} />
                <Route path="/finance/tax" element={<FinanceTaxCompliancePage />} />
                <Route path="/finance/tax/:id" element={<TaxComplianceDetailViewPage />} />
                <Route path="/finance/invoices" element={<InvoicesBillingPage />} />
                <Route path="/finance/invoices/:id" element={<InvoiceDetailViewPage />} />
                <Route path="/finance/reconciliation" element={<FinanceReconciliationPage />} />
                <Route
                  path="/finance/reconciliation/:id"
                  element={<ReconciliationDetailViewPage />}
                />
                <Route path="/finance/categories" element={<FinanceCategoryPage />} />
                <Route path="/finance/escrow" element={<EscrowManagementPage />} />
                <Route path="/finance/escrow/:id" element={<EscrowDetailViewPage />} />
                <Route path="/finance/refunds" element={<FinanceRefundsPage />} />
                <Route
                  path="/finance/refunds/:id/escalate"
                  element={<AssignRefundAuthorityPage />}
                />
                <Route path="/finance/refunds/:id/dispute" element={<DisputeDetailViewPage />} />
                <Route path="/finance/refunds/:id" element={<RefundDetailViewPage />} />
              </Route>

              <Route element={<PermissionRoute module="experts" />}>
                <Route path="/experts/dashboard" element={<ExpertDashboardPage />} />
                <Route path="/experts/dashboard/metrics" element={<ExpertMetricsPage />} />
                <Route path="/experts/management" element={<ExpertManagementPage />} />
                <Route
                  path="/experts/management/metrics"
                  element={<ExpertManagementMetricsPage />}
                />
                <Route path="/experts/management/create" element={<CreateExpertPage />} />
                <Route path="/experts/management/profile/:id" element={<ExpertProfileViewPage />} />
                <Route
                  path="/experts/management/profile/:id/analytics"
                  element={<ExpertProfileAnalyticsPage />}
                />
                <Route
                  path="/experts/management/profile/:expertId/service/:serviceId"
                  element={<ServiceViewPage />}
                />
                <Route
                  path="/experts/management/application/:id"
                  element={<ExpertApplicationRoute />}
                />
                <Route path="/experts/suspended" element={<ExpertSuspendedExpertsPage />} />
                <Route path="/experts/deleted" element={<ExpertDeletedExpertsPage />} />
                <Route path="/experts/reported" element={<ExpertReportedExpertsPage />} />
                <Route path="/experts/pending-approvals" element={<ExpertPendingApprovalsPage />} />
                <Route path="/experts/leaderboard" element={<LeaderboardPage />} />
              </Route>

              <Route element={<PermissionRoute module="services" />}>
                <Route path="/services/dashboard" element={<ServiceMarketplacePage />} />
                <Route
                  path="/services/dashboard/metrics"
                  element={<ServiceDashboardMetricsPage />}
                />
                <Route path="/services/management" element={<ServiceManagementPage />} />
                <Route path="/services/management/metrics" element={<ServiceMetricsPage />} />
                <Route path="/services/management/pending" element={<PendingApprovalsPage />} />
                <Route path="/services/management/suspended" element={<SuspendedServicesPage />} />
                <Route path="/services/management/deleted" element={<DeletedServicesPage />} />
                <Route path="/services/management/create" element={<CreateServiceListingPage />} />
                <Route
                  path="/services/management/view/:id"
                  element={<ServiceManagementViewRoute />}
                />
                <Route
                  path="/services/management/consultation/:id"
                  element={<ConsultationViewPage />}
                />
                <Route path="/categories/management" element={<CategoryManagementPage />} />
                <Route
                  path="/categories/management/metrics"
                  element={<CategoryManagementMetricsPage />}
                />
                <Route path="/categories/management/create" element={<CreateCategoryPage />} />
                <Route
                  path="/categories/management/create-subcategory/:id"
                  element={<CreateSubCategoryPage />}
                />
                <Route path="/categories/management/paused" element={<PausedCategoriesPage />} />
                <Route path="/categories/management/deleted" element={<DeletedCategoriesPage />} />
                <Route path="/categories/management/rename/:id" element={<RenameCategoryPage />} />
                <Route
                  path="/categories/management/filter"
                  element={<ServiceCategoryFilterPage />}
                />
                <Route path="/categories/management/view/:id" element={<CategoryViewPage />} />
                <Route
                  path="/categories/management/:id/subcategory/:subCategoryId"
                  element={<SubCategoryViewPage />}
                />
              </Route>

              <Route element={<PermissionRoute module="venues" />}>
                <Route path="/venues/dashboard" element={<VenueDashboardPage />} />
                <Route path="/venues/dashboard/metrics" element={<VenueDashboardMetricsPage />} />
                <Route path="/venues/leaderboard" element={<LeaderboardPage />} />
                <Route path="/venues/management" element={<VenueManagementPage />} />
                <Route path="/venues/management/metrics" element={<VenueMetricsPage />} />
                <Route
                  path="/venues/management/application/:id"
                  element={<ApplicationDetailsPage />}
                />
                <Route
                  path="/venues/management/profile/:venueId"
                  element={<VenueProfileViewPage />}
                />
                <Route
                  path="/venues/management/profile/:venueId/analytics"
                  element={<VenueProfileAnalyticsPage />}
                />
                <Route
                  path="/venues/management/profile/:venueId/space/:spaceId"
                  element={<SpaceDetailsPage />}
                />
                <Route
                  path="/venues/management/profile/:venueId/space/:spaceId/analytics"
                  element={<SpaceAnalyticsPage />}
                />
                <Route path="/communication/management" element={<CommunicationListPage />} />
                <Route path="/communication/create" element={<CreateCommunicationPage />} />
                <Route path="/communication/view/:id" element={<ViewCommunicationPage />} />

                <Route path="/settings/escalations" element={<EscalationPage />} />

                <Route path="/settings/refund-details" element={<RefundDetailsPage />} />

                <Route
                  path="/settings/membership-upgrade-details"
                  element={<MembershipUpgradeDetailsPage />}
                />
                <Route path="/venues/management/pending" element={<VenuePendingApprovalsPage />} />
                <Route path="/venues/management/suspended" element={<VenueSuspendedPage />} />
                <Route path="/venues/management/rejected" element={<VenueRejectedPage />} />
                <Route path="/venues/management/deleted" element={<VenueDeletedPage />} />
                <Route
                  path="/venues/management/onboarding"
                  element={<CreateVenueOnboardingPage />}
                />
                <Route path="/venues/management/create" element={<CreateVenueListingPage />} />
                <Route
                  path="/venues/categories/management"
                  element={<VenueCategoryManagementPage />}
                />
                <Route
                  path="/venues/categories/management/metrics"
                  element={<VenueCategoryManagementMetricsPage />}
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
                  path="/venues/categories/management/filter"
                  element={<VenueCategoryFilterPage />}
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
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
