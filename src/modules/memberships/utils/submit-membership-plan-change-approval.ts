import { escalateMembershipUpgradeApplication } from '@/modules/my-tasks/api/escalation-api'
import type { MembershipSubscription } from '@/modules/memberships/types/membership-subscription'

export type MembershipPlanChangeType = 'upgrade' | 'downgrade'

export type MembershipPlanChangeApprovalPayload = {
  newMembershipPlanId: string
  newPlanName?: string
  billingCycleName?: string
  reasons: string[]
  adminNotes?: string
}

export type MembershipExtendApprovalPayload = {
  endDate: string
  reasons: string[]
  adminNotes?: string
}

function resolveCurrentPlanId(subscription: MembershipSubscription) {
  return typeof subscription.membershipPlanId === 'string'
    ? subscription.membershipPlanId
    : subscription.membershipPlanId?._id
}

export async function submitMembershipPlanChangeForApproval(
  subscription: MembershipSubscription,
  changeType: MembershipPlanChangeType,
  payload: MembershipPlanChangeApprovalPayload,
) {
  const currentPlanId = resolveCurrentPlanId(subscription)

  const actionLabel = changeType === 'upgrade' ? 'upgrade' : 'downgrade'
  const adminNote =
    payload.adminNotes?.trim() ||
    `Membership ${actionLabel} requested for ${subscription.partnerName || 'member'}`

  // Assignee is resolved on the backend to the current super admin.
  return escalateMembershipUpgradeApplication(subscription._id, {
    assigneeSubAdminId: '',
    adminNote,
    partnerId: subscription.partnerId,
    username: subscription.partnerName || '',
    currentPlanId,
    currentPlanName: subscription.planName,
    newMembershipPlanId: payload.newMembershipPlanId,
    newPlanName: payload.newPlanName,
    billingCycleName: payload.billingCycleName || subscription.billingCycleName,
    reasons:
      payload.reasons?.length > 0
        ? payload.reasons
        : [`Membership ${actionLabel} approval request`],
    adminNotes: adminNote,
    sourceApp: subscription.sourceApp || 'Admin Panel',
    applicationUrl: `/settings/membership-upgrade-details/${subscription._id}`,
    entityTitle: subscription.partnerName || subscription.planName,
    escalationTarget: 'membership_upgrade',
    changeType,
    metadata: {
      subscriptionId: subscription._id,
      changeType,
      currentPlanId,
      currentPlanName: subscription.planName,
      newMembershipPlanId: payload.newMembershipPlanId,
      newPlanName: payload.newPlanName,
      billingCycleName: payload.billingCycleName || subscription.billingCycleName,
      reasons: payload.reasons,
      adminNotes: adminNote,
      sourceApp: subscription.sourceApp || 'Admin Panel',
      username: subscription.partnerName || '',
      partnerId: subscription.partnerId,
    },
  })
}

export async function submitMembershipExtendForApproval(
  subscription: MembershipSubscription,
  payload: MembershipExtendApprovalPayload,
) {
  const currentPlanId = resolveCurrentPlanId(subscription)
  const adminNote =
    payload.adminNotes?.trim() ||
    `Membership extend requested for ${subscription.partnerName || 'member'}`

  return escalateMembershipUpgradeApplication(subscription._id, {
    assigneeSubAdminId: '',
    adminNote,
    partnerId: subscription.partnerId,
    username: subscription.partnerName || '',
    currentPlanId,
    currentPlanName: subscription.planName,
    newMembershipPlanId: currentPlanId,
    newPlanName: subscription.planName,
    billingCycleName: subscription.billingCycleName,
    endDate: payload.endDate,
    currentExpiresAt: subscription.expiresAt,
    reasons: payload.reasons?.length > 0 ? payload.reasons : ['Membership extend approval request'],
    adminNotes: adminNote,
    sourceApp: subscription.sourceApp || 'Admin Panel',
    applicationUrl: `/settings/membership-upgrade-details/${subscription._id}`,
    entityTitle: subscription.partnerName || subscription.planName,
    escalationTarget: 'membership_upgrade',
    changeType: 'extend',
    metadata: {
      subscriptionId: subscription._id,
      changeType: 'extend',
      currentPlanId,
      currentPlanName: subscription.planName,
      endDate: payload.endDate,
      currentExpiresAt: subscription.expiresAt,
      billingCycleName: subscription.billingCycleName,
      reasons: payload.reasons,
      adminNotes: adminNote,
      sourceApp: subscription.sourceApp || 'Admin Panel',
      username: subscription.partnerName || '',
      partnerId: subscription.partnerId,
    },
  })
}
