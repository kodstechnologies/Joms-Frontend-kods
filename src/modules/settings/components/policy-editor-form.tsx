import { cn } from '@/shared/lib/cn'

import type { PolicyEditorValues } from '../utils/policy-form'

type PolicyEditorFormProps = {
  values: PolicyEditorValues
  onChange: (patch: Partial<PolicyEditorValues>) => void
  mode: 'create' | 'update'
  showSlug?: boolean
  isActive?: boolean
}

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn('bg-brand-surface space-y-4 rounded-xl border border-white/10 p-4', className)}
    >
      <div>
        <p className="text-body-md-semibold text-white">{title}</p>
        {description ? <p className="text-body-sm text-muted mt-1">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function ToggleCard({
  checked,
  title,
  description,
  onChange,
}: {
  checked: boolean
  title: string
  description: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
        checked
          ? 'border-brand-accent/50 bg-brand-accent/10'
          : 'bg-brand-bg border-white/10 hover:border-white/20',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="border-brand-accent bg-brand-bg text-brand-accent focus:ring-brand-accent mt-1 size-4 rounded"
      />
      <span>
        <span className="text-body-sm-medium block text-white">{title}</span>
        <span className="text-body-sm text-muted mt-0.5 block">{description}</span>
      </span>
    </label>
  )
}

export function PolicyEditorForm({
  values,
  onChange,
  mode,
  showSlug = false,
  isActive = false,
}: PolicyEditorFormProps) {
  return (
    <div className="space-y-4">
      <SectionCard title="Policy Information">
        <div className="flex items-center justify-end">
          {isActive ? (
            <span className="border-brand-positive/30 bg-brand-positive/10 text-body-sm text-brand-positive rounded-full border px-2.5 py-0.5 font-semibold">
              Active
            </span>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-body-sm text-muted mb-1 block">Policy Name</label>
            <input
              value={values.title}
              onChange={(event) => onChange({ title: event.target.value })}
              className="ui-input"
            />
          </div>
          {showSlug ? (
            <div>
              <label className="text-body-sm text-muted mb-1 block">Slug</label>
              <input
                value={values.slug}
                onChange={(event) => onChange({ slug: event.target.value })}
                className="ui-input"
              />
            </div>
          ) : null}
          <div>
            <label className="text-body-sm text-muted mb-1 block">Effective Since</label>
            <input value={values.effectiveSince} readOnly className="ui-input opacity-80" />
          </div>
          {mode === 'update' ? (
            <>
              <div>
                <label className="text-body-sm text-muted mb-1 block">Current Version</label>
                <input value={values.currentVersion} readOnly className="ui-input opacity-80" />
              </div>
              <div>
                <label className="text-body-sm text-muted mb-1 block">New Version</label>
                <input
                  value={values.newVersion}
                  onChange={(event) => onChange({ newVersion: event.target.value })}
                  className="ui-input"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-body-sm text-muted mb-1 block">Version</label>
              <input
                value={values.newVersion}
                onChange={(event) => onChange({ newVersion: event.target.value })}
                className="ui-input"
              />
            </div>
          )}
        </div>

        <div>
          <label className="text-body-sm text-muted mb-1 block">Policy Content</label>
          <textarea
            rows={8}
            value={values.content}
            onChange={(event) => onChange({ content: event.target.value })}
            placeholder="Enter Policy Content Here..."
            className="ui-textarea"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Summary Of What Was Changed"
        description="Explain what changed in this version. This is used for internal audit, legal traceability, and user communications."
        className="border-brand-accent/30"
      >
        <textarea
          rows={3}
          value={values.changeSummary}
          onChange={(event) => onChange({ changeSummary: event.target.value })}
          placeholder="Added GDPR compliance clauses, updated data retention policy..."
          className="ui-textarea"
        />
        <p className="text-body-sm text-muted">This field is required before publishing.</p>
      </SectionCard>

      <SectionCard
        title="Version & Effective Date"
        description="Important: Effective date ≠ publish date. This controls when the new rules actually apply."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={cn(
              'cursor-pointer rounded-xl border px-4 py-3 transition-colors',
              values.effectiveTiming === 'today'
                ? 'border-brand-accent/50 bg-brand-accent/10'
                : 'bg-brand-bg border-white/10',
            )}
          >
            <input
              type="radio"
              name="effectiveTiming"
              checked={values.effectiveTiming === 'today'}
              onChange={() => onChange({ effectiveTiming: 'today' })}
              className="sr-only"
            />
            <span className="text-body-sm-medium block text-white">Today</span>
            <span className="text-body-sm text-muted mt-0.5 block">
              Takes effect immediately upon publish.
            </span>
          </label>
          <label
            className={cn(
              'cursor-pointer rounded-xl border px-4 py-3 transition-colors',
              values.effectiveTiming === 'future'
                ? 'border-brand-accent/50 bg-brand-accent/10'
                : 'bg-brand-bg border-white/10',
            )}
          >
            <input
              type="radio"
              name="effectiveTiming"
              checked={values.effectiveTiming === 'future'}
              onChange={() => onChange({ effectiveTiming: 'future' })}
              className="sr-only"
            />
            <span className="text-body-sm-medium block text-white">Future Date</span>
            <span className="text-body-sm text-muted mt-0.5 block">Schedule for later.</span>
          </label>
        </div>
        {values.effectiveTiming === 'future' ? (
          <div>
            <label className="text-body-sm text-muted mb-1 block">Scheduled Effective Date</label>
            <input
              type="date"
              value={values.futureEffectiveDate}
              onChange={(event) => onChange({ futureEffectiveDate: event.target.value })}
              className="ui-input"
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="User Re-Consent Settings"
        description="Control whether users must accept the updated policy. This makes the policy change legally enforceable."
      >
        <div className="space-y-3">
          <ToggleCard
            checked={values.requireReConsent}
            title="Require users to re-accept this policy"
            description="Users must click 'I Accept' before continuing to use the platform."
            onChange={(checked) => onChange({ requireReConsent: checked })}
          />
          <ToggleCard
            checked={values.blockAppUsageUntilAccepted}
            title="Block app usage until accepted"
            description="Users cannot use the app until they accept. Use for critical policy changes."
            onChange={(checked) => onChange({ blockAppUsageUntilAccepted: checked })}
          />
        </div>

        <div className="space-y-2 border-t border-white/5 pt-4">
          <p className="text-body-sm-medium text-white">Notify User Via</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {(
              [
                ['email', 'Email Notification'],
                ['inApp', 'In-App Prompt'],
                ['push', 'Push Notification'],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="bg-brand-bg flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={values.notifyVia[key]}
                  onChange={(event) =>
                    onChange({
                      notifyVia: { ...values.notifyVia, [key]: event.target.checked },
                    })
                  }
                  className="border-brand-accent bg-brand-bg text-brand-accent size-4 rounded"
                />
                <span className="text-body-sm text-white">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
