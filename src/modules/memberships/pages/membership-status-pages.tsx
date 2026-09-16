import { MembershipPlansPage } from './membership-plans-page'

export function MembershipPausedPlansPage() {
  return <MembershipPlansPage fixedStatus="paused" title="Paused Plans" />
}

export function MembershipInactivePlansPage() {
  return <MembershipPlansPage fixedStatus="inactive" title="Inactive Plans" />
}

export function MembershipDeletedPlansPage() {
  return <MembershipPlansPage fixedStatus="deleted" title="Deleted Plans" />
}
