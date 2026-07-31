import { Bold, Calendar, ChevronDown, Italic, Strikethrough, Underline } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

import { formatPolicyDateUs, toDateInputValue, type PolicyEditorValues } from '../utils/policy-form'

type PolicyEditorFormProps = {
  values: PolicyEditorValues
  onChange: (patch: Partial<PolicyEditorValues>) => void
  mode: 'create' | 'update'
  showSlug?: boolean
  isActive?: boolean
}

function PolicySectionCard({
  title,
  description,
  headerRight,
  children,
  className,
}: {
  title: string
  description?: string
  headerRight?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('policy-section-card', className)}>
      <div
        className={cn(
          'policy-section-card-header',
          description && 'policy-section-card-header--with-description',
        )}
      >
        <div className="policy-section-card-heading">
          <h3 className="settings-section-card-title">{title}</h3>
          {description ? <p className="settings-section-description">{description}</p> : null}
        </div>
        {headerRight}
      </div>
      <div className="policy-section-card-body">{children}</div>
    </section>
  )
}

function PolicyConsentCard({
  checked,
  title,
  description,
  highlightWhenChecked = false,
  onChange,
}: {
  checked: boolean
  title: string
  description: string
  highlightWhenChecked?: boolean
  onChange: (checked: boolean) => void
}) {
  const isHighlighted = checked && highlightWhenChecked

  return (
    <label className={cn('policy-consent-card', isHighlighted && 'policy-consent-card--checked')}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={cn(
          'policy-choice-checkbox',
          isHighlighted ? 'policy-choice-checkbox--gold' : 'policy-choice-checkbox--dark',
        )}
      />
      <span className="policy-consent-copy">
        <span className="settings-toggle-title">{title}</span>
        <span className="settings-toggle-description">{description}</span>
      </span>
    </label>
  )
}

function PolicyField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="settings-field-stack">
      <label className="settings-field-label">{label}</label>
      {children}
    </div>
  )
}

