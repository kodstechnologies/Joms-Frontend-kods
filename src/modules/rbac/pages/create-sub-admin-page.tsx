import { ArrowLeft, AlertTriangle, Check, ChevronDown, Info, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  useCreateSubAdmin,
  usePermissionCatalog,
  useRoles,
  useSubAdmin,
  useUpdateSubAdmin,
} from '../hooks/use-rbac'
import { RbacLoader } from '../components/rbac-loader'
import type { CreateSubAdminPayload, PermissionCatalog, Role } from '../types/rbac'
import { requiredLabel } from '@/shared/components/form/required-label'
import { RequiredMark } from '@/shared/components/form/required-mark'
import { Button } from '@/shared/components/ui/button'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { Input } from '@/shared/components/ui/input'
import { useSecurityPolicy } from '@/modules/settings/hooks/use-security-policy'
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

type Step = 'form' | 'review'

const EMPLOYMENT_TYPE_OPTIONS = ['Onsite', 'Remote', 'Hybrid'] as const

const withCurrentOption = (options: readonly string[], current?: string) =>
  current && !options.includes(current) ? [current, ...options] : [...options]

const emptyForm: CreateSubAdminPayload = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  department: '',
  jobTitle: '',
  employeeId: '',
  employmentType: '',
  workplaceFlexibility: '',
  location: '',
  mfaEnabled: false,
  roleIds: [],
}

type ModuleAccess = 'full' | 'limited' | 'none'

const getModuleAccess = (
  role: Role,
  moduleKey: string,
  catalog: PermissionCatalog,
): ModuleAccess => {
  const mod = catalog[moduleKey]
  if (!mod?.permissions.length) return 'none'

  const keys = mod.permissions.map((p) => p.key)
  const granted = keys.filter((k) => role.permissions.includes(k))
  if (!granted.length) return 'none'
  if (granted.length === keys.length) return 'full'
  return 'limited'
}

const accessLabel = (access: ModuleAccess) => {
  if (access === 'full') return 'Full Access'
  if (access === 'limited') return 'Limited Access'
  return 'No Access'
}

