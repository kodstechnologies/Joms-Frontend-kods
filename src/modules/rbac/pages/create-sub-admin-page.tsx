import { ArrowLeft, Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useCreateSubAdmin, useRoles } from '../hooks/use-rbac'
import type { CreateSubAdminPayload, Role } from '../types/rbac'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

type Step = 'details' | 'roles' | 'review'

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

export function CreateSubAdminPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('details')
  const [form, setForm] = useState<CreateSubAdminPayload>(emptyForm)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [adminNote, setAdminNote] = useState('')

  const { data: rolesData } = useRoles({ page: 1, limit: 100 })
  const createMutation = useCreateSubAdmin()

  const roles = rolesData?.data ?? []

  const selectedRoles = useMemo(
    () => roles.filter((role) => form.roleIds.includes(role.id)),
    [form.roleIds, roles],
  )

  const updateField = <K extends keyof CreateSubAdminPayload>(
    key: K,
    value: CreateSubAdminPayload[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const toggleRole = (role: Role) => {
    setForm((current) => ({
      ...current,
      roleIds: current.roleIds.includes(role.id)
        ? current.roleIds.filter((id) => id !== role.id)
        : [...current.roleIds, role.id],
    }))
  }

  const goNext = () => {
    if (step === 'details') {
      if (!form.firstName || !form.lastName || !form.email) {
        toast.error('First name, last name and email are required')
        return
      }
      if (!form.password || form.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
      if (form.password !== confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
      setStep('roles')
      return
    }

    if (step === 'roles') {
      if (!form.roleIds.length) {
        toast.error('Select at least one role')
        return
      }
      setStep('review')
    }
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/settings/access')}
          className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New User</h1>
          <p className="text-sm text-slate-400">Role based Access / Create New User</p>
        </div>
      </div>

      {step === 'review' ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Warning: Assigned permissions will apply immediately after role assignment.
        </div>
      ) : null}

      {step === 'details' ? (
        <div className="rounded-xl border border-white/10 bg-[#141414] p-5 md:p-6">
          <h2 className="text-lg font-semibold text-white">User Details</h2>
          <p className="mt-1 text-sm text-slate-400">
            Enter the admin user&apos;s basic information to get started.
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
                <label className="text-sm text-slate-300">{label}</label>
                <Input
                  value={String(form[key as keyof CreateSubAdminPayload] ?? '')}
                  onChange={(e) =>
                    updateField(key as keyof CreateSubAdminPayload, e.target.value)
                  }
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Password *</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="Set login password (min 6 characters)"
                autoComplete="new-password"
              />
              <p className="text-xs text-slate-500">
                This password will be used on the admin login page with the user&apos;s email.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Confirm Password *</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 md:col-span-2">
              <div>
                <p className="text-sm font-medium text-white">2 Factor Authentication</p>
                <p className="text-xs text-slate-400">
                  Every time the user tries to login they need verify via 2FA
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateField('mfaEnabled', !form.mfaEnabled)}
                className={cn(
                  'relative h-7 w-12 rounded-full transition-colors',
                  form.mfaEnabled ? 'bg-amber-400' : 'bg-slate-600',
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
      ) : null}

      {step === 'roles' ? (
        <div className="rounded-xl border border-white/10 bg-[#141414] p-5 md:p-6">
          <h2 className="text-lg font-semibold text-white">Assign Role</h2>
          <p className="mt-1 text-sm text-slate-400">
            Select roles to define the admin user&apos;s permissions and access level.
          </p>

          <div className="mt-5 space-y-3">
            {roles.map((role) => {
              const checked = form.roleIds.includes(role.id)
              return (
                <div
                  key={role.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-white/10 px-4 py-3"
                >
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRole(role)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-white">{role.name}</p>
                      <p className="text-sm text-slate-400">{role.description}</p>
                    </div>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-amber-300 hover:underline"
                    onClick={() => toast.info(role.permissions.join(', ') || 'No permissions')}
                  >
                    View Permission
                  </button>
                </div>
              )
            })}
          </div>

          {selectedRoles.length ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {selectedRoles.map((role) => (
                <div key={role.id} className="rounded-lg border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{role.name}</p>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                      {role.scopes.includes('venues') && role.scopes.includes('services')
                        ? 'Full Access'
                        : 'Limited Access'}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-300">
                    {role.scopes.map((scope) => (
                      <div key={scope} className="flex items-center gap-2 capitalize">
                        <Check className="size-3.5 text-emerald-400" />
                        {scope} Management
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 'review' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
            <h3 className="font-semibold text-white">Summary</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Name</dt>
                <dd className="text-white">
                  {form.firstName} {form.lastName}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Email</dt>
                <dd className="text-white">{form.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Login</dt>
                <dd className="text-right text-white">
                  Same email + password on the admin login screen
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Department</dt>
                <dd className="text-white">{form.department || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Roles</dt>
                <dd className="flex flex-wrap justify-end gap-1">
                  {selectedRoles.map((role) => (
                    <span
                      key={role.id}
                      className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs text-amber-200"
                    >
                      {role.name}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">2FA</dt>
                <dd className="text-white">{form.mfaEnabled ? 'Enabled' : 'Disabled'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
            <h3 className="font-semibold text-white">What happens next?</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
              <li>Admin user creation with assigned role</li>
              <li>System notification email sent (stubbed)</li>
              <li>Actions logged in Audit logs</li>
              <li>User logs in at /auth/login with email and the password you set</li>
            </ul>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => {
            if (step === 'details') navigate('/settings/access')
            else if (step === 'roles') setStep('details')
            else setStep('roles')
          }}
        >
          Previous
        </Button>
        {step === 'review' ? (
          <Button onClick={() => setConfirmOpen(true)}>Preview</Button>
        ) : (
          <Button onClick={goNext}>Continue</Button>
        )}
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#141414] p-6">
            <h3 className="text-lg font-semibold text-white">New User</h3>
            <p className="mt-3 text-sm text-slate-300">
              Are you sure you want to assign{' '}
              {selectedRoles.map((r) => r.name).join(', ') || 'roles'} to {form.firstName}{' '}
              {form.lastName}? They will immediately get access to the system.
            </p>
            <label className="mt-4 block text-sm text-slate-300">Admin notes</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