export function PolicyEditorForm({
  values,
  onChange,
  mode,
  showSlug = false,
  isActive = false,
}: PolicyEditorFormProps) {
  const displayedEffectiveDate =
    values.effectiveTiming === 'today'
      ? formatPolicyDateUs(new Date())
      : formatPolicyDateUs(values.futureEffectiveDate || toDateInputValue(new Date()))

  return (
    <div className="policy-editor-form">
      <PolicySectionCard
        title="Policy Information"
        headerRight={isActive ? <span className="policy-active-badge">Active</span> : null}
      >
        <div className="settings-fields-grid">
          <PolicyField label="Policy Name">
            <input
              value={values.title}
              onChange={(event) => onChange({ title: event.target.value })}
              className="settings-field-input"
            />
          </PolicyField>
          {showSlug ? (
            <PolicyField label="Slug">
              <input
                value={values.slug}
                onChange={(event) => onChange({ slug: event.target.value })}
                className="settings-field-input"
              />
            </PolicyField>
          ) : null}
          <PolicyField label="Effective Since">
            <input value={values.effectiveSince} readOnly className="settings-field-input" />
          </PolicyField>
          {mode === 'update' ? (
            <>
              <PolicyField label="Current Version">
                <input value={values.currentVersion} readOnly className="settings-field-input" />
              </PolicyField>
              <PolicyField label="New Version">
                <input
                  value={values.newVersion}
                  onChange={(event) => onChange({ newVersion: event.target.value })}
                  className="settings-field-input"
                />
              </PolicyField>
            </>
          ) : (
            <PolicyField label="Version">
              <input
                value={values.newVersion}
                onChange={(event) => onChange({ newVersion: event.target.value })}
                className="settings-field-input"
              />
            </PolicyField>
          )}
        </div>

        <PolicyField label="Policy Content">
          <div className="policy-content-editor">
            <div className="policy-content-toolbar">
              <div className="policy-content-toolbar-select-wrap">
                <select className="policy-content-toolbar-select" defaultValue="normal">
                  <option value="normal">Normal</option>
                  <option value="heading">Heading</option>
                </select>
                <ChevronDown className="policy-content-toolbar-select-icon" aria-hidden />
              </div>
              <span className="policy-content-toolbar-divider" aria-hidden />
              <button type="button" className="policy-content-toolbar-btn" aria-label="Bold">
                <Bold className="size-4" />
              </button>
              <button type="button" className="policy-content-toolbar-btn" aria-label="Italic">
                <Italic className="size-4" />
              </button>
              <button type="button" className="policy-content-toolbar-btn" aria-label="Underline">
                <Underline className="size-4" />
              </button>
              <button
                type="button"
                className="policy-content-toolbar-btn"
                aria-label="Strikethrough"
              >
                <Strikethrough className="size-4" />
              </button>
            </div>
            <textarea
              rows={8}
              value={values.content}
              onChange={(event) => onChange({ content: event.target.value })}
              placeholder="Enter Policy Content Here..."
              className="policy-content-textarea"
            />
          </div>
        </PolicyField>
      </PolicySectionCard>

      <PolicySectionCard
        title="Summary Of What Was Changed"
        description="Explain what changed in this version. This is used for internal audit, legal traceability, and user communications."
      >
        <textarea
          rows={3}
          value={values.changeSummary}
          onChange={(event) => onChange({ changeSummary: event.target.value })}
          placeholder="Added GDPR compliance clauses, updated data retention policy..."
          className="settings-field-textarea policy-summary-textarea"
        />
        <p className="policy-required-note">This field is required before publishing.</p>
      </PolicySectionCard>

      <PolicySectionCard
        title="Version & Effective Date"
        description="Important: Effective date ≠ publish date. This controls when the new rules actually apply."
      >
        <div className="policy-timing-grid">
          <label
            className={cn(
              'policy-timing-card',
              values.effectiveTiming === 'today' && 'policy-timing-card--selected',
            )}
          >
            <input
              type="radio"
              name="effectiveTiming"
              checked={values.effectiveTiming === 'today'}
              onChange={() => onChange({ effectiveTiming: 'today' })}
              className="policy-choice-radio"
            />
            <span className="policy-timing-copy">
              <span className="settings-toggle-title">Today</span>
              <span className="settings-toggle-description">
                Takes effect immediately upon publish.
              </span>
            </span>
          </label>
          <label
            className={cn(
              'policy-timing-card',
              values.effectiveTiming === 'future' && 'policy-timing-card--selected',
            )}
          >
            <input
              type="radio"
              name="effectiveTiming"
              checked={values.effectiveTiming === 'future'}
              onChange={() => onChange({ effectiveTiming: 'future' })}
              className="policy-choice-radio"
            />
            <span className="policy-timing-copy">
              <span className="settings-toggle-title">Future Date</span>
              <span className="settings-toggle-description">Schedule for later.</span>
            </span>
          </label>
        </div>

        <div className="policy-date-field-wrap">
          <span className="policy-date-display">{displayedEffectiveDate}</span>
          <input
            type="date"
            value={
              values.effectiveTiming === 'today'
                ? toDateInputValue(new Date())
                : values.futureEffectiveDate
            }
            onChange={(event) => {
              onChange({
                futureEffectiveDate: event.target.value,
                effectiveTiming: 'future',
              })
            }}
            disabled={values.effectiveTiming === 'today'}
            className="policy-date-input"
            aria-label="Effective date"
          />
          <Calendar className="policy-date-icon" aria-hidden />
        </div>
      </PolicySectionCard>

      <PolicySectionCard
        title="User Re-Consent Settings"
        description="Control whether users must accept the updated policy. This makes the policy change legally enforceable."
      >
        <div className="policy-consent-stack">
          <PolicyConsentCard
            checked={values.requireReConsent}
            highlightWhenChecked
            title="Require users to re-accept this policy"
            description="Users must click 'I Accept' before continuing to use the platform."
            onChange={(checked) => onChange({ requireReConsent: checked })}
          />
          <PolicyConsentCard
            checked={values.blockAppUsageUntilAccepted}
            title="Block app usage until accepted"
            description="Users cannot use the app until they accept. Use for critical policy changes."
            onChange={(checked) => onChange({ blockAppUsageUntilAccepted: checked })}
          />
        </div>

        <div className="policy-notify-section">
          <p className="settings-toggle-title">Notify User Via:</p>
          <div className="policy-notify-grid">
            {(
              [
                ['email', 'Email Notification'],
                ['inApp', 'In-App Prompt'],
                ['push', 'Push Notification'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="policy-notify-option">
                <input
                  type="checkbox"
                  checked={values.notifyVia[key]}
                  onChange={(event) =>
                    onChange({
                      notifyVia: { ...values.notifyVia, [key]: event.target.checked },
                    })
                  }
                  className="policy-choice-checkbox policy-choice-checkbox--notify"
                />
                <span className="policy-notify-label">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </PolicySectionCard>
    </div>
  )
}
