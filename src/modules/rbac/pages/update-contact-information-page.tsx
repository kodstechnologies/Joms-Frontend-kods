import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Calendar, Check, Copy, ImageIcon, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuthStore } from '@/modules/auth/store/auth-store'
import { getDefaultHomeRoute } from '@/app/layouts/navigation/navigation.filter'
import { useCompleteContactSetup, useContactSetupProfile } from '../hooks/use-rbac'
import { checkSubAdminPhone, verifySubAdminMfa } from '../api/rbac-api'
import { sendAdminPhoneOtp, verifyAdminPhoneOtp } from '@/modules/auth/api/auth-api'
import { VerificationOtpModal } from '@/modules/expert/components/verification-otp-modal'
import { RbacLoader } from '../components/rbac-loader'
import type { PermissionCatalog, SubAdminRole } from '../types/rbac'
import { grantsToMap, type PermissionLevel } from '@/shared/lib/permissions'
import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

type ModuleAccess = 'full' | 'limited' | 'none'

const LEVEL_SHORT_LABEL: Partial<Record<PermissionLevel, string>> = {
  full: 'Full',
  read_only: 'Read',
  scoped: 'Scoped',
  secondary_approval: 'Approval',
  restricted: 'Restricted',
  sandbox: 'Sandbox',
}

const getModuleAccess = (
  role: SubAdminRole,
  moduleKey: string,
  catalog: PermissionCatalog,
): ModuleAccess => {
  const mod = catalog[moduleKey]
  if (!mod?.permissions?.length) return 'none'

  const roleGrants = grantsToMap(role.permissions || [])
  const keys = mod.permissions.map((p) => p.key)
  const granted = keys.filter((k) => Boolean(roleGrants[k]))
  if (!granted.length) return 'none'
  if (granted.length === keys.length) return 'full'
  return 'limited'
}

const accessLabel = (access: ModuleAccess) => {
  if (access === 'full') return 'Full Access'
  if (access === 'limited') return 'Limited Access'
  return 'No Access'
}

