import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

/** Clarity `eye-show-solid` — Figma 18×18 (viewBox 36×36, pupil r≈6.86) */
const ClarityEyeShowSolidIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 36 36"
    width={18}
    height={18}
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M33.62 17.53c-3.37-6.23-9.28-10-15.82-10S5.34 11.3 2 17.53l-.28.47l.26.48c3.37 6.23 9.28 10 15.82 10s12.46-3.72 15.82-10l.26-.48Zm-15.82 8.9C12.17 26.43 7 23.29 4 18c3-5.29 8.17-8.43 13.8-8.43S28.54 12.72 31.59 18c-3.05 5.29-8.17 8.43-13.79 8.43" />
    <circle cx="18.09" cy="18.03" r="6.86" />
  </svg>
)

/** Clarity `eye-hide-solid` — paired hide state at the same 18×18 size */
const ClarityEyeHideSolidIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 36 36"
    width={18}
    height={18}
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.37 11.17a6.8 6.8 0 0 0-2.37.43l8.8 8.8a6.8 6.8 0 0 0 .43-2.4a6.86 6.86 0 0 0-6.86-6.83" />
    <path d="M34.29 17.53c-3.37-6.23-9.28-10-15.82-10a16.8 16.8 0 0 0-5.24.85L14.84 10a14.8 14.8 0 0 1 3.63-.47c5.63 0 10.75 3.14 13.8 8.43a17.8 17.8 0 0 1-4.37 5.1l1.42 1.42a19.9 19.9 0 0 0 5-6l.26-.48Z" />
    <path d="m4.87 5.78l4.46 4.46a19.5 19.5 0 0 0-6.69 7.29l-.26.47l.26.48c3.37 6.23 9.28 10 15.82 10a16.9 16.9 0 0 0 7.37-1.69l5 5l1.75-1.5l-26-26Zm8.3 8.3a6.85 6.85 0 0 0 9.55 9.55l1.6 1.6a14.9 14.9 0 0 1-5.86 1.2c-5.63 0-10.75-3.14-13.8-8.43a17.3 17.3 0 0 1 6.12-6.3Z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z" />
  </svg>
)

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

// Material Design mdiAccountLock Icon
const AccountLockIcon = () => (
  <svg viewBox="0 0 24 24" className="size-6 text-white" fill="currentColor" aria-hidden="true">
    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14M18,16A2,2 0 0,1 20,18V19H21V23H15V19H16V18A2,2 0 0,1 18,16M18,17A1,1 0 0,0 17,18V19H19V18A1,1 0 0,0 18,17Z" />
  </svg>
)

import type { AdminSessionUser } from '@/modules/auth/api/auth-api'
import { type AdminUser, useAuthStore } from '@/modules/auth/store/auth-store'
import { fetchRbacMe } from '@/modules/rbac/api/rbac-api'
import jomsLogo from '@/assets/joms-logo.png'
import {
  getDefaultHomeRoute,
  normalizeUserPermissions,
} from '@/app/layouts/navigation/navigation.filter'
import { useLoginMutation } from '@/modules/auth/hooks/use-login-mutation'
import { useVerifyOtpMutation } from '@/modules/auth/hooks/use-verify-otp-mutation'
import { type LoginSchema, loginSchema } from '@/modules/auth/validations/login-schema'
import { type OtpSchema, otpSchema } from '@/modules/auth/validations/otp-schema'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { OtpInput } from '@/shared/components/form/otp-input'

