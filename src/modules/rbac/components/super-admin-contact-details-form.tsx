import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, BadgeCheck, Camera, Check, ChevronDown, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/shared/lib/api-error'

import { useAuthStore } from '@/modules/auth/store/auth-store'
import { getDefaultHomeRoute } from '@/app/layouts/navigation/navigation.filter'
import { sendAdminPhoneOtp, verifyAdminPhoneOtp } from '@/modules/auth/api/auth-api'
import { VerificationOtpModal } from '@/modules/expert/components/verification-otp-modal'
import { useCompleteContactSetup, useContactSetupProfile } from '../hooks/use-rbac'
import { RbacLoader } from '../components/rbac-loader'
import { requiredLabel } from '@/shared/components/form/required-label'
import { PageBreadcrumb } from '@/shared/components/navigation/page-breadcrumb'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { grantsToMap, type PermissionLevel } from '@/shared/lib/permissions'
import { cn } from '@/shared/lib/cn'
import type { PermissionCatalog } from '../types/rbac'

const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
const EMPLOYMENT_TYPE_OPTIONS = ['Onsite', 'Remote', 'Hybrid'] as const
const WORKPLACE_FLEXIBILITY_OPTIONS = ['Flexible', 'Fixed Hours', 'Shift Based'] as const

const VERIFY_BTN_CLASS =
  'h-[44px] shrink-0 rounded-[10px] bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-5 text-sm font-semibold text-[#050505] transition-all hover:brightness-95 disabled:opacity-50'

const VERIFY_DONE_BTN_CLASS =
  'h-[44px] shrink-0 rounded-[10px] border border-[#1E563D]/50 bg-[#143D2B] px-5 text-sm font-semibold text-[#00E065]'

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
  permissionKeys: string[],
  moduleKey: string,
  catalog: PermissionCatalog,
): ModuleAccess => {
  const mod = catalog[moduleKey]
  if (!mod?.permissions?.length) return 'none'

  const roleGrants = grantsToMap(permissionKeys)
  const keys = mod.permissions.map((permission) => permission.key)
  const granted = keys.filter((key) => Boolean(roleGrants[key]))
  if (!granted.length) return 'none'
  if (granted.length === keys.length) return 'full'
  return 'limited'
}

const accessLabel = (access: ModuleAccess) => {
  if (access === 'full') return 'Full Access'
  if (access === 'limited') return 'Limited Access'
  return 'No Access'
}

function ContactCalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6.25 2.5V4.25M13.75 2.5V4.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="2.75"
        y="3.75"
        width="14.5"
        height="13.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M2.75 8H17.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7.75" y="11" width="4.5" height="3.5" rx="0.75" fill="currentColor" />
    </svg>
  )
}

