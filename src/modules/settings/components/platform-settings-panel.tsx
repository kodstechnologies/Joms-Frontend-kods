import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloudUpload } from 'lucide-react'
import { toast } from 'sonner'

import { AdminNotesModal } from './admin-notes-modal'
import { ChooseErrorTemplateModal } from './choose-error-template-modal'
import { ScheduleMaintenanceModal } from './schedule-maintenance-modal'
import { SettingsFieldRow, settingsControlClass } from './settings-field-row'
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
  currencyOptions,
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
import { cn } from '@/shared/lib/cn'

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
    if (!file) return
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
      <p className="text-xs font-medium text-slate-300">{label}</p>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex h-[72px] w-[72px] flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-dashed border-white/20 bg-[#0E0E0E] text-slate-300 transition-colors hover:border-white/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-60',
        )}
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
            <span className="text-[10px]">{uploading ? 'Uploading…' : 'Upload'}</span>
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
      displayPreferences: { ...value.displayPreferences, ...patch },
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
        <SettingsFieldRow label="Application Name">
          <input
            className={settingsControlClass}
            value={value.applicationSettings.applicationName ?? 'Web admin Panel'}
            onChange={(event) => updateApplication({ applicationName: event.target.value })}
          />
        </SettingsFieldRow>
        <div className="grid gap-4 pt-2 sm:grid-cols-2">
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
        <SettingsFieldRow label="Timezone">
          <select
            className={settingsControlClass}
            value={value.displayPreferences.timezone || 'IST, +5:30, Kolkata, India'}
            onChange={(event) => updateDisplay({ timezone: event.target.value })}
          >
            {timezoneOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Date & Time Format">
          <select
            className={settingsControlClass}
            value={value.displayPreferences.dateTimeFormat || 'DD/MM/YY'}
            onChange={(event) => updateDisplay({ dateTimeFormat: event.target.value })}
          >
            {dateFormatOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Default Currency">
          <select
            className={settingsControlClass}
            value={value.displayPreferences.defaultCurrency || '$ USD'}
            onChange={(event) => updateDisplay({ defaultCurrency: event.target.value })}
          >
            {currencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Language Settings">
          <select
            className={settingsControlClass}
            value={value.displayPreferences.language || 'English'}
            onChange={(event) => updateDisplay({ language: event.target.value })}
          >
            {languageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="General Settings"
        description="Configure system behavior and maintenance options"
      >
        <SettingsFieldRow label="Auto-Refresh Interval">
          <select
            className={settingsControlClass}
            value={value.generalSettings.autoRefreshInterval}
            onChange={(event) => updateGeneral({ autoRefreshInterval: event.target.value })}
          >
            {refreshIntervalOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Default Export Format">
          <select
            className={settingsControlClass}
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
          </select>
        </SettingsFieldRow>
        <SettingsToggleRow
          label="Maintenance Mode"
          description="When enabled, admin login and APIs are blocked for all users"
          checked={value.generalSettings.maintenanceMode}
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
          className="rounded-lg border border-white/10 bg-[#0D0D0D] px-3"
        />
        {value.generalSettings.maintenanceMode || value.generalSettings.maintenanceStartAt ? (
          <div className="rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-3 text-xs text-slate-400">
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
        <SettingsFieldRow label="Custom Error Messages">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
            <textarea
              className="bg-brand-surface min-h-[88px] w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-white/20"
              value={value.generalSettings.customErrorMessage}
              onChange={(event) => updateGeneral({ customErrorMessage: event.target.value })}
            />
            <Button
              variant="secondary"
              className="h-10 shrink-0"
              onClick={() => {
                void ensureTemplatesLoaded()
                setErrorTemplateOpen(true)
              }}
            >
              {templatesQuery.isLoading ? 'Loading…' : 'Choose Template'}
            </Button>
          </div>
        </SettingsFieldRow>
        <SettingsFieldRow label="Support Email">
          <input
            className={settingsControlClass}
            value={value.generalSettings.supportEmail}
            onChange={(event) => updateGeneral({ supportEmail: event.target.value })}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Support Phone Number">
          <input
            className={settingsControlClass}
            value={value.generalSettings.supportPhone}
            onChange={(event) => updateGeneral({ supportPhone: event.target.value })}
          />
        </SettingsFieldRow>
        <div className="space-y-3 border-t border-white/5 pt-4">
          <p className="text-sm font-medium text-white">Policy Management</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                label: 'User Application Policy',
                to: '/settings/policies?application=user',
                disabled: true,
              },
              {
                label: 'Expert Application Policy',
                to: '/settings/policies?application=expert',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-[#141414] px-4 py-3"
              >
                <span className="text-sm text-slate-300">{item.label}</span>
                <Button
                  variant="secondary"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) {
                      toast.message('User application policies are not enabled yet')
                      return
                    }
                    navigate(item.to)
                  }}
                >
                  View
                </Button>
              </div>
            ))}
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