function buildSessionUser(admin: AdminSessionUser | undefined, fallbackEmail: string): AdminUser {
  if (admin) {
    return {
      id: admin.id,
      email: admin.email,
      fullname: admin.fullname,
      kind: admin.kind ?? 'subadmin',
      isSuperAdmin: Boolean(admin.isSuperAdmin),
      permissions: normalizeUserPermissions(admin.permissions ?? []),
      mfaEnabled: admin.mfaEnabled,
      status: admin.status,
      subAdminId: admin.subAdminId ?? undefined,
    }
  }

  return {
    id: '',
    email: fallbackEmail,
    fullname: 'Admin',
    kind: 'superadmin',
    isSuperAdmin: true,
    permissions: [],
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const updateUser = useAuthStore((state) => state.updateUser)
  const { mutateAsync: login, isPending: isLoginPending } = useLoginMutation()
  const { mutateAsync: verifyOtp, isPending: isVerifyPending } = useVerifyOtpMutation()
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [mfaMethod, setMfaMethod] = useState<'emailOtp' | 'authenticator'>('emailOtp')
  const [showPassword, setShowPassword] = useState(false)

  const credentialsForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const otpForm = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  })

  const postLoginPath = (sessionUser: AdminUser) => {
    const from = (
      location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null
    )?.from
    const pathname = from?.pathname
    if (pathname && pathname.startsWith('/') && !pathname.startsWith('/auth')) {
      return `${pathname}${from.search ?? ''}${from.hash ?? ''}`
    }
    return getDefaultHomeRoute(sessionUser)
  }

  const finalizeLogin = async (
    token: string,
    admin: AdminSessionUser | undefined,
    email: string,
  ) => {
    let sessionUser = buildSessionUser(admin, email)
    setSession(sessionUser, token)

    if (!sessionUser.isSuperAdmin) {
      try {
        const profileResponse = await fetchRbacMe()
        const profile = profileResponse.data
        const resolvedSubAdminId = profile.subAdminId || admin?.subAdminId || undefined
        updateUser({
          subAdminId: resolvedSubAdminId,
          permissions: normalizeUserPermissions(profile.permissions ?? []),
          requiresContactSetup: Boolean(profile.requiresContactSetup),
          contactSetupCompleted: Boolean(profile.contactSetupCompleted),
        })

        sessionUser = {
          ...sessionUser,
          subAdminId: resolvedSubAdminId,
          permissions: normalizeUserPermissions(profile.permissions ?? []),
        }

        if (profile.requiresContactSetup) {
          toast.success('Please complete your contact information')
          navigate('/auth/contact-information', { replace: true })
          return
        }
      } catch {
        // Fall through to default home if profile fetch fails
      }
    }

    toast.success('Welcome back')
    navigate(postLoginPath(sessionUser), { replace: true })
  }

  const onSubmitCredentials = async (values: LoginSchema) => {
    if (isLoginPending) return
    try {
      if (!values.email) {
        toast.error('Email is required')
        return
      }

      const response = await login({ email: values.email, password: values.password })
      const session = response?.data

      if (session?.mfaRequired === false) {
        if (!session.token) {
          toast.error('Login succeeded but no auth token was returned')
          return
        }
        await finalizeLogin(session.token, session.admin, values.email)
        return
      }

      setPendingEmail(values.email)
      const nextMfaMethod = session?.mfaMethod === 'authenticator' ? 'authenticator' : 'emailOtp'
      setMfaMethod(nextMfaMethod)
      setStep('otp')
      if (nextMfaMethod === 'authenticator') {
        toast.success('Enter the code from your authenticator app')
      } else {
        toast.success('OTP sent to your email')
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid credentials'))
    }
  }

  const onSubmitOtp = async (values: OtpSchema) => {
    if (isVerifyPending) return
    if (!pendingEmail) {
      setStep('credentials')
      return
    }

    if (!/^\d{6}$/.test(values.code)) {
      toast.error('Enter a valid 6 digit code')
      return
    }

    try {
      const response = await verifyOtp({ email: pendingEmail, otp: values.code })
      const session = response?.data
      const token = session?.token

      if (!token) {
        toast.error('Login succeeded but no auth token was returned')
        return
      }

      await finalizeLogin(token, session?.admin, pendingEmail)
    } catch {
      toast.error(
        mfaMethod === 'authenticator' ? 'Invalid authenticator code' : 'Invalid or expired OTP',
      )
    }
  }

  return (
    <main
      className="relative flex min-h-screen flex-col justify-between overflow-x-hidden"
      style={{
        background:
          'linear-gradient(125deg, #797365 0%, #9c9483 25%, #d5c7a5 58%, #eee3c8 75%, #cec0a1 100%)',
      }}
    >
      {/* Top Left Branding */}
      <header className="absolute top-8 left-8 flex items-center gap-3">
        <img src={jomsLogo} alt="JOMS" className="size-9 rounded-full object-contain shadow-sm" />
        <p className="text-lg font-semibold tracking-wider text-white">JOMS</p>
      </header>

      {/* Main Login / 2FA Card Center */}
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <div
          className={
            step === 'otp'
              ? 'w-full max-w-[565px] rounded-[32px] bg-[#050505] px-10 py-12 shadow-[0_25px_60px_rgba(0,0,0,0.65)] sm:px-14 sm:py-14'
              : 'flex h-[478px] w-full max-w-[565px] flex-col justify-center rounded-[32px] bg-[#050505] px-10 py-12 shadow-[0_25px_60px_rgba(0,0,0,0.65)] sm:px-14 sm:py-14'
          }
        >
          {step === 'otp' ? (
            /* Two Factor Authentication View */
            <div className="space-y-6">
              {/* Account Lock Icon Badge */}
              <div className="flex justify-center">
                <div className="grid size-12 place-items-center rounded-full bg-[#1E1E1E] shadow-sm">
                  <AccountLockIcon />
                </div>
              </div>

              <div className="space-y-1.5 text-center">
                <h1 className="text-[24px] font-semibold tracking-tight text-white sm:text-[26px]">
                  Two Factor Authentication
                </h1>
                <p className="text-sm font-normal text-[#717182]">
                  {mfaMethod === 'authenticator'
                    ? 'Enter the 6 digit code from your authenticator app.'
                    : 'Enter 6 digit authorisation code sent to your email.'}
                </p>
              </div>

              <form className="mt-8 space-y-7" onSubmit={otpForm.handleSubmit(onSubmitOtp)}>
                <div className="mx-auto w-full max-w-[405px] space-y-3">
                  <Controller
                    control={otpForm.control}
                    name="code"
                    render={({ field }) => (
                      <OtpInput
                        length={6}
                        value={field.value}
                        onChange={field.onChange}
                        autoFocus
                      />
                    )}
                  />
                  {otpForm.formState.errors.code?.message ? (
                    <p className="text-center text-xs text-rose-300">
                      {otpForm.formState.errors.code.message}
                    </p>
                  ) : null}
                </div>

                {/* Login button with #FFFFF0 */}
                <button
                  type="submit"
                  disabled={isVerifyPending}
                  className="mx-auto mt-6 flex h-12 w-full max-w-[361px] cursor-pointer items-center justify-center rounded-[10px] bg-[#FFFFF0] text-[15px] font-semibold text-[#000000] shadow-sm transition-all hover:bg-[#f4f4e2] active:scale-[0.99] disabled:opacity-60"
                >
                  {isVerifyPending ? 'Verifying...' : 'Login'}
                </button>
              </form>
            </div>
          ) : (
            /* Credentials View */
            <div>
              <div className="space-y-2 text-center">
                <h1 className="font-sans text-[32px] leading-5 font-semibold tracking-normal text-white">
                  Login
                </h1>
                <p className="text-center font-sans text-[18px] leading-6 font-normal tracking-normal text-[#717182]">
                  Enter your credentials to access the admin panel
                </p>
              </div>

              <form
                className="mt-8 space-y-6"
                onSubmit={credentialsForm.handleSubmit(onSubmitCredentials)}
              >
                {/* Email ID Field */}
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-normal text-white" htmlFor="login-email">
                    Email ID
                  </label>
                  <div className="border-b border-[#717182]/50 transition-colors focus-within:border-[#E0A263]">
                    <input
                      id="login-email"
                      type="email"
                      className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-[#717182] focus:outline-none"
                      placeholder="Enter your email"
                      autoComplete="username"
                      {...credentialsForm.register('email')}
                    />
                  </div>
                  {credentialsForm.formState.errors.email?.message ? (
                    <p className="text-xs text-rose-400">
                      {credentialsForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label
                    className="block text-[13px] font-normal text-white"
                    htmlFor="login-password"
                  >
                    Password
                  </label>
                  <div className="flex items-center gap-2 border-b border-[#717182]/50 transition-colors focus-within:border-[#E0A263]">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="min-w-0 flex-1 bg-transparent py-2 text-sm leading-none text-white outline-none placeholder:text-[#717182] focus:outline-none"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      {...credentialsForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="mb-px grid size-[18px] shrink-0 cursor-pointer place-items-center text-white opacity-100 transition-opacity hover:opacity-80 focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <ClarityEyeHideSolidIcon className="size-[18px]" />
                      ) : (
                        <ClarityEyeShowSolidIcon className="size-[18px]" />
                      )}
                    </button>
                  </div>
                  {credentialsForm.formState.errors.password?.message ? (
                    <p className="text-xs text-rose-400">
                      {credentialsForm.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoginPending}
                  className="mt-7 flex h-12 w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#E0A263] text-[15px] font-semibold text-[#000000] shadow-sm transition-all hover:bg-[#d89756] active:scale-[0.99] disabled:opacity-60"
                >
                  {isLoginPending ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-black/10 bg-transparent px-8 py-3.5 text-[11px] text-black sm:text-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/company/justonemorestep/"
              target="_blank"
              rel="noreferrer"
              className="text-black transition-colors hover:opacity-75"
            >
              <LinkedInIcon />
            </a>
            <a
              href="https://www.instagram.com/joms_justonemorestep"
              target="_blank"
              rel="noreferrer"
              className="text-black transition-colors hover:opacity-75"
            >
              <InstagramIcon />
            </a>
            <span className="font-normal text-black">
              Email:{' '}
              <a href="mailto:hello@joms.in" className="hover:underline">
                hello@joms.in
              </a>
            </span>
          </div>

          <div className="text-center text-black">
            <span>© 2026 JOMS Commerce &amp; Technologies Pvt Ltd</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1 text-black">
            <a
              href="https://www.joms.in/disclaimer"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Disclaimer
            </a>
            <a
              href="https://www.joms.in/terms-of-service"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Terms of Service
            </a>
            <a
              href="https://www.joms.in/privacy"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Privacy
            </a>
            <a
              href="https://www.joms.in/cookies-policy"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Cookies
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
