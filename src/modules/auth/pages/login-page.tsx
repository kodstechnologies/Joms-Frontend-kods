import { zodResolver } from '@hookform/resolvers/zod'
import { UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuthStore } from '@/modules/auth/store/auth-store'
import { fetchRbacMe } from '@/modules/rbac/api/rbac-api'
import {
  getDefaultHomeRoute,
  normalizeUserPermissions,
} from '@/app/layouts/navigation/navigation.filter'
import { useLoginMutation } from '@/modules/auth/hooks/use-login-mutation'
import { useVerifyOtpMutation } from '@/modules/auth/hooks/use-verify-otp-mutation'
import { type LoginSchema, loginSchema } from '@/modules/auth/validations/login-schema'
import { type OtpSchema, otpSchema } from '@/modules/auth/validations/otp-schema'
import { FormField } from '@/shared/components/form/form-field'
import { OtpInput } from '@/shared/components/form/otp-input'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const updateUser = useAuthStore((state) => state.updateUser)
  const { mutateAsync: login, isPending: isLoginPending } = useLoginMutation()
  const { mutateAsync: verifyOtp, isPending: isVerifyPending } = useVerifyOtpMutation()
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

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

  const onSubmitCredentials = async (values: LoginSchema) => {
    try {
      if (!values.email) {
        toast.error('Email is required')
        return
      }
      await login({ email: values.email, password: values.password })
      setPendingEmail(values.email)
      setStep('otp')
      toast.success('OTP sent to your email')
    } catch {
      toast.error('Invalid credentials')
    }
  }

  const onSubmitOtp = async (values: OtpSchema) => {
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
      const admin = session?.admin
      const token = session?.token

      if (!token) {
        toast.error('Login succeeded but no auth token was returned')
        return
      }

      let sessionUser

      if (admin) {
        sessionUser = {
          id: admin.id,
          email: admin.email,
          fullname: admin.fullname,
          kind: admin.kind ?? 'subadmin',
          isSuperAdmin: Boolean(admin.isSuperAdmin),
          permissions: normalizeUserPermissions(admin.permissions ?? []),
          mfaEnabled: admin.mfaEnabled,
          status: admin.status,
          subAdminId: admin.subAdminId,
        }
        setSession(sessionUser, token)
      } else {
        sessionUser = {
          id: '',
          email: pendingEmail,
          fullname: 'Admin',
          kind: 'superadmin' as const,
          isSuperAdmin: true,
          permissions: [],
        }
        setSession(sessionUser, token)
      }

      if (!sessionUser.isSuperAdmin) {
        try {
          const profileResponse = await fetchRbacMe()
          const profile = profileResponse.data
          updateUser({
            subAdminId: profile.subAdminId || admin.subAdminId,
            permissions: normalizeUserPermissions(profile.permissions ?? []),
            requiresContactSetup: Boolean(profile.requiresContactSetup),
            contactSetupCompleted: Boolean(profile.contactSetupCompleted),
          })

          sessionUser = {
            ...sessionUser,
            subAdminId: profile.subAdminId || admin?.subAdminId,
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
      navigate(getDefaultHomeRoute(sessionUser), { replace: true })
    } catch {
      toast.error('Invalid or expired OTP')
    }
  }

  const subtitle = useMemo(() => {
    return step === 'credentials'
      ? 'Enter your email and password to access the admin panel. Sub-admins use the credentials set when their account was created.'
      : 'Enter 6 digit authorisation code sent to your email.'
  }, [step])

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-r from-[#6F6857] via-[#B8AF9A] to-[#F2E1B9]">
      <header className="absolute top-6 left-6 flex items-center gap-3">
        <div className="size-9 rounded-full bg-amber-400" />
        <p className="text-lg font-semibold tracking-wide text-white">JOMS</p>
      </header>

      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md border border-black/50 bg-black/90 p-8 shadow-2xl">
          {step === 'otp' ? (
            <div className="mb-6 flex justify-center">
              <div className="grid size-10 place-items-center rounded-full bg-white/10 text-slate-100">
                <UserRound className="size-5" />
              </div>
            </div>
          ) : null}

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-slate-100">
              {step === 'credentials' ? 'Login' : 'Two Factor Authentication'}
            </h1>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>

          {step === 'credentials' ? (
            <form
              className="mt-8 space-y-5"
              onSubmit={credentialsForm.handleSubmit(onSubmitCredentials)}
            >
              <FormField label="Email ID" error={credentialsForm.formState.errors.email?.message}>
                <Input
                  type="email"
                  className="border-0 border-b border-white/10 bg-transparent text-slate-100 shadow-none focus-visible:ring-0"
                  placeholder="admin@kods.com"
                  {...credentialsForm.register('email')}
                />
              </FormField>

              <FormField
                label="Password"
                error={credentialsForm.formState.errors.password?.message}
              >
                <Input
                  type="password"
                  className="border-0 border-b border-white/10 bg-transparent text-slate-100 shadow-none focus-visible:ring-0"
                  placeholder="Enter your password"
                  {...credentialsForm.register('password')}
                />
              </FormField>

              <Button className="mt-2 w-full" type="submit" disabled={isLoginPending}>
                {isLoginPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={otpForm.handleSubmit(onSubmitOtp)}>
              <div className="space-y-3">
                <Controller
                  control={otpForm.control}
                  name="code"
                  render={({ field }) => <OtpInput value={field.value} onChange={field.onChange} />}
                />
                {otpForm.formState.errors.code?.message ? (
                  <p className="text-center text-xs text-rose-300">
                    {otpForm.formState.errors.code.message}
                  </p>
                ) : null}
              </div>

              <Button className="w-full" type="submit" disabled={isVerifyPending}>
                {isVerifyPending ? 'Verifying...' : 'Login'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('credentials')
                  otpForm.reset()
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200"
              >
                Back to login
              </button>
            </form>
          )}
        </Card>
      </div>

      <footer className="absolute right-0 bottom-0 left-0 border-t border-black/20 bg-black/10 px-6 py-3 text-[11px] text-slate-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold">Email: hello@joms.in</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span>© 2026 JOMS Commerce &amp; Technologies Pvt Ltd</span>
            <span>Disclaimer</span>
            <span>Terms of Service</span>
            <span>Privacy</span>
            <span>Cookies</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