export function CreateSubAdminPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit') || ''
  const isEditMode = Boolean(editId)

  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState<CreateSubAdminPayload>(emptyForm)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [roleSearch, setRoleSearch] = useState('')
  const [roleListOpen, setRoleListOpen] = useState(true)
  const [permissionViewRole, setPermissionViewRole] = useState<Role | null>(null)
  const [formHydrated, setFormHydrated] = useState(false)
  const [hydratedEditKey, setHydratedEditKey] = useState(`${editId}:${isEditMode}`)

  const { data: subAdminData, isLoading: subAdminLoading } = useSubAdmin(editId)
  const { data: rolesData, isLoading: rolesLoading } = useRoles({
    page: 1,
    limit: 100,
    status: 'active',
  })
  const hasSelectedRoles = form.roleIds.length > 0
  const { data: catalogData, isLoading: catalogLoading } = usePermissionCatalog({
    enabled: hasSelectedRoles || Boolean(permissionViewRole),
  })
  const createMutation = useCreateSubAdmin()
  const updateMutation = useUpdateSubAdmin()
  const { mfa: mfaPolicy } = useSecurityPolicy()
  const mfaForcedByPolicy = mfaPolicy.requireForAllSubAdmins
  const effectiveMfaEnabled = mfaForcedByPolicy || form.mfaEnabled

  const editKey = `${editId}:${isEditMode}`
  if (editKey !== hydratedEditKey) {
    setHydratedEditKey(editKey)
    setFormHydrated(false)
    if (!isEditMode) {
      setForm(emptyForm)
      setStep('form')
      setAdminNote('')
    }
  }

  if (isEditMode && subAdminData?.data && !formHydrated) {
    const subAdmin = subAdminData.data
    setForm({
      firstName: subAdmin.firstName || '',
      lastName: subAdmin.lastName || '',
      email: subAdmin.email || '',
      password: '',
      department: subAdmin.department || '',
      jobTitle: subAdmin.jobTitle || '',
      employeeId: subAdmin.employeeId || '',
      employmentType: subAdmin.employmentType || '',
      workplaceFlexibility: subAdmin.workplaceFlexibility || '',
      location: subAdmin.location || '',
      mfaEnabled: Boolean(subAdmin.mfaEnabled),
      roleIds:
        subAdmin.roleIds?.length > 0
          ? subAdmin.roleIds
          : subAdmin.roles?.map((role) => role.id) || [],
    })
    setRoleListOpen(false)
    setFormHydrated(true)
  }

  const roles = useMemo(() => rolesData?.data ?? [], [rolesData?.data])
  const catalog = useMemo(() => catalogData?.data ?? {}, [catalogData?.data])

  const selectedRoles = useMemo(
    () => roles.filter((role) => form.roleIds.includes(role.id)),
    [form.roleIds, roles],
  )

  const filteredRoles = useMemo(() => {
    const query = roleSearch.trim().toLowerCase()
    if (!query) return roles
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query) ||
        role.roleCode.toLowerCase().includes(query),
    )
  }, [roleSearch, roles])

  const moduleKeys = useMemo(() => Object.keys(catalog), [catalog])

  const updateField = <K extends keyof CreateSubAdminPayload>(
    key: K,
    value: CreateSubAdminPayload[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const toggleRole = (role: Role) => {
    const isSelected = form.roleIds.includes(role.id)
    setForm((current) => ({
      ...current,
      roleIds: isSelected
        ? current.roleIds.filter((id) => id !== role.id)
        : [...current.roleIds, role.id],
    }))
    if (!isSelected) {
      setRoleListOpen(false)
    }
  }

  const removeRole = (roleId: string) => {
    setForm((current) => {
      const nextRoleIds = current.roleIds.filter((id) => id !== roleId)
      if (!nextRoleIds.length) {
        setRoleListOpen(true)
      }
      return { ...current, roleIds: nextRoleIds }
    })
  }

  const validateForm = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('First name, last name and email are required')
      return false
    }
    if (!form.roleIds.length) {
      toast.error('Select at least one role')
      return false
    }
    return true
  }

  const goToReview = () => {
    if (!validateForm()) return
    setStep('review')
  }

  const handleCreate = async () => {
    try {
      const result = await createMutation.mutateAsync({
        ...form,
        mfaEnabled: effectiveMfaEnabled,
        adminNote,
      })
      setConfirmOpen(false)
      toast.success(
        result?.data?.notificationSent
          ? 'User created. Login credentials have been emailed to the user.'
          : 'User created successfully.',
      )
      navigate('/settings/access')
    } catch {
      toast.error('Failed to create sub-admin')
    }
  }

  const handleUpdate = async () => {
    if (!editId) return

    try {
      const {
        firstName,
        lastName,
        department,
        jobTitle,
        employeeId,
        employmentType,
        workplaceFlexibility,
        location,
        roleIds,
      } = form
      await updateMutation.mutateAsync({
        id: editId,
        payload: {
          firstName,
          lastName,
          department,
          jobTitle,
          employeeId,
          employmentType,
          workplaceFlexibility,
          location,
          mfaEnabled: effectiveMfaEnabled,
          roleIds,
        },
      })
      setConfirmOpen(false)
      toast.success('User updated successfully. Role and permissions are now in effect.')
      navigate('/settings/access')
    } catch {
      toast.error('Failed to update user')
    }
  }

  const handleSubmit = () => {
    if (!isEditMode && !adminNote.trim()) {
      toast.error('Admin notes are required')
      return
    }
    if (isEditMode) {
      void handleUpdate()
      return
    }
    void handleCreate()
  }

  if (isEditMode && (subAdminLoading || !formHydrated)) {
    return <RbacLoader label="Loading user details..." className="min-h-[320px]" />
  }

  const pageTitle = isEditMode ? 'Edit User' : 'Create New User'
  const pageSubtitle = isEditMode
    ? 'Role Based Access / Edit User'
    : 'Role Based Access / Create New User'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
          className="group font-heading text-h3 text-brand-text hover:text-brand-accent flex w-fit items-center gap-2 font-bold tracking-tight transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>{pageTitle}</span>
        </button>
        <p className="text-brand-muted pl-7 text-sm">{pageSubtitle}</p>
      </div>

      {step === 'form' ? (
        <>
          <div className="create-user-details-card">
            <h2 className="create-user-details-title">User Details</h2>
            <p className="create-user-details-subtitle">
              {isEditMode
                ? "Update this admin user's details and assigned roles."
                : "Enter the admin user's basic information to get started."}
            </p>
            <div className="create-user-details-grid">
              {(
                [
                  ['firstName', 'First Name *', 'Full Name'],
                  ['lastName', 'Last Name *', 'Full Name'],
                  ['email', 'Email Address *', 'Enter email address here'],
                  ['department', 'Department *', 'Enter department'],
                  ['jobTitle', 'Job Title *', 'Enter job title'],
                ] as const
              ).map(([key, label, placeholder]) => (
                <div key={key} className="create-user-field">
                  <label className="create-user-field-label">{requiredLabel(label)}</label>
                  <Input
                    className="create-user-field-control"
                    value={form[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    placeholder={placeholder}
                    disabled={isEditMode && key === 'email'}
                  />
                </div>
              ))}

              <div className="create-user-field">
                <label className="create-user-field-label">Employee ID</label>
                <Input
                  className="create-user-field-control"
                  value={form.employeeId}
                  onChange={(e) => updateField('employeeId', e.target.value)}
                  placeholder="Enter employee ID"
                />
              </div>

              <div className="create-user-field">
                <label className="create-user-field-label">
                  {requiredLabel('Employment type *')}
                </label>
                <div className="create-user-select-wrap">
                  <select
                    value={form.employmentType}
                    onChange={(e) => updateField('employmentType', e.target.value)}
                    className={cn(
                      'create-user-field-control create-user-select',
                      !form.employmentType && 'is-placeholder',
                    )}
                  >
                    <option value="">Select employment type</option>
                    {withCurrentOption(EMPLOYMENT_TYPE_OPTIONS, form.employmentType).map(
                      (option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ),
                    )}
                  </select>
                  <ChevronDown className="create-user-select-icon" aria-hidden="true" />
                </div>
              </div>

              <div className="create-user-field">
                <label className="create-user-field-label">
                  {requiredLabel('Workplace flexibility *')}
                </label>
                <Input
                  className="create-user-field-control"
                  value={form.workplaceFlexibility}
                  onChange={(e) => updateField('workplaceFlexibility', e.target.value)}
                  placeholder="Enter location"
                />
              </div>

              <div className="create-user-field">
                <label className="create-user-field-label">{requiredLabel('Location *')}</label>
                <Input
                  className="create-user-field-control"
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Enter location"
                />
              </div>

              <div className="create-user-mfa-row">
                <div className="min-w-0">
                  <p className="create-user-field-label">2 Factor Authentication</p>
                  <p className="create-user-mfa-desc">
                    {mfaForcedByPolicy
                      ? 'Required for all sub-admins by organization MFA policy'
                      : 'Every time the user try to login they need verify via 2FA'}
                  </p>
                </div>
                <button
                  type="button"
                  aria-pressed={effectiveMfaEnabled}
                  aria-label="Toggle two-factor authentication"
                  disabled={mfaForcedByPolicy}
                  onClick={() => {
                    if (mfaForcedByPolicy) return
                    updateField('mfaEnabled', !form.mfaEnabled)
                  }}
                  className={cn(
                    'create-user-mfa-toggle',
                    effectiveMfaEnabled && 'is-on',
                    mfaForcedByPolicy && 'is-disabled',
                  )}
                >
                  <span className="create-user-mfa-knob" />
                </button>
              </div>
            </div>
          </div>

          <div className="create-user-assign-card">
            <h2 className="create-user-assign-title">
              {isEditMode ? 'Role & Permissions' : 'Assign Role'}
            </h2>
            <p className="create-user-assign-subtitle">
              {isEditMode
                ? 'Change the role to update this user’s permissions and access level.'
                : "Select a role to define the admin user's permissions and access level."}
            </p>

            <div className="create-user-assign-body">
              <div className="create-user-field">
                <label className="create-user-field-label">
                  Choose Role <RequiredMark />
                </label>
                <div
                  className={cn('create-user-role-select', roleListOpen && 'is-open')}
                  onClick={() => setRoleListOpen(true)}
                >
                  {selectedRoles.map((role) => (
                    <span key={role.id} className="create-user-role-chip">
                      {role.name}
                      <button
                        type="button"
                        aria-label={`Remove ${role.name}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          removeRole(role.id)
                        }}
                        className="create-user-role-chip-remove"
                      >
                        <X className="size-3" strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                  <input
                    value={roleSearch}
                    onChange={(e) => {
                      setRoleSearch(e.target.value)
                      setRoleListOpen(true)
                    }}
                    onFocus={() => setRoleListOpen(true)}
                    placeholder={selectedRoles.length ? '' : 'Search role here'}
                    className="create-user-role-search"
                  />
                  <button
                    type="button"
                    aria-label="Toggle role list"
                    onClick={(e) => {
                      e.stopPropagation()
                      setRoleListOpen((open) => !open)
                    }}
                    className="create-user-role-chevron"
                  >
                    <ChevronDown
                      className={cn('size-4 transition-transform', roleListOpen && 'rotate-180')}
                    />
                  </button>
                </div>
              </div>

              {roleListOpen ? (
                <div className="create-user-role-list">
                  {rolesLoading ? (
                    <RbacLoader label="Loading roles..." className="min-h-[120px]" />
                  ) : filteredRoles.length ? (
                    filteredRoles.map((role) => {
                      const checked = form.roleIds.includes(role.id)
                      return (
                        <div key={role.id} className="create-user-role-list-item">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleRole(role)}
                              className="mt-1 accent-white"
                            />
                            <div>
                              <p className="text-brand-text font-medium">{role.name}</p>
                              <p className="text-brand-muted text-sm">{role.description}</p>
                            </div>
                          </label>
                          <button
                            type="button"
                            className="create-user-view-permission"
                            onClick={() => setPermissionViewRole(role)}
                          >
                            View Permission
                          </button>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-brand-muted px-2 py-3 text-sm">
                      {roles.length
                        ? 'No role matches your search.'
                        : 'No active roles found. Create a role first from Admin Roles.'}
                    </p>
                  )}
                </div>
              ) : null}

              {selectedRoles.length > 0 ? (
                catalogLoading ? (
                  <RbacLoader label="Loading permissions..." className="min-h-[120px]" />
                ) : (
                  <div className="create-user-permission-stack">
                    {selectedRoles.map((role) => (
                      <div key={role.id} className="create-user-permission-card">
                        <p className="create-user-permission-role">{role.name}</p>
                        <p className="create-user-permission-heading">Key Permissions</p>
                        <div className="create-user-permission-rows">
                          {moduleKeys.length ? (
                            moduleKeys.map((moduleKey) => {
                              const access = getModuleAccess(role, moduleKey, catalog)
                              if (access === 'none') return null
                              const mod = catalog[moduleKey]
                              return (
                                <div key={moduleKey} className="create-user-permission-row">
                                  <div className="create-user-permission-name">
                                    <Check
                                      className="size-3.5 shrink-0 text-white"
                                      strokeWidth={2.5}
                                    />
                                    <span>{mod?.label ?? moduleKey}</span>
                                    <span className="create-user-access-badge">
                                      {accessLabel(access)}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    className="create-user-view-permission"
                                    onClick={() => setPermissionViewRole(role)}
                                  >
                                    View Permission
                                  </button>
                                </div>
                              )
                            })
                          ) : (
                            <p className="text-brand-muted text-sm">
                              No permission modules available for this role.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      {step === 'review' ? (
        <>
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-brand-text text-lg font-semibold">Review</h2>
              <p className="text-brand-muted mt-1 text-sm">
                Review the details before assigning the role to the admin user.
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-[10px] border border-[#E0A263]/40 bg-[#E0A263]/12 px-4 py-3 text-sm text-[#E0A263]">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                <span className="font-semibold">Warning:</span> Assigned permissions will apply
                immediately after role assignment.
              </p>
            </div>
          </div>

          <div className="rounded-brand-lg border border-white/10 bg-[#141414] p-5 md:p-6">
            <h3 className="text-brand-text text-lg font-semibold">Summary</h3>
            <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-5">
                {[
                  ['First Name', form.firstName],
                  ['Last Name', form.lastName],
                  ['Email ID', form.email],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-white/50">{label}</p>
                    <p className="text-brand-text mt-1 text-sm font-medium">{value || '—'}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs text-white/50">Role Assigned</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedRoles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center rounded-full bg-[#E0A263] px-2.5 py-1 text-xs font-semibold text-[#050505]"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  ['Department', form.department],
                  ['Job Title', form.jobTitle],
                  ['Employee ID', form.employeeId],
                  ['Employment type', form.employmentType],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-white/50">{label}</p>
                    <p className="text-brand-text mt-1 text-sm font-medium">{value || '—'}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-5">
                {[
                  ['Location', form.location],
                  ['2FA Status', effectiveMfaEnabled ? 'Enabled' : 'Disabled'],
                  ['Workplace', form.workplaceFlexibility],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-white/50">{label}</p>
                    <p className="text-brand-text mt-1 text-sm font-medium">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-brand-lg border border-[#E0A263]/30 bg-[#E0A263]/10 px-5 py-6 md:px-6 md:py-8">
            <div className="flex items-center gap-2">
              <Info className="size-5 shrink-0 text-white" aria-hidden="true" />
              <h3 className="text-brand-text font-semibold">What happens next?</h3>
            </div>
            <ul className="mt-4 list-disc space-y-3 pl-7 text-sm text-white/50">
              {isEditMode ? (
                <>
                  <li>User profile and role assignment will be updated immediately</li>
                  <li>Updated permissions will apply on the user's next session refresh</li>
                  <li>All actions will be logged in audit logs</li>
                </>
              ) : (
                <>
                  <li>Admin user will be created with the assigned role</li>
                  <li>System notification email will be sent</li>
                  <li>All actions will be logged in audit logs</li>
                  <li>User can use their credentials to log in & create account</li>
                </>
              )}
            </ul>
          </div>
        </>
      ) : null}

      <div className="create-user-footer">
        <Button
          variant="secondary"
          className="create-user-footer-prev"
          onClick={() => {
            if (step === 'form') navigateBackOrFallback(navigate, '/settings/access')
            else setStep('form')
          }}
        >
          Previous
        </Button>
        {step === 'form' ? (
          <Button className="create-user-footer-primary" onClick={goToReview}>
            {isEditMode ? 'Review Changes' : 'Invite New User'}
          </Button>
        ) : (
          <Button className="create-user-footer-primary" onClick={() => setConfirmOpen(true)}>
            {isEditMode ? 'Update User' : 'Continue'}
          </Button>
        )}
      </div>

      {permissionViewRole ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            className={cn(
              'bg-brand-surface w-full max-w-lg border border-white/10 p-6',
              uiTokens.radiusCard,
              uiTokens.shadowElevated,
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-brand-text text-lg font-semibold">
                {permissionViewRole.name} Permissions
              </h3>
              <button
                type="button"
                onClick={() => setPermissionViewRole(null)}
                className="text-brand-muted hover:text-brand-text rounded-full p-1 hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 max-h-72 space-y-3 overflow-auto">
              {permissionViewRole.permissions.length ? (
                Object.entries(catalog).map(([moduleKey, mod]) => {
                  const rolePerms = mod.permissions.filter((p) =>
                    permissionViewRole.permissions.includes(p.key),
                  )
                  if (!rolePerms.length) return null
                  return (
                    <div
                      key={moduleKey}
                      className="rounded-brand-md overflow-hidden border border-white/10"
                    >
                      <p className="text-brand-text border-b border-white/10 bg-white/5 px-3 py-2 text-sm font-medium">
                        {mod.label}
                      </p>
                      <div className="divide-y divide-white/5">
                        {rolePerms.map((permission) => (
                          <div
                            key={permission.key}
                            className="text-brand-text flex items-center justify-between gap-2 px-3 py-2 text-sm"
                          >
                            <span>{permission.label}</span>
                            {permission.risk === 'high' ? (
                              <span className="bg-brand-danger/20 text-brand-danger rounded px-2 py-0.5 text-xs">
                                High Risk
                              </span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-brand-muted text-sm">No permissions assigned to this role.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {confirmOpen ? (
        <div
          className="ui-modal-backdrop"
          role="presentation"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-user-modal-title"
            className="ui-modal-shell new-user-confirm-modal w-full max-w-[551px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ui-modal-header">
              <h2 id="confirm-user-modal-title" className="new-user-confirm-title">
                {isEditMode ? 'Update User' : 'New User'}
              </h2>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setConfirmOpen(false)}
                className="new-user-confirm-close"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="ui-modal-body new-user-confirm-body">
              <div className="new-user-confirm-icon-wrap">
                <span className="new-user-confirm-icon-circle">
                  <AlertTriangle
                    className="size-7 text-[#E0A263]"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
              </div>
              <p className="new-user-confirm-message">
                {isEditMode ? (
                  <>
                    Are you sure you want to update '{form.firstName} {form.lastName}' with role '
                    {selectedRoles.map((r) => r.name).join(', ') || 'roles'}'? Their permissions
                    will change immediately.
                  </>
                ) : (
                  <>
                    Are you sure you want to assign '
                    {selectedRoles.map((r) => r.name).join(', ') || 'roles'}' role to '
                    {form.firstName} {form.lastName}'. They will immediately get to access the
                    system.
                  </>
                )}
              </p>
              {!isEditMode ? (
                <div className="new-user-confirm-notes">
                  <label htmlFor="admin-notes" className="new-user-confirm-notes-label">
                    Admin notes <span className="new-user-confirm-required">*</span>
                  </label>
                  <textarea
                    id="admin-notes"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={4}
                    placeholder="Add admin notes"
                    className="new-user-confirm-textarea"
                  />
                </div>
              ) : null}
            </div>
            <div className="ui-modal-footer new-user-confirm-footer">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="ui-modal-btn new-user-confirm-cancel h-10 max-w-[239px] flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="ui-modal-btn new-user-confirm-submit h-10 max-w-[238px] flex-1"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
