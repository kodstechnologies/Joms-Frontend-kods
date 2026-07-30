import { ArrowLeft, AlertTriangle, Check, ChevronDown, Search, X } from 'lucide-react'
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
import { cn } from '@/shared/lib/cn'
import { uiTokens } from '@/shared/lib/design-tokens'

type Step = 'form' | 'review'

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
  const [confirmPassword, setConfirmPassword] = useState('')
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

  const editKey = `${editId}:${isEditMode}`
  if (editKey !== hydratedEditKey) {
    setHydratedEditKey(editKey)
    setFormHydrated(false)
    if (!isEditMode) {
      setForm(emptyForm)
      setConfirmPassword('')
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
    if (!isEditMode) {
      if (!form.password || form.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return false
      }
      if (form.password !== confirmPassword) {
        toast.error('Passwords do not match')
        return false
      }
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
      await createMutation.mutateAsync({ ...form, adminNote })
      setConfirmOpen(false)
      toast.success('Sub-admin created. They can log in with the email and password you set.')
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
        mfaEnabled,
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
          mfaEnabled,
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
          <div className="rounded-brand-lg bg-brand-surface border border-white/10 p-5 md:p-6">
            <h2 className="text-brand-text text-lg font-semibold">User Details</h2>
            <p className="text-brand-muted mt-1 text-sm">
              {isEditMode
                ? 'Update this admin user’s details and assigned roles.'
                : 'Enter the admin user&apos;s basic information to get started.'}
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ['firstName', 'First Name *', 'Full Name'],
                ['lastName', 'Last Name *', 'Full Name'],
                ['email', 'Email Address *', 'Enter email address here'],
                ['department', 'Department *', 'Department'],
                ['jobTitle', 'Job Title *', 'Job Title'],
                ['employeeId', 'Employee ID', 'JOMS_001'],
                ['employmentType', 'Employment type *', 'Onsite / Remote'],
                ['workplaceFlexibility', 'Workplace flexibility *', 'Onsite'],
                ['location', 'Location *', 'Enter location'],
              ].map(([key, label, placeholder]) => (
                <div key={key} className="space-y-2">
                  <label className="text-brand-text text-sm font-medium">
                    {requiredLabel(label)}
                  </label>
                  <Input
                    value={String(form[key as keyof CreateSubAdminPayload] ?? '')}
                    onChange={(e) =>
                      updateField(key as keyof CreateSubAdminPayload, e.target.value)
                    }
                    placeholder={placeholder}
                    disabled={isEditMode && key === 'email'}
                  />
                </div>
              ))}
              {!isEditMode ? (
                <>
                  <div className="space-y-2">
                    <label className="text-brand-text text-sm font-medium">
                      Password <RequiredMark />
                    </label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Set login password (min 6 characters)"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-brand-text text-sm font-medium">
                      Confirm Password <RequiredMark />
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                    />
                  </div>
                </>
              ) : null}
              <div className="rounded-brand-md flex items-center justify-between border border-white/10 px-4 py-3 md:col-span-2">
                <div>
                  <p className="text-brand-text text-sm font-medium">2 Factor Authentication</p>
                  <p className="text-brand-muted text-xs">
                    Every time the user tries to login they need verify via 2FA
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('mfaEnabled', !form.mfaEnabled)}
                  className={cn(
                    'relative h-7 w-12 rounded-full transition-colors',
                    form.mfaEnabled ? 'bg-brand-accent' : 'bg-white/20',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 size-6 rounded-full bg-white transition-transform',
                      form.mfaEnabled ? 'left-5' : 'left-0.5',
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-brand-lg bg-brand-surface border border-white/10 p-5 md:p-6">
            <h2 className="text-brand-text text-lg font-semibold">
              {isEditMode ? 'Role & Permissions' : 'Assign Role'}
            </h2>
            <p className="text-brand-muted mt-1 text-sm">
              {isEditMode
                ? 'Change the role to update this user’s permissions and access level.'
                : 'Select a role to define the admin user&apos;s permissions and access level.'}
            </p>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-brand-text text-sm font-medium">
                  Choose Role <RequiredMark />
                </label>
                <div
                  className={cn(
                    'rounded-brand-md bg-brand-bg relative flex min-h-11 flex-wrap items-center gap-2 border border-white/10 px-3 py-2',
                    roleListOpen && 'ring-brand-accent/30 ring-2',
                  )}
                  onClick={() => setRoleListOpen(true)}
                >
                  <Search className="text-brand-muted size-4 shrink-0" />
                  {selectedRoles.map((role) => (
                    <span
                      key={role.id}
                      className="border-brand-accent/30 bg-brand-accent/15 text-brand-accent inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
                    >
                      {role.name}
                      <button
                        type="button"
                        aria-label={`Remove ${role.name}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          removeRole(role.id)
                        }}
                        className="hover:bg-brand-accent/20 rounded-full p-0.5"
                      >
                        <X className="size-3" />
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
                    className="text-brand-text placeholder:text-brand-muted min-w-[120px] flex-1 bg-transparent text-sm outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Toggle role list"
                    onClick={(e) => {
                      e.stopPropagation()
                      setRoleListOpen((open) => !open)
                    }}
                    className="text-brand-muted hover:text-brand-text ml-auto shrink-0 rounded p-1"
                  >
                    <ChevronDown
                      className={cn('size-4 transition-transform', roleListOpen && 'rotate-180')}
                    />
                  </button>
                </div>
              </div>

              {roleListOpen ? (
                <div className="rounded-brand-md max-h-72 space-y-3 overflow-auto border border-white/10 p-2">
                  {rolesLoading ? (
                    <RbacLoader label="Loading roles..." className="min-h-[120px]" />
                  ) : filteredRoles.length ? (
                    filteredRoles.map((role) => {
                      const checked = form.roleIds.includes(role.id)
                      return (
                        <div
                          key={role.id}
                          className="rounded-brand-md flex items-start justify-between gap-4 border border-white/10 px-4 py-3"
                        >
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
                            className="text-brand-text decoration-brand-muted/40 hover:text-brand-accent text-sm underline underline-offset-2"
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
                  <div className="grid gap-4 lg:grid-cols-2">
                    {selectedRoles.map((role) => (
                      <div
                        key={role.id}
                        className="rounded-brand-md border-brand-accent/40 bg-brand-surface border p-4"
                      >
                        <p className="text-brand-text text-base font-semibold">{role.name}</p>
                        <p className="text-brand-muted mt-3 text-sm font-medium">Key Permissions</p>
                        <div className="mt-3 space-y-2">
                          {moduleKeys.length ? (
                            moduleKeys.map((moduleKey) => {
                              const access = getModuleAccess(role, moduleKey, catalog)
                              if (access === 'none') return null
                              const mod = catalog[moduleKey]
                              return (
                                <div
                                  key={moduleKey}
                                  className="flex items-center justify-between gap-2 text-sm"
                                >
                                  <div className="text-brand-text flex items-center gap-2">
                                    <Check className="text-brand-success size-3.5" />
                                    {mod?.label ?? moduleKey}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        'text-body-sm-semibold rounded-full px-2 py-0.5',
                                        access === 'full'
                                          ? 'bg-brand-accent/20 text-brand-accent'
                                          : 'text-brand-muted bg-white/10',
                                      )}
                                    >
                                      {accessLabel(access)}
                                    </span>
                                    <button
                                      type="button"
                                      className="text-brand-muted hover:text-brand-accent text-xs underline underline-offset-2"
                                      onClick={() => setPermissionViewRole(role)}
                                    >
                                      View Permission
                                    </button>
                                  </div>
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
          <div className="rounded-brand-lg border-brand-accent-muted bg-brand-accent/10 text-brand-text border px-4 py-3 text-sm">
            <span className="text-brand-accent font-semibold">Warning:</span> Assigned permissions
            will apply immediately after role assignment.
          </div>

          <div className="rounded-brand-lg bg-brand-surface border border-white/10 p-5 md:p-6">
            <h2 className="text-brand-text text-lg font-semibold">Review</h2>
            <p className="text-brand-muted mt-1 text-sm">
              Review the details before assigning the role to the admin user.
            </p>

            <div className="rounded-brand-md bg-brand-surface mt-5 grid gap-4 border border-white/10 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['First Name', form.firstName],
                ['Last Name', form.lastName],
                ['Email ID', form.email],
                ['Department', form.department || '—'],
                ['Job Title', form.jobTitle || '—'],
                ['Employee ID', form.employeeId || '—'],
                ['Employment type', form.employmentType || '—'],
                ['Location', form.location || '—'],
                ['2FA Status', form.mfaEnabled ? 'Enabled' : 'Disabled'],
                ['Workplace', form.workplaceFlexibility || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-brand-muted text-xs">{label}</p>
                  <p className="text-brand-text mt-1 text-sm font-medium">{value}</p>
                </div>
              ))}
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-brand-muted text-xs">Role Assigned</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedRoles.map((role) => (
                    <span
                      key={role.id}
                      className="bg-brand-accent/20 text-brand-accent rounded-full px-2.5 py-1 text-xs font-semibold"
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-brand-lg border-brand-accent-muted bg-brand-accent/10 border p-5">
            <h3 className="text-brand-text font-semibold">What happens next?</h3>
            <ul className="text-brand-muted mt-3 list-disc space-y-2 pl-5 text-sm">
              {isEditMode ? (
                <>
                  <li>User profile and role assignment will be updated immediately</li>
                  <li>Updated permissions will apply on the user&apos;s next session refresh</li>
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

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => {
            if (step === 'form') navigateBackOrFallback(navigate, '/settings/access')
            else setStep('form')
          }}
        >
          Previous
        </Button>
        {step === 'form' ? (
          <Button onClick={goToReview}>{isEditMode ? 'Review Changes' : 'Invite New User'}</Button>
        ) : (
          <Button onClick={() => setConfirmOpen(true)}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            className={cn(
              'bg-brand-surface w-full max-w-md border border-white/10 p-6',
              uiTokens.radiusCard,
              uiTokens.shadowElevated,
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-brand-text text-lg font-semibold">
                {isEditMode ? 'Update User' : 'New User'}
              </h3>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="text-brand-muted hover:text-brand-text rounded-full p-1 hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              <span className="bg-brand-accent/15 text-brand-accent flex size-14 items-center justify-center rounded-full">
                <AlertTriangle className="size-6" />
              </span>
            </div>
            <p className="text-brand-muted mt-4 text-center text-sm">
              {isEditMode ? (
                <>
                  Are you sure you want to update{' '}
                  <span className="text-brand-text font-semibold">
                    &apos;{form.firstName} {form.lastName}&apos;
                  </span>{' '}
                  with role{' '}
                  <span className="text-brand-text font-semibold">
                    &apos;{selectedRoles.map((r) => r.name).join(', ') || 'roles'}&apos;
                  </span>
                  ? Their permissions will change immediately.
                </>
              ) : (
                <>
                  Are you sure you want to assign{' '}
                  <span className="text-brand-text font-semibold">
                    &apos;{selectedRoles.map((r) => r.name).join(', ') || 'roles'}&apos;
                  </span>{' '}
                  role to{' '}
                  <span className="text-brand-text font-semibold">
                    &apos;{form.firstName} {form.lastName}&apos;
                  </span>
                  . They will immediately get access to the system.
                </>
              )}
            </p>
            {!isEditMode ? (
              <>
                <label className="text-brand-text mt-4 block text-sm font-medium">
                  Admin notes <RequiredMark />
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="Enter here.."
                  className="rounded-brand-md bg-brand-bg text-brand-text placeholder:text-brand-muted focus:ring-brand-accent/40 mt-2 w-full resize-none border border-white/10 px-4 py-3 text-sm outline-none focus:ring-2"
                />
              </>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
