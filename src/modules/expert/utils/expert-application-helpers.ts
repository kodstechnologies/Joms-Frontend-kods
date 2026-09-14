import type {
  ApplicationStatus,
  ExpertApplicationExpert,
  ExpertApplicationKyc,
} from '../type/expert-application-view'
import type { ExpertServiceCategoryGroups } from '../api/expert-onboarding-api'

export const hasAdminIdentityKyc = (expert?: ExpertApplicationExpert) => {
  const identity = expert?.identityVerification
  return Boolean(identity?.panNumber && identity?.panCardFile)
}

export const isAdminKycApproved = (expert?: ExpertApplicationExpert) =>
  expert?.finalReview?.approvalStatus === 'approved' ||
  (expert?.finalReview?.isVerified === true && hasAdminIdentityKyc(expert))

export const isSubmittedKycStatus = (status?: string | null) => {
  const normalized = String(status || '').toUpperCase()
  return normalized === 'PENDING' || normalized === 'APPROVED' || normalized === 'REJECTED'
}

export const isKycSubmittedForApplication = (
  expert?: ExpertApplicationExpert,
  kyc?: ExpertApplicationKyc,
) =>
  (kyc as { kycMandatory?: boolean })?.kycMandatory === false ||
  (kyc as { isExempt?: boolean })?.isExempt === true ||
  isSubmittedKycStatus(kyc?.status) ||
  isAdminKycApproved(expert)

export const getDisplayKycStatus = (
  expert?: ExpertApplicationExpert,
  kyc?: ExpertApplicationKyc,
): ApplicationStatus | undefined =>
  kyc?.status ?? (isAdminKycApproved(expert) ? 'APPROVED' : undefined)

export const getExpertServiceType = (expert?: ExpertApplicationExpert) =>
  expert?.servicetype || expert?.basicProfile?.serviceType || ''

export const formatServiceTypeDisplay = (serviceType?: string) => {
  if (!serviceType?.trim()) return undefined
  const normalized = serviceType.trim().toLowerCase()
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export const getExpertCurrentRole = (expert?: ExpertApplicationExpert) => {
  const currentJob = expert?.workExperience?.find((entry) => entry.currentlyWorking)
  const jobTitle = currentJob?.jobTitle?.trim()
  return jobTitle || undefined
}

export const LOOKS_LIKE_CATEGORY_ID =
  /^(?:[a-fA-F0-9]{24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|c[a-z0-9]{20,})$/i

const getSubCategoryId = (entry: unknown) => {
  if (typeof entry === 'string') return entry
  if (entry && typeof entry === 'object') {
    const value = entry as { _id?: string; id?: string; name?: string }
    if (value._id) return String(value._id)
    if (value.id) return String(value.id)
    if (value.name) return value.name
  }
  return String(entry ?? '')
}

export const resolveExpertServiceCategoryDisplay = (
  expert?: ExpertApplicationExpert,
  categoryGroups?: ExpertServiceCategoryGroups,
) => {
  const preResolved = expert?.basicProfile?.serviceCategoryDisplay
  if (Array.isArray(preResolved) && preResolved.some((name) => Boolean(name?.trim()))) {
    return preResolved.filter((name) => Boolean(name?.trim())).join(', ')
  }

  const idToName = new Map<string, string>()
  Object.values(categoryGroups ?? {})
    .flat()
    .forEach((item) => {
      if (!item) return
      if (item.id && item.name) idToName.set(String(item.id), item.name)
      const raw = item as { _id?: string; id?: string; name?: string }
      if (raw._id && raw.name) idToName.set(String(raw._id), raw.name)
    })

  const resolveOne = (entry: unknown) => {
    if (entry && typeof entry === 'object' && 'name' in entry) {
      const namedEntry = entry as { name?: string }
      if (namedEntry.name?.trim() && !LOOKS_LIKE_CATEGORY_ID.test(namedEntry.name.trim())) {
        return namedEntry.name.trim()
      }
    }

    const id = getSubCategoryId(entry)
    if (!id) return ''
    return idToName.get(id) || (LOOKS_LIKE_CATEGORY_ID.test(id) ? '' : id)
  }

  const fromProfile = expert?.basicProfile?.serviceCategory ?? []
  const fromSubCategory = expert?.subCategory ?? []
  const resolvedNames = [...fromProfile, ...fromSubCategory].map(resolveOne).filter(Boolean)

  return [...new Set(resolvedNames)].join(', ') || undefined
}
