import { MembershipPlansPage } from './membership-plans-page'

export function MembershipPausedPlansPage() {
  return (
    <MembershipPlansPage
      fixedStatus="paused"
      title="Paused Plans"
      subtitle="Review paused membership plans and resume when ready."
    />
  )
}

export function MembershipInactivePlansPage() {
  return (
    <MembershipPlansPage
      fixedStatus="inactive"
      title="Inactive Plans"
      subtitle="Manage inactive membership plans and reactivate when needed."
    />
  )
}

export function MembershipDeletedPlansPage() {
  return (
    <MembershipPlansPage
      fixedStatus="deleted"
      title="Deleted Plans"
      subtitle="Archived membership plans that are no longer available."
    />
  )
}
