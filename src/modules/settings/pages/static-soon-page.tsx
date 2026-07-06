import { SectionHeader } from '@/shared/components/dashboard/section-header'

type StaticSoonPageProps = {
  title: string
  subtitle: string
}

export function StaticSoonPage({ title, subtitle }: StaticSoonPageProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="rounded-2xl border border-white/10 bg-[#111111] p-8 text-sm text-slate-400">
        This settings area is a static preview for now. Configuration will be wired in a later
        release and does not affect the current admin workflows.
      </div>
    </div>
  )
}

export function SystemConfigurationPage() {
  return (
    <StaticSoonPage
      title="System Configuration"
      subtitle="Deep technical settings for application behavior."
    />
  )
}

export function EscalationsSettingsPage() {
  return (
    <StaticSoonPage
      title="Escalations"
      subtitle="Manage support escalation pathways and alert flows."
    />
  )
}

export function ApiKeyManagementPage() {
  return (
    <StaticSoonPage
      title="API Key Management"
      subtitle="Generate and manage keys for external integrations."
    />
  )
}