type PermissionModalTarget = {
  role: SubAdminRole
  moduleKey?: string
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

  const roles = useMemo(() => {
    if (profile?.roles?.length) return profile.roles
    return []
  }, [profile])

  const assignedRolesLabel = useMemo(() => {
    if (!roles.length) return 'Admin'
    return roles.map((r) => r.name).join(', ')
  }, [roles])

  const [phone, setPhone] = useState('')
  const [otpPhone, setOtpPhone] = useState('')
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [isPhoneVerifyModalOpen, setIsPhoneVerifyModalOpen] = useState(false)
  const [isCheckingPhone, setIsCheckingPhone] = useState(false)

  const [emergencyContact, setEmergencyContact] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [bloodGroup, setBloodGroup] = useState('')

  const [mfaCode, setMfaCode] = useState('')
  const [isMfaVerified, setIsMfaVerified] = useState(false)
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false)

  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [permissionModalTarget, setPermissionModalTarget] = useState<PermissionModalTarget | null>(
    null,
  )
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

  const roleModuleMap = useMemo(() => {
    const map = new Map<string, { key: string; label: string; access: ModuleAccess }[]>()
    roles.forEach((role) => {
      const rows = Object.entries(catalog)
        .map(([moduleKey, mod]) => ({
          key: moduleKey,
          label: mod.label,
          access: getModuleAccess(role, moduleKey, catalog),
        }))
        .filter((r) => r.access !== 'none')
      map.set(role.id, rows)
    })
    return map
  }, [catalog, roles])

  const permissionModalModules = useMemo(() => {
    if (!permissionModalTarget) return []
    const { role, moduleKey } = permissionModalTarget
    const roleGrants = grantsToMap(role.permissions || [])

    const modulesToProcess =
      moduleKey && catalog[moduleKey] ? ([[moduleKey, catalog[moduleKey]]] as const) : []

    return modulesToProcess
      .map(([modKey, mod]) => {
        const grantedPerms = mod.permissions
          .filter((p) => Boolean(roleGrants[p.key]))
          .map((p) => ({
            ...p,
            level: roleGrants[p.key],
          }))
        if (!grantedPerms.length) return null
        return {
          moduleKey: modKey,
          label: mod.label,
          permissions: grantedPerms,
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
  }, [catalog, permissionModalTarget])

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

  const handleOpenPhoneVerify = async () => {
    const trimmed = phone.trim()
    if (!trimmed) {
      toast.error('Please enter a phone number to verify.')
      return
    }
    const cleanDigits = trimmed.replace(/\D/g, '')
    if (cleanDigits.length < 10) {
      toast.error('Please enter a valid 10-digit phone number.')
      return
    }

    try {
      setIsCheckingPhone(true)
      const res = await checkSubAdminPhone(cleanDigits)
      if (res?.data && !res.data.available) {
        toast.error('This phone number is already associated with another sub-admin.')
        return
      }
      setOtpPhone(cleanDigits.slice(-10))
      setIsPhoneVerifyModalOpen(true)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error?.response?.data?.message || 'Failed to verify phone availability.')
    } finally {
      setIsCheckingPhone(false)
    }
  }

  const handleVerifyMfaCode = async () => {
    const cleanCode = mfaCode.trim()
    if (!cleanCode) {
      toast.error('Please enter the 6-digit code from your authenticator app.')
      return
    }
    if (!/^\d{6}$/.test(cleanCode)) {
      toast.error('Please enter a valid 6-digit code.')
      return
    }

    try {
      setIsVerifyingMfa(true)
      await verifySubAdminMfa(cleanCode)
      setIsMfaVerified(true)
      toast.success('Authenticator code verified successfully!')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(
        error?.response?.data?.message ||
          'Invalid authenticator code. Please check your authenticator app.',
      )
    } finally {
      setIsVerifyingMfa(false)
    }
  }

  const handleSubmit = async () => {
    const trimmedPhone = phone.trim()
    if (!trimmedPhone) {
      toast.error('Phone number is required.')
      return
    }
    if (!isPhoneVerified) {
      toast.error('Please verify your phone number before proceeding.')
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
    if (profile?.mfaEnabled) {
      if (!mfaCode.trim()) {
        toast.error('Authenticator 6-digit code is required.')
        return
      }
      if (!isMfaVerified) {
        toast.error('Please verify your authenticator 6-digit code before proceeding.')
        return
      }
    }

    try {
      await completeMutation.mutateAsync({
        phone: trimmedPhone,
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error?.response?.data?.message || 'Failed to update contact information')
    }
  }

  if (profileQuery.isLoading) {
    return <RbacLoader label="Loading contact information..." fullScreen />
  }

  const mfaSecretDisplay = profile?.mfaSecret
    ? profile.mfaSecret
        .toUpperCase()
        .replace(/\s+/g, '')
        .match(/.{1,4}/g)
        ?.join(' ') || profile.mfaSecret
    : ''

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/auth/login')}
            className="group flex w-fit items-center gap-2.5 text-xl font-bold tracking-tight text-white transition-colors hover:text-[#F6CB86]"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Update Contact Information</span>
          </button>
          <div className="flex items-center gap-1.5 pl-7 text-xs text-white/50">
            <span>Log In</span>
            <span>/</span>
            <span className="font-semibold text-white">Contact Information</span>
          </div>
        </div>

        {/* Contact Details Card */}
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Contact Details</h2>
              <p className="mt-1 text-xs text-white/50">
                Mandatory entry gate - Identity verification required to proceed
              </p>
            </div>

            <label className="group flex cursor-pointer flex-col items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
              <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#1c1c1c] transition-all group-hover:border-[#F6CB86]/50">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="size-full object-cover" />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full border border-dashed border-white/20 text-white/40">
                    <ImageIcon className="size-4" />
                  </div>
                )}
              </div>
              <span className="text-[11px] text-white/40 italic">Profile Picture</span>
            </label>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            {/* Phone Number (Row 1, Col 1) */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value)
                    setIsPhoneVerified(false)
                  }}
                  placeholder="Enter Phone Number here"
                  className="h-11 w-full flex-1 rounded-xl border border-white/10 bg-[#181818] px-4 text-xs text-white transition-all placeholder:text-white/30 focus:border-white focus:ring-1 focus:ring-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleOpenPhoneVerify}
                  disabled={isCheckingPhone}
                  className={cn(
                    'h-11 shrink-0 rounded-xl px-5 text-xs font-semibold transition-all',
                    isPhoneVerified
                      ? 'border border-[#1E563D]/50 bg-[#143D2B] text-[#00E065]'
                      : 'bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-[#050505] hover:brightness-95 disabled:opacity-50',
                  )}
                >
                  {isCheckingPhone ? 'Checking…' : isPhoneVerified ? 'Verified ✓' : 'Verify'}
                </button>
              </div>
            </div>

            {/* Emergency Contact (Row 1, Col 2) */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Emergency contact <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={emergencyContact}
                onChange={(event) => setEmergencyContact(event.target.value)}
                placeholder="Enter number here"
                className="h-11 w-full rounded-xl border border-white/10 bg-[#181818] px-4 text-xs text-white transition-all placeholder:text-white/30 focus:border-white focus:ring-1 focus:ring-white focus:outline-none"
              />
            </div>

            {/* Emergency Contact Name (Row 2, Col 1) */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Emergency contact name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(event) => setEmergencyContactName(event.target.value)}
                placeholder="Enter name"
                className="h-11 w-full rounded-xl border border-white/10 bg-[#181818] px-4 text-xs text-white transition-all placeholder:text-white/30 focus:border-white focus:ring-1 focus:ring-white focus:outline-none"
              />
            </div>

            {/* Date of Birth (Row 2, Col 2) */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white">Date of Birth</label>
              <div className="relative">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker()
                    } catch {
                      dateInputRef.current?.focus()
                    }
                  }}
                  placeholder="dd-mm-yyyy"
                  className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-[#181818] px-4 pr-12 text-xs text-white [color-scheme:dark] transition-all placeholder:text-white/30 focus:border-white focus:ring-1 focus:ring-white focus:outline-none [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:opacity-0"
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker()
                    } catch {
                      dateInputRef.current?.focus()
                    }
                  }}
                  className="absolute top-1/2 right-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Select date of birth"
                >
                  <Calendar className="size-5" />
                </button>
              </div>
            </div>

            {/* Blood Group (Row 3, Col 1) */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white">Blood Group</label>
              <input
                type="text"
                value={bloodGroup}
                onChange={(event) => setBloodGroup(event.target.value)}
                placeholder="Enter text"
                className="h-11 w-full rounded-xl border border-white/10 bg-[#181818] px-4 text-xs text-white transition-all placeholder:text-white/30 focus:border-white focus:ring-1 focus:ring-white focus:outline-none"
              />
            </div>

            {/* Assigned Role (Row 3, Col 2) */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white">Assigned role</label>
              <input
                type="text"
                value={assignedRolesLabel}
                readOnly
                className="h-11 w-full cursor-not-allowed rounded-xl border border-white/5 bg-[#141414] px-4 text-xs text-white/70 select-none"
              />
            </div>

            {/* Authenticator app code (Row 4, Col 1 - side-by-side with Enter 6 digit code) */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Authenticator app code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={mfaSecretDisplay}
                  placeholder="Loading authenticator secret..."
                  readOnly
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#181818] pr-11 pl-4 font-mono text-xs tracking-widest text-white/90 select-all placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={handleCopySecret}
                  title="Copy code"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            </div>

            {/* Enter 6 digit code here (Row 4, Col 2 - side-by-side with Authenticator app code) */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white">
                Enter 6 digit code here <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(event) => {
                    setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                    setIsMfaVerified(false)
                  }}
                  placeholder="Enter number here"
                  className="h-11 w-full flex-1 rounded-xl border border-white/10 bg-[#181818] px-4 font-mono text-xs tracking-wider text-white transition-all placeholder:text-white/30 focus:border-white focus:ring-1 focus:ring-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVerifyMfaCode}
                  disabled={isVerifyingMfa}
                  className={cn(
                    'h-11 shrink-0 rounded-xl px-5 text-xs font-semibold transition-all',
                    isMfaVerified
                      ? 'border border-[#1E563D]/50 bg-[#143D2B] text-[#00E065]'
                      : 'bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] text-[#050505] hover:brightness-95 disabled:opacity-50',
                  )}
                >
                  {isVerifyingMfa ? 'Verifying…' : isMfaVerified ? 'Verified ✓' : 'Verify'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Your Role & Permissions Card */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white">Your Role &amp; Permissions</h2>
          <div className="create-user-permission-stack">
            {roles.length ? (
              roles.map((role) => {
                const rows = roleModuleMap.get(role.id) ?? []
                return (
                  <div key={role.id} className="create-user-permission-card">
                    <p className="create-user-permission-role">{role.name}</p>
                    <p className="create-user-permission-heading">Key Permissions</p>

                    <div className="create-user-permission-rows">
                      {rows.length ? (
                        rows.map((row) => (
                          <div key={row.key} className="create-user-permission-row">
                            <div className="create-user-permission-name">
                              <Check className="size-3.5 shrink-0 text-white" strokeWidth={2.5} />
                              <span>{row.label}</span>
                              <span
                                className={cn(
                                  'create-user-access-badge',
                                  row.access === 'limited' &&
                                    'border border-[#F6CB86]/40 bg-[#F6CB86]/10 text-[#F6CB86]',
                                )}
                              >
                                {accessLabel(row.access)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPermissionModalTarget({ role, moduleKey: row.key })}
                              className="create-user-view-permission"
                            >
                              View Permission
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-brand-muted text-sm text-white/50">
                          No permissions assigned to this role.
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="create-user-permission-card">
                <p className="text-brand-muted text-sm text-white/50">
                  No roles assigned to this account.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/auth/login')}
            className="h-11 rounded-xl border border-white/20 bg-transparent px-8 text-xs font-medium text-white transition-colors hover:bg-white/5"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={completeMutation.isPending}
            className="h-11 rounded-xl bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-8 text-xs font-bold text-[#050505] transition-all hover:brightness-95 disabled:opacity-50"
          >
            {completeMutation.isPending ? 'Updating...' : 'Update Contact'}
          </button>
        </div>
      </div>

      {/* Phone OTP Verification Modal */}
      <VerificationOtpModal
        open={isPhoneVerifyModalOpen}
        type="phone"
        targetValue={otpPhone || phone}
        length={6}
        sendOtp={sendAdminPhoneOtp}
        verifyOtp={verifyAdminPhoneOtp}
        onClose={() => setIsPhoneVerifyModalOpen(false)}
        onVerified={() => {
          setIsPhoneVerified(true)
          setIsPhoneVerifyModalOpen(false)
        }}
      />

      {/* Role Permissions Details Modal (RBAC Module Modal standard) */}
      {permissionModalTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPermissionModalTarget(null)}
        >
          <div
            className="rounded-brand-lg w-full max-w-lg border border-white/10 bg-[#141414] p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-brand-text text-lg font-semibold text-white">
                  {permissionModalTarget.moduleKey && catalog[permissionModalTarget.moduleKey]
                    ? `${catalog[permissionModalTarget.moduleKey].label} Permissions`
                    : `${permissionModalTarget.role.name} Permissions`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPermissionModalTarget(null)}
                className="flex size-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 max-h-80 space-y-3 overflow-auto pr-1">
              {permissionModalModules.length ? (
                permissionModalModules.map(({ moduleKey, label, permissions: rolePerms }) => (
                  <div
                    key={moduleKey}
                    className="rounded-brand-md overflow-hidden border border-white/10 bg-black/40"
                  >
                    <p className="text-brand-text border-b border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-white">
                      {label}
                    </p>
                    <div className="divide-y divide-white/5">
                      {rolePerms.map((permission) => (
                        <div
                          key={permission.key}
                          className="text-brand-text flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-white/90"
                        >
                          <span className="font-medium">{permission.label}</span>
                          <div className="flex items-center gap-2">
                            {permission.level && permission.level !== 'full' ? (
                              <span className="rounded border border-[#F6CB86]/40 bg-[#F6CB86]/10 px-2 py-0.5 text-xs text-[#F6CB86]">
                                {LEVEL_SHORT_LABEL[permission.level as PermissionLevel] ||
                                  permission.level}
                              </span>
                            ) : null}
                            {permission.risk === 'high' || permission.risk === 'very_high' ? (
                              <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                                High Risk
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-brand-muted text-sm text-white/50">
                  No permissions assigned to this role.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
