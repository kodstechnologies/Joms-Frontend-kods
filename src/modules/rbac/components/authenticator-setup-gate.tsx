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
  const meQuery = useRbacMe()
  const isSubAdmin = Boolean(user && !user.isSuperAdmin)
  const contactQuery = useContactSetupProfile(isSubAdmin)

  const liveEnrolled = isSubAdmin
    ? contactQuery.data?.data.profile?.mfaEnabled
    : (meQuery.data?.data.mfaEnabled ?? meQuery.data?.data.profile?.mfaEnabled)
  const enrolled = Boolean(user?.mfaEnabled || liveEnrolled)
  const enrollmentResolved =
    typeof liveEnrolled === 'boolean' ||
    typeof user?.mfaEnabled === 'boolean' ||
    meQuery.isFetched ||
    (isSubAdmin && contactQuery.isFetched)
  const requiresAuthenticator =
    mfa.requireForAllSubAdmins && selectedMfaMethod(mfa) === 'authenticatorApp'
  const inSetupFlow = isAuthenticatorSetupRoute(location.pathname, location.search)
  const open =
    !isPolicyLoading && enrollmentResolved && requiresAuthenticator && !enrolled && !inSetupFlow

  return (
    <AuthenticatorRequiredModal
      open={open}
      onSetup={() => navigate(myProfileAuthenticatorSetupPath())}
    />
  )
}
