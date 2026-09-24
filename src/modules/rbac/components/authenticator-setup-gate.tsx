import { useLocation, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/modules/auth/store/auth-store'
import { useSecurityPolicy } from '@/modules/settings/hooks/use-security-policy'
import { selectedMfaMethod } from '@/modules/settings/utils/security-settings'

import { useContactSetupProfile, useRbacMe } from '../hooks/use-rbac'
import { AuthenticatorRequiredModal } from './authenticator-required-modal'
import {
  isAuthenticatorSetupRoute,
  myProfileAuthenticatorSetupPath,
} from '../utils/authenticator-setup'

export function AuthenticatorSetupGate() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { mfa, isLoading: isPolicyLoading } = useSecurityPolicy()
  const isSubAdmin = Boolean(user && !user.isSuperAdmin)

  // Fast polling (5s) for subadmins to detect super-admin role/MFA changes in real time
  const meQuery = useRbacMe(isSubAdmin ? { refetchInterval: 5_000 } : undefined)
  const contactQuery = useContactSetupProfile(
    isSubAdmin,
    isSubAdmin ? { refetchInterval: 5_000 } : undefined,
  )

  const liveEnrolled = isSubAdmin
    ? contactQuery.data?.data.profile?.mfaEnabled
    : (meQuery.data?.data.mfaEnabled ?? meQuery.data?.data.profile?.mfaEnabled)

  // Prefer live server state over local storage state
  const enrolled = typeof liveEnrolled === 'boolean' ? liveEnrolled : Boolean(user?.mfaEnabled)
  const enrollmentResolved =
    typeof liveEnrolled === 'boolean' ||
    typeof user?.mfaEnabled === 'boolean' ||
    meQuery.isFetched ||
    (isSubAdmin && contactQuery.isFetched)

  const policyRequiresMfa =
    mfa.requireForAllSubAdmins && selectedMfaMethod(mfa) === 'authenticatorApp'
  const roleRequiresMfa = Boolean(meQuery.data?.data?.mfaRequired)
  const requiresMfaSetup = Boolean(meQuery.data?.data?.requiresMfaSetup)

  // If policy, role, or reset requires MFA, or if sub-admin is not enrolled
  const requiresAuthenticator =
    policyRequiresMfa || roleRequiresMfa || requiresMfaSetup || (isSubAdmin && !enrolled)
  const inSetupFlow = isAuthenticatorSetupRoute(location.pathname, location.search)
  const open =
    !isPolicyLoading && enrollmentResolved && requiresAuthenticator && !enrolled && !inSetupFlow

  return (
    <AuthenticatorRequiredModal
      open={open}
      title="Authenticator setup required"
      description="Two-factor authentication is required for your account or has been reset by an administrator. Please set up your authenticator app to continue."
      onSetup={() => navigate(myProfileAuthenticatorSetupPath())}
    />
  )
}
