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

export const isKycSubmittedForApplication = (
  expert?: ExpertApplicationExpert,
  kyc?: ExpertApplicationKyc,
) => Boolean(kyc?._id) || isAdminKycApproved(expert)

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
  const namedCategories = expert?.basicProfile?.serviceCategory?.filter(Boolean) ?? []
  if (namedCategories.length > 0) {
    return namedCategories.join(', ')
  }

  const subCategories = expert?.subCategory ?? []
  if (!subCategories.length) return undefined

  const idToName = new Map<string, string>()
  Object.values(categoryGroups ?? {})
    .flat()
    .forEach((item) => {
      idToName.set(item.id, item.name)
    })

  const resolvedNames = subCategories.map((entry) => {
    if (entry && typeof entry === 'object' && 'name' in entry) {
      const namedEntry = entry as { name?: string }
      if (namedEntry.name?.trim()) return namedEntry.name.trim()
    }

    const id = getSubCategoryId(entry)
    return idToName.get(id) || id
  })

  return resolvedNames.filter(Boolean).join(', ') || undefined
}