export function SuperAdminContactDetailsForm() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const profileQuery = useContactSetupProfile(Boolean(user))
  const completeMutation = useCompleteContactSetup()
  const profile = profileQuery.data?.data.profile
  const catalog = useMemo(
    () => profileQuery.data?.data.permissionCatalog ?? {},
    [profileQuery.data?.data.permissionCatalog],
  )

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [otpPhone, setOtpPhone] = useState('')
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [isPhoneVerifyModalOpen, setIsPhoneVerifyModalOpen] = useState(false)
  const [dateOfBirth, setDateOfBirth] = useState('')
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [bloodGroup, setBloodGroup] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [location, setLocation] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [workplaceFlexibility, setWorkplaceFlexibility] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [permissionModuleKey, setPermissionModuleKey] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  if (profile && !hydrated) {
    setHydrated(true)
    setFirstName(profile.firstName || '')
    setLastName(profile.lastName || '')
    setPhone(profile.phone || '')
    setIsPhoneVerified(Boolean(profile.phoneVerified && profile.phone))
    setEmergencyContact(profile.emergencyContact || '')
    setEmergencyContactName(profile.emergencyContactName || '')
    setBloodGroup(profile.bloodGroup || '')
    setLocation(profile.location || profile.address || '')
    setDepartment(profile.department || '')
    setJobTitle(profile.jobTitle || '')
    setEmploymentType(profile.employmentType || '')
    setWorkplaceFlexibility(profile.workplaceFlexibility || '')
    setProfileImageUrl(profile.profileImageUrl || '')
    if (profile.dateOfBirth) {
      const date = new Date(profile.dateOfBirth)
      if (!Number.isNaN(date.getTime())) {
        setDateOfBirth(date.toISOString().slice(0, 10))
      }
    }
  }

  const email = profile?.email || user?.email || ''
  const permissionKeys = profile?.permissions?.length ? profile.permissions : []

  const permissionRows = useMemo(
    () =>
      Object.entries(catalog)
        .map(([moduleKey, mod]) => ({
          key: moduleKey,
          label: mod.label,
          access: getModuleAccess(permissionKeys, moduleKey, catalog),
        }))
        .filter((row) => row.access !== 'none'),
    [catalog, permissionKeys],
  )

  const permissionModalModule = useMemo(() => {
    if (!permissionModuleKey || !catalog[permissionModuleKey]) return null
    const mod = catalog[permissionModuleKey]
    const roleGrants = grantsToMap(permissionKeys)
    const permissions = mod.permissions
      .filter((permission) => Boolean(roleGrants[permission.key]))
      .map((permission) => ({
        ...permission,
        level: roleGrants[permission.key],
      }))
    return {
      label: mod.label,
      permissions,
    }
  }, [catalog, permissionKeys, permissionModuleKey])

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

  const handleOpenPhoneVerify = () => {
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
    setOtpPhone(cleanDigits.slice(-10))
    setIsPhoneVerifyModalOpen(true)
  }

  const openDatePicker = () => {
    try {
      dateInputRef.current?.showPicker()
    } catch {
      dateInputRef.current?.focus()
    }
  }

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      toast.error('First name is required.')
      return
    }
    if (!lastName.trim()) {
      toast.error('Last name is required.')
      return
    }
    if (!dateOfBirth) {
      toast.error('Date of birth is required.')
      return
    }
    if (!bloodGroup.trim()) {
      toast.error('Blood group is required.')
      return
    }
    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number.')
      return
    }
    if (!isPhoneVerified) {
      toast.error('Please verify your phone number before proceeding.')
      return
    }
    if (!emergencyContactName.trim()) {
      toast.error('Emergency contact name is required.')
      return
    }
    if (!emergencyContact.trim()) {
      toast.error('Emergency contact is required.')
      return
    }
    if (!location.trim()) {
      toast.error('Location is required.')
      return
    }
    if (!department.trim()) {
      toast.error('Department is required.')
      return
    }
    if (!jobTitle.trim()) {
      toast.error('Job title is required.')
      return
    }
    if (!employmentType.trim()) {
      toast.error('Employment type is required.')
      return
    }

    try {
      await completeMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        countryCode: '+91',
        dateOfBirth,
        bloodGroup: bloodGroup.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContact: emergencyContact.trim(),
        location: location.trim(),
        address: location.trim(),
        department: department.trim(),
        jobTitle: jobTitle.trim(),
        employmentType: employmentType.trim(),
        workplaceFlexibility: workplaceFlexibility.trim() || undefined,
        profileImageUrl: profileImageUrl || undefined,
      })
      updateUser({
        requiresContactSetup: false,
        contactSetupCompleted: true,
        fullname: `${firstName.trim()} ${lastName.trim()}`.trim(),
      })
      toast.success('Contact details updated successfully')
      navigate(getDefaultHomeRoute(user!), { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update contact details'))
    }
  }

  if (profileQuery.isLoading) {
    return <RbacLoader label="Loading contact details..." fullScreen />
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-8 text-white md:px-12">
      <div className="mx-auto flex w-full max-w-[999px] flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/auth/login')}
            className="group flex w-fit items-center gap-2.5 text-xl font-bold tracking-tight text-white transition-colors hover:text-[#F6CB86]"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
            <span>Profile Setup</span>
          </button>
          <div className="pl-7">
            <PageBreadcrumb
              items={[
                { label: 'Login', to: '/auth/login' },
                { label: 'Profile Setup', isActive: true },
              ]}
            />
          </div>
        </div>

        <div className="create-user-details-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="create-user-details-title">Personal Information</h2>
              <p className="create-user-details-subtitle">
                Enter your basic information to get started.
              </p>
            </div>
            <label className="group flex cursor-pointer flex-col items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
              <div className="flex size-[72px] items-center justify-center overflow-hidden rounded-full border border-dashed border-white/25 bg-[#050505] transition-colors group-hover:border-[#F6CB86]/50">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="size-full object-cover" />
                ) : (
                  <Camera className="size-5 text-white/45" />
                )}
              </div>
              <span className="text-[11px] text-white/40 italic">Profile Picture</span>
            </label>
          </div>

          <div className="create-user-details-grid">
            <div className="create-user-field">
              <label className="create-user-field-label">{requiredLabel('First Name *')}</label>
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Full Name"
                className="create-user-field-control"
              />
            </div>
            <div className="create-user-field">
              <label className="create-user-field-label">{requiredLabel('Last Name *')}</label>
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Full Name"
                className="create-user-field-control"
              />
            </div>

            <div className="create-user-field">
              <label className="create-user-field-label">{requiredLabel('Date Of Birth *')}</label>
              <div className="relative">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  onClick={openDatePicker}
                  placeholder="dd-mm-yyyy"
                  className={cn(
                    'create-user-field-control cursor-pointer pr-11 [color-scheme:dark]',
                    '[&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:opacity-0',
                  )}
                />
                <button
                  type="button"
                  onClick={openDatePicker}
                  className="absolute top-1/2 right-3 z-10 flex size-5 -translate-y-1/2 items-center justify-center text-white transition-opacity hover:opacity-80"
                  aria-label="Select date of birth"
                >
                  <ContactCalendarIcon />
                </button>
              </div>
            </div>

            <div className="create-user-field">
              <label className="create-user-field-label">{requiredLabel('Blood Group *')}</label>
              <div className="create-user-select-wrap">
                <select
                  value={bloodGroup}
                  onChange={(event) => setBloodGroup(event.target.value)}
                  className={cn(
                    'create-user-field-control create-user-select',
                    !bloodGroup && 'is-placeholder',
                  )}
                >
                  <option value="">Select here</option>
                  {BLOOD_GROUP_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="create-user-select-icon" aria-hidden="true" />
              </div>
            </div>

            <div className="create-user-field">
              <label className="create-user-field-label">{requiredLabel('Phone Number *')}</label>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
                      setIsPhoneVerified(false)
                    }}
                    placeholder="Enter phone number here"
                    className="create-user-field-control"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleOpenPhoneVerify}
                  className={cn(isPhoneVerified ? VERIFY_DONE_BTN_CLASS : VERIFY_BTN_CLASS)}
                >
                  {isPhoneVerified ? 'Verified' : 'Verify'}
                </button>
              </div>
            </div>

            <div className="create-user-field">
              <label className="create-user-field-label">{requiredLabel('Email Address *')}</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="create-user-field-control cursor-not-allowed pr-24 text-white/80"
                />
                <span className="absolute top-1/2 right-3 inline-flex -translate-y-1/2 items-center gap-1 rounded-full border border-[#1E563D]/50 bg-[#143D2B] px-2.5 py-1 text-[10px] font-semibold text-[#00E065]">
                  <BadgeCheck className="size-3" />
                  Verified
                </span>
              </div>
            </div>

            <div className="create-user-field">
              <label className="create-user-field-label">
                {requiredLabel('Emergency Contact Name *')}
              </label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(event) => setEmergencyContactName(event.target.value)}
                placeholder="Enter emergency contact"
                className="create-user-field-control"
              />
            </div>

            <div className="create-user-field">
              <label className="create-user-field-label">
                {requiredLabel('Emergency Contact *')}
              </label>
              <input
                type="tel"
                value={emergencyContact}
                onChange={(event) =>
                  setEmergencyContact(event.target.value.replace(/\D/g, '').slice(0, 10))
                }
                placeholder="Enter contact here"
                className="create-user-field-control"
              />
            </div>

            <div className="create-user-field">
              <label className="create-user-field-label">{requiredLabel('Location *')}</label>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Enter location"
                className="create-user-field-control"
              />
            </div>
          </div>
        </div>

        <div className="create-user-details-card">
          <div>
            <h2 className="create-user-details-title">Employment Information</h2>
            <p className="create-user-details-subtitle">
              Mandatory entry gate - Identity verification required to proceed
            </p>
          </div>

          <div className="create-user-details-grid">
            <div className="create-user-field">
              <label className="create-user-field-label">{requiredLabel('Department *')}</label>
              <input
                type="text"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                placeholder="Enter department here"
                className="create-user-field-control"
              />
            </div>
            <div className="create-user-field">
              <label className="create-user-field-label">{requiredLabel('Job Title *')}</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="Enter name"
                className="create-user-field-control"
              />
            </div>

            <div className="create-user-field">
              <label className="create-user-field-label">Assigned Role</label>
              <input
                type="text"
                value="Super Admin"
                readOnly
                className="create-user-field-control cursor-not-allowed text-white/70 select-none"
              />
            </div>

            <div className="create-user-field">
              <label className="create-user-field-label">
                {requiredLabel('Employment type *')}
              </label>
              <div className="create-user-select-wrap">
                <select
                  value={employmentType}
                  onChange={(event) => setEmploymentType(event.target.value)}
                  className={cn(
                    'create-user-field-control create-user-select',
                    !employmentType && 'is-placeholder',
                  )}
                >
                  <option value="">Select here</option>
                  {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="create-user-select-icon" aria-hidden="true" />
              </div>
            </div>

            <div className="create-user-field">
              <label className="create-user-field-label">Workplace Flexibility</label>
              <div className="create-user-select-wrap">
                <select
                  value={workplaceFlexibility}
                  onChange={(event) => setWorkplaceFlexibility(event.target.value)}
                  className={cn(
                    'create-user-field-control create-user-select',
                    !workplaceFlexibility && 'is-placeholder',
                  )}
                >
                  <option value="">Select here</option>
                  {WORKPLACE_FLEXIBILITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="create-user-select-icon" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white">Your Role &amp; Permissions</h2>
          <div className="create-user-permission-stack">
            <div className="create-user-permission-card !bg-[#141414]">
              <p className="create-user-permission-role">Admin</p>
              <p className="create-user-permission-heading">Key Permissions</p>
              <div className="create-user-permission-rows">
                {permissionRows.length ? (
                  permissionRows.map((row) => (
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
                        onClick={() => setPermissionModuleKey(row.key)}
                        className="create-user-view-permission"
                      >
                        View Permission
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-brand-muted text-sm text-white/50">
                    No permissions assigned to this account.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigateBackOrFallback(navigate, '/auth/login')}
            className="h-10 rounded-xl border border-white/20 bg-transparent px-8 text-xs font-medium text-white transition-colors hover:bg-white/5"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={completeMutation.isPending}
            className="h-10 rounded-xl bg-[linear-gradient(180deg,#F6CB86_0%,#E0A263_100%)] px-8 text-xs font-bold text-[#050505] transition-all hover:brightness-95 disabled:opacity-50"
          >
            {completeMutation.isPending ? 'Updating...' : 'Update Contact'}
          </button>
        </div>
      </div>

      <VerificationOtpModal
        open={isPhoneVerifyModalOpen}
        type="phone"
        targetValue={otpPhone || phone}
        length={4}
        sendOtp={sendAdminPhoneOtp}
        verifyOtp={verifyAdminPhoneOtp}
        onClose={() => setIsPhoneVerifyModalOpen(false)}
        onVerified={() => {
          setIsPhoneVerified(true)
          setIsPhoneVerifyModalOpen(false)
        }}
      />

      {permissionModuleKey ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPermissionModuleKey(null)}
        >
          <div
            className="rounded-brand-lg w-full max-w-lg border border-white/10 bg-[#141414] p-6 text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-brand-text text-lg font-semibold text-white">
                {permissionModalModule
                  ? `${permissionModalModule.label} Permissions`
                  : 'Permissions'}
              </h3>
              <button
                type="button"
                onClick={() => setPermissionModuleKey(null)}
                className="flex size-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 max-h-80 space-y-3 overflow-auto pr-1">
              {permissionModalModule?.permissions.length ? (
                <div className="rounded-brand-md overflow-hidden border border-white/10 bg-black/40">
                  <p className="text-brand-text border-b border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-white">
                    {permissionModalModule.label}
                  </p>
                  <div className="divide-y divide-white/5">
                    {permissionModalModule.permissions.map((permission) => (
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
