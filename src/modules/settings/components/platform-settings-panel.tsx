import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloudUpload } from 'lucide-react'
import { guardUploadFile } from '@/shared/lib/upload-file'
import { toast } from 'sonner'

import { AdminNotesModal } from './admin-notes-modal'
import { ChooseErrorTemplateModal } from './choose-error-template-modal'
import { ScheduleMaintenanceModal } from './schedule-maintenance-modal'
import { SettingsInputField, SettingsSelectField, SettingsStackedField } from './settings-field-row'
import { SettingsSectionCard } from './settings-section-card'
import { SettingsToggleRow } from './settings-toggle-row'
import { uploadBrandingAsset } from '../api/settings-api'
import {
  useCreateErrorTemplate,
  useDeleteErrorTemplate,
  useErrorTemplates,
  useUpdateErrorTemplate,
} from '../hooks/use-settings'
import {
  dateFormatOptions,
  exportFormatOptions,
  languageOptions,
  refreshIntervalOptions,
  timezoneOptions,
  type ExportFormatOption,
} from '../mock/platform-options.mock'
import { resolveDefaultExportFormat } from '../utils/export-format'
import type { PlatformSettings } from '../types/settings'
import { Button } from '@/shared/components/ui/button'

type PlatformSettingsPanelProps = {
  value: PlatformSettings
  onChange: (value: PlatformSettings) => void
}

