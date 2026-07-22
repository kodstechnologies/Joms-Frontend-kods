import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Check, Copy, ImageIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuthStore } from '@/modules/auth/store/auth-store'
import { getDefaultHomeRoute } from '@/app/layouts/navigation/navigation.filter'
import { useCompleteContactSetup, useContactSetupProfile } from '../hooks/use-rbac'
import { RbacLoader } from '../components/rbac-loader'
import type { PermissionCatalog, SubAdminRole } from '../types/rbac'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { uiTokens } from '@/shared/lib/design-tokens'

type ModuleAccess = 'full' | 'limited' | 'none'

const getModuleAccess = (
  role: SubAdminRole,
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

export function UpdateContactInformationPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)

  const profileQuery = useContactSetupProfile(Boolean(user && !user.isSuperAdmin))
  const completeMutation = useCompleteContactSetup()

  const profile = profileQuery.data?.data.profile
  const catalog = useMemo(
    () => profileQuery.data?.data.permissionCatalog ?? {},
    [profileQuery.data?.data.permissionCatalog],
  )
  const primaryRole = profile?.roles?.[0]

  const [phone, setPhone] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [permissionViewRole, setPermissionViewRole] = useState<SubAdminRole | null>(null)
  const [hydratedProfile, setHydratedProfile] = useState(profile)

  useEffect(() => {
    if (!user) return
    if (user.isSuperAdmin) {
      navigate(getDefaultHomeRoute(user), { replace: true })
      return
    }
    if (user.contactSetupCompleted) {
      navigate(getDefaultHomeRoute(user), { replace: true })
    }
  }, [navigate, user])

  if (profile && profile !== hydratedProfile) {
    setHydratedProfile(profile)
    setPhone(profile.phone || '')
    setEmergencyContact(profile.emergencyContact || '')
    setEmergencyContactName(profile.emergencyContactName || '')
    setBloodGroup(profile.bloodGroup || '')
    setProfileImageUrl(profile.profileImageUrl || '')
    if (profile.dateOfBirth) {
      const date = new Date(profile.dateOfBirth)
      if (!Number.isNaN(date.getTime())) {
        setDateOfBirth(date.toISOString().slice(0, 10))
      }
    }
  }

  const moduleRows = useMemo(() => {
    if (!primaryRole) return []
    return Object.entries(catalog).map(([moduleKey, mod]) => ({
      key: moduleKey,
      label: mod.label,
      access: getModuleAccess(primaryRole, moduleKey, catalog),
    }))
  }, [catalog, primaryRole])

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileImageUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCopySecret = async () => {
    if (!profile?.mfaSecret) return
    try {
      await navigator.clipboard.writeText(profile.mfaSecret.replace(/\s+/g, ''))
      toast.success('Authenticator code copied')
    } catch {
      toast.error('Failed to copy code')
    }
  }

  const handleSubmit = async () => {
    if (!phone.trim()) {
      toast.error('Phone number is required.')
      return
    }
    if (!emergencyContact.trim()) {
      toast.error('Emergency contact is required.')
      return
    }
    if (!emergencyContactName.trim()) {
      toast.error('Emergency contact name is required.')
      return
    }
    if (profile?.mfaEnabled && !/^\d{6}$/.test(mfaCode.trim())) {
      toast.error('Enter a valid 6 digit authenticator code.')
      return
    }

    try {
      await completeMutation.mutateAsync({
        phone: phone.trim(),
        emergencyContact: emergencyContact.trim(),
        emergencyContactName: emergencyContactName.trim(),
        dateOfBirth: dateOfBirth || undefined,
        bloodGroup: bloodGroup.trim() || undefined,
        profileImageUrl: profileImageUrl || undefined,
        mfaCode: profile?.mfaEnabled ? mfaCode.trim() : undefined,
      })

      updateUser({
        requiresContactSetup: false,
        contactSetupCompleted: true,
      })
      toast.success('Contact information updated successfully')
      navigate(getDefaultHomeRoute(user!), { replace: true })
    } catch {
      toast.error('Failed to update contact information')
    }
  }

  if (profileQuery.isLoading) {
    return <RbacLoader label="Loading contact information..." fullScreen />
  }

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/auth/login')}
            className="group font-heading text-h3 text-brand-text hover:text-brand-accent flex w-fit items-center gap-2 font-bold tracking-tight transition-colors"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Update Contact Information</span>
          </button>
          <div className="text-body-sm-medium text-muted flex items-center gap-1.5 pl-7">
            <span>Log In</span>
            <span className="text-brand-text/30">/</span>
            <span className="text-brand-text font-bold">Contact Information</span>
          </div>
        </div>

        <div className={cn(uiTokens.radiusCard, uiTokens.borderSubtle, 'bg-brand-surface p-6')}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-brand-text text-lg font-semibold">Contact Details</h2>
              <p className="text-brand-muted mt-1 text-sm">
                Mandatory entry gate - Identity verification required to proceed.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
              <div className="bg-brand-surface grid size-20 place-items-center overflow-hidden rounded-full border border-white/10">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="size-full object-cover" />
                ) : (
                  <ImageIcon className="text-brand-muted size-6" />
                )}
              </div>
              <span className="text-brand-muted text-xs">Profile Picture</span>
            </label>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-brand-text text-sm font-medium">
                Phone Number <span className="text-brand-danger">*</span>
              </label>
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter Phone Number here."
              />
            </div>

            <div className="space-y-2">
              <label className="text-brand-text text-sm font-medium">
                Emergency contact <span className="text-brand-danger">*</span>
              </label>
              <Input
                value={emergencyContact}
                onChange={(event) => setEmergencyContact(event.target.value)}
                placeholder="Enter number here."
              />
            </div>

            <div className="space-y-2">
              <label className="text-brand-text text-sm font-medium">
                Emergency contact name <span className="text-brand-danger">*</span>
              </label>
              <Input
                value={emergencyContactName}
                onChange={(event) => setEmergencyContactName(event.target.value)}
                placeholder="Enter name."
              />
            </div>

            <div className="space-y-2">
              <label className="text-brand-text text-sm font-medium">Date of Birth</label>
              <div className="relative">
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className="pr-10"
                />
                <CalendarDays className="text-brand-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-brand-text text-sm font-medium">Blood Group</label>
              <Input
                value={bloodGroup}
                onChange={(event) => setBloodGroup(event.target.value)}
                placeholder="Enter text."
              />
            </div>

            <div className="space-y-2">
              <label className="text-brand-text text-sm font-medium">Assigned role</label>
              <Input value={primaryRole?.name || '—'} readOnly className="bg-brand-surface" />
            </div>

            {profile?.mfaEnabled ? (
              <>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-brand-text text-sm font-medium">
                    Authenticator app code
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      value={profile.mfaSecret || ''}
                      readOnly
                      className="bg-brand-surface font-mono tracking-[0.2em]"
                    />
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="rounded-brand-md text-brand-muted hover:text-brand-text border border-white/10 p-2 transition-colors hover:bg-white/10"
                      aria-label="Copy authenticator code"
                    >
                      <Copy className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-brand-text text-sm font-medium">
                    Enter 6 digit code here <span className="text-brand-danger">*</span>
                  </label>
                  <Input
                    value={mfaCode}
                    onChange={(event) =>
                      setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="Enter number here."
                    inputMode="numeric"
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>

        <section>
          <h2 className="text-brand-text text-lg font-semibold">Your Role &amp; Permissions</h2>
          <div className="rounded-brand-lg border-brand-accent-muted bg-brand-accent/10 mt-4 border p-5">
            <p className="text-brand-text text-base font-semibold">
              {primaryRole?.name || 'Admin'}
            </p>
            <p className="text-brand-text mt-4 text-sm font-medium">Key Permissions</p>

            <div className="mt-3 space-y-3">
              {moduleRows.length ? (
                moduleRows.map((row) => (
                  <div
                    key={row.key}
                    className="rounded-brand-md bg-brand-surface flex flex-wrap items-center justify-between gap-3 border border-white/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-brand-success/15 text-brand-success grid size-5 place-items-center rounded-full">
                        <Check className="size-3" />
                      </span>
                      <span className="text-brand-text text-sm font-medium">{row.label}</span>
                      <span className="bg-brand-accent/20 text-brand-accent text-body-sm-semibold rounded-full px-2.5 py-0.5">
                        {accessLabel(row.access)}
                      </span>
                    </div>
                    {primaryRole ? (
                      <button
                        type="button"
                        className="text-brand-muted hover:text-brand-accent text-xs underline underline-offset-2"
                        onClick={() => setPermissionViewRole(primaryRole)}
                      >
                        View Permission
                      </button>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-brand-muted text-sm">No permissions assigned to this role.</p>
              )}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => navigateBackOrFallback(navigate, '/auth/login')}
          >
            Previous
          </Button>
          <Button onClick={handleSubmit} disabled={completeMutation.isPending}>
            {completeMutation.isPending ? 'Updating...' : 'Update Contact'}
          </Button>
        </div>
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
                ×
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
                          <div key={permission.key} className="text-brand-text px-3 py-2 text-sm">
                            {permission.label}
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
    </div>
  )
}
