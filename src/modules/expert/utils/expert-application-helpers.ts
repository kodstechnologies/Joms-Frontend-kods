import type {
  ApplicationStatus,
  ExpertApplicationExpert,
  ExpertApplicationKyc,
} from '../type/expert-application-view'

export const hasAdminIdentityKyc = (expert?: ExpertApplicationExpert) => {
  const identity = expert?.identityVerification
  return Boolean(identity?.panNumber && identity?.panCardFile)
}

export const isAdminKycApproved = (expert?: ExpertApplicationExpert) =>
  expert?.finalReview?.approvalStatus === 'approved' ||
  (expert?.finalReview?.isVerified === true && hasAdminIdentityKyc(expert))

export const isKycSubmittedForApplication = (
  expert?: ExpertApplicationExpert,
  kyc?: ExpertApplicationKyc,
) => Boolean(kyc?._id) || isAdminKycApproved(expert)

export const getDisplayKycStatus = (
  expert?: ExpertApplicationExpert,
  kyc?: ExpertApplicationKyc,
): ApplicationStatus | undefined =>
  kyc?.status ?? (isAdminKycApproved(expert) ? 'APPROVED' : undefined)