function BrandingUploadTile({
  label,
  kind,
  imageUrl,
  onUploaded,
}: {
  label: string
  kind: 'logo' | 'favicon'
  imageUrl: string
  onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null)
  const showPreview = Boolean(imageUrl) && !uploading && failedPreviewUrl !== imageUrl

  const handleFile = async (file: File | null) => {
    if (!file || !guardUploadFile(file)) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setUploading(true)
    setFailedPreviewUrl(null)
    try {
      const result = await uploadBrandingAsset(kind, file)
      onUploaded(result.url)
      toast.success(`${label} uploaded`)
    } catch {
      toast.error(`Failed to upload ${label.toLowerCase()}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="settings-field-label">{label}</p>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="settings-upload-tile"
      >
        {showPreview ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={label}
            className="size-full object-cover"
            onError={() => setFailedPreviewUrl(imageUrl)}
          />
        ) : (
          <>
            <CloudUpload className="size-4" />
            <span className="settings-upload-tile-label">
              {uploading ? 'Uploading…' : 'Upload'}
            </span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0] ?? null)
          event.target.value = ''
        }}
      />
    </div>
  )
}

export function PlatformSettingsPanel({ value, onChange }: PlatformSettingsPanelProps) {
  const navigate = useNavigate()
  const [errorTemplateOpen, setErrorTemplateOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [pendingSchedule, setPendingSchedule] = useState<{
    startAt: string
    endAt: string
  } | null>(null)
  const templatesQuery = useErrorTemplates()
  const createTemplateMutation = useCreateErrorTemplate()
  const updateTemplateMutation = useUpdateErrorTemplate()
  const deleteTemplateMutation = useDeleteErrorTemplate()

  const updateApplication = (patch: Partial<PlatformSettings['applicationSettings']>) => {
    onChange({
      ...value,
      applicationSettings: { ...value.applicationSettings, ...patch },
    })
  }

  const updateDisplay = (patch: Partial<PlatformSettings['displayPreferences']>) => {
    onChange({
      ...value,
      displayPreferences: {
        ...value.displayPreferences,
        ...patch,
        defaultCurrency: 'INR',
      },
    })
  }

  const updateGeneral = (patch: Partial<PlatformSettings['generalSettings']>) => {
    onChange({
      ...value,
      generalSettings: { ...value.generalSettings, ...patch },
    })
  }

  const exportFormat = resolveDefaultExportFormat(value.generalSettings.defaultExportFormat)

  const ensureTemplatesLoaded = async () => {
    try {
      const result = templatesQuery.data ?? (await templatesQuery.refetch()).data
      if (!result) return
      updateGeneral({
        errorTemplates: result.templates,
        customErrorMessage: result.selectedMessage || value.generalSettings.customErrorMessage,
      })
    } catch {
      toast.error('Failed to fetch templates')
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        title="Application Settings"
        description="Configure basic application information"
      >
        <div className="settings-field-stack">
          <label className="settings-field-label" htmlFor="application-name">
            Application Name
          </label>
          <input
            id="application-name"
            className="settings-field-input"
            value={value.applicationSettings.applicationName ?? ''}
            placeholder="Web admin Panel"
            onChange={(event) => updateApplication({ applicationName: event.target.value })}
          />
        </div>
        <div className="settings-branding-row pt-2">
          <BrandingUploadTile
            label="Logo"
            kind="logo"
            imageUrl={value.applicationSettings.logoUrl ?? ''}
            onUploaded={(url) => updateApplication({ logoUrl: url })}
          />
          <BrandingUploadTile
            label="Favicon"
            kind="favicon"
            imageUrl={value.applicationSettings.faviconUrl ?? ''}
            onUploaded={(url) => updateApplication({ faviconUrl: url })}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Display Preferences"
        description="Customize display and localization settings"
      >
        <div className="settings-fields-grid">
          <SettingsSelectField
            id="display-timezone"
            label="Timezone"
            value={value.displayPreferences.timezone || 'IST, +5:30, Kolkata, India'}
            onChange={(event) => updateDisplay({ timezone: event.target.value })}
          >
            {timezoneOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SettingsSelectField>
          <SettingsSelectField
            id="display-date-format"
            label="Date & Time Format"
            value={value.displayPreferences.dateTimeFormat || 'DD/MM/YY'}
            onChange={(event) => updateDisplay({ dateTimeFormat: event.target.value })}
          >
            {dateFormatOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SettingsSelectField>
          <SettingsSelectField
            id="display-currency"
            label="Default Currency"
            value="INR"
            onChange={() => updateDisplay({ defaultCurrency: 'INR' })}
          >
            <option value="INR">INR</option>
          </SettingsSelectField>
          <SettingsSelectField
            id="display-language"
            label="Language Settings"
            value={value.displayPreferences.language || 'English'}
            onChange={(event) => updateDisplay({ language: event.target.value })}
          >
            {languageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SettingsSelectField>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="General Settings"
        description="Configure system behavior and maintenance options"
      >
        <div className="settings-fields-grid">
          <SettingsSelectField
            id="general-refresh-interval"
            label="Auto-Refresh Interval"
            value={value.generalSettings.autoRefreshInterval}
            onChange={(event) => updateGeneral({ autoRefreshInterval: event.target.value })}
          >
            {refreshIntervalOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SettingsSelectField>
          <SettingsSelectField
            id="general-export-format"
            label="Default Export Format"
            value={exportFormat}
            onChange={(event) =>
              updateGeneral({
                defaultExportFormat: event.target.value as ExportFormatOption,
              })
            }
          >
            {exportFormatOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SettingsSelectField>
        </div>
        <SettingsToggleRow
          label="Maintenance Mode"
          description="Enable or disable system maintenance mode"
          checked={value.generalSettings.maintenanceMode}
          boxed
          showCaption={false}
          onChange={(checked) => {
            if (checked) {
              setScheduleOpen(true)
              return
            }
            updateGeneral({
              maintenanceMode: false,
              maintenanceStartAt: null,
              maintenanceEndAt: null,
            })
            toast.success('Maintenance mode disabled (save to apply)')
          }}
        />
        {value.generalSettings.maintenanceMode || value.generalSettings.maintenanceStartAt ? (
          <div className="settings-maintenance-info">
            <p>
              Window:{' '}
              {value.generalSettings.maintenanceStartAt
                ? new Date(value.generalSettings.maintenanceStartAt).toLocaleString()
                : '—'}{' '}
              →{' '}
              {value.generalSettings.maintenanceEndAt
                ? new Date(value.generalSettings.maintenanceEndAt).toLocaleString()
                : '—'}
            </p>
            {value.generalSettings.adminNotes ? (
              <p className="mt-1">Notes: {value.generalSettings.adminNotes}</p>
            ) : null}
            <button
              type="button"
              className="text-brand-accent mt-2 underline"
              onClick={() => setScheduleOpen(true)}
            >
              Edit schedule
            </button>
          </div>
        ) : null}
        <SettingsStackedField label="Custom Error Messages">
          <div className="settings-error-message-row">
            <textarea
              className="settings-error-message-field"
              value={value.generalSettings.customErrorMessage}
              onChange={(event) => updateGeneral({ customErrorMessage: event.target.value })}
            />
            <Button
              variant="primary"
              className="settings-choose-template-btn"
              onClick={() => {
                void ensureTemplatesLoaded()
                setErrorTemplateOpen(true)
              }}
            >
              {templatesQuery.isLoading ? 'Loading…' : 'Choose Template'}
            </Button>
          </div>
        </SettingsStackedField>
        <div className="settings-fields-grid">
          <SettingsInputField
            id="general-support-email"
            label="Support Email"
            value={value.generalSettings.supportEmail}
            onChange={(event) => updateGeneral({ supportEmail: event.target.value })}
          />
          <SettingsInputField
            id="general-support-phone"
            label="Support Phone Number"
            value={value.generalSettings.supportPhone}
            onChange={(event) => updateGeneral({ supportPhone: event.target.value })}
          />
        </div>
        <div className="settings-policy-section">
          <p className="settings-field-label">Policy Management</p>
          <div className="settings-policy-grid">
            <div className="settings-policy-block">
              <span className="settings-policy-label">User Application Policy</span>
              <Button
                variant="primary"
                className="settings-policy-view-btn"
                onClick={() => navigate('/settings/policies?application=user')}
              >
                View
              </Button>
            </div>
            <div className="settings-policy-block">
              <span className="settings-policy-label">Expert Application Policy</span>
              <Button
                variant="primary"
                className="settings-policy-view-btn"
                onClick={() => navigate('/settings/policies?application=expert')}
              >
                View
              </Button>
            </div>
          </div>
        </div>
      </SettingsSectionCard>

      <ChooseErrorTemplateModal
        open={errorTemplateOpen}
        currentMessage={value.generalSettings.customErrorMessage}
        templates={value.generalSettings.errorTemplates ?? []}
        onClose={() => setErrorTemplateOpen(false)}
        onApply={(message) => {
          updateGeneral({ customErrorMessage: message })
          setErrorTemplateOpen(false)
        }}
        onCreateTemplate={async (message) => {
          const templates = await createTemplateMutation.mutateAsync(message)
          updateGeneral({ errorTemplates: templates })
          return templates
        }}
        onUpdateTemplate={async (index, message) => {
          const templates = await updateTemplateMutation.mutateAsync({ index, message })
          const nextMessage =
            value.generalSettings.customErrorMessage === value.generalSettings.errorTemplates[index]
              ? message
              : value.generalSettings.customErrorMessage
          updateGeneral({ errorTemplates: templates, customErrorMessage: nextMessage })
          return templates
        }}
        onDeleteTemplate={async (index) => {
          const removed = value.generalSettings.errorTemplates[index]
          const templates = await deleteTemplateMutation.mutateAsync(index)
          const nextMessage =
            value.generalSettings.customErrorMessage === removed
              ? templates[0] || value.generalSettings.customErrorMessage
              : value.generalSettings.customErrorMessage
          updateGeneral({ errorTemplates: templates, customErrorMessage: nextMessage })
          return templates
        }}
        onTemplatesChange={(templates) => updateGeneral({ errorTemplates: templates })}
      />

      <ScheduleMaintenanceModal
        open={scheduleOpen}
        initialStartAt={value.generalSettings.maintenanceStartAt}
        initialEndAt={value.generalSettings.maintenanceEndAt}
        onClose={() => {
          setScheduleOpen(false)
          setPendingSchedule(null)
        }}
        onSubmit={({ startAt, endAt }) => {
          setPendingSchedule({ startAt, endAt })
          setScheduleOpen(false)
          setNotesOpen(true)
        }}
      />

      <AdminNotesModal
        open={notesOpen}
        initialNotes={value.generalSettings.adminNotes}
        onClose={() => {
          setNotesOpen(false)
          setPendingSchedule(null)
        }}
        onSubmit={(notes) => {
          updateGeneral({
            maintenanceMode: true,
            maintenanceStartAt:
              pendingSchedule?.startAt || value.generalSettings.maintenanceStartAt,
            maintenanceEndAt: pendingSchedule?.endAt || value.generalSettings.maintenanceEndAt,
            adminNotes: notes,
          })
          setNotesOpen(false)
          setPendingSchedule(null)
          toast.success('Maintenance schedule ready — click Save to apply')
        }}
      />
    </div>
  )
}
