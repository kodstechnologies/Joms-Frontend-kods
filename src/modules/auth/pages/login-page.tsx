import { zodResolver } from '@hookform/resolvers/zod'
import { UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuthStore } from '@/app/store/auth-store'
import { useLoginMutation } from '@/modules/auth/hooks/use-login-mutation'
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
  const { mutateAsync, isPending } = useLoginMutation()
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [pendingSession, setPendingSession] = useState<{
    accessToken: string
    user: { id: string; email: string; role: 'admin' | 'manager' }
  } | null>(null)

  const credentialsForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@gmail.com',
      password: '',
    },
  })

  const otpForm = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  })

  const onSubmitCredentials = async (values: LoginSchema) => {
    try {
      if (values.email !== 'admin@gmail.com') {
        toast.error('Use admin@gmail.com to login')
        return
      }
      const payload = await mutateAsync(values)
      setPendingSession(payload)
      setStep('otp')
      toast.message('Authorization code sent')
    } catch {
      toast.error('Use admin@gmail.com to login')
    }
  }

  const onSubmitOtp = (values: OtpSchema) => {
    if (!pendingSession) {
      setStep('credentials')
      return
    }

    if (!/^\d{6}$/.test(values.code)) {
      toast.error('Enter a valid 6 digit code')
      return
    }

    setSession(pendingSession)
    toast.success('Welcome back')
    navigate('/dashboard/executive', { replace: true })
  }

  const subtitle = useMemo(() => {
    return step === 'credentials'
      ? 'Enter your credentials to access the admin panel'
      : 'Enter 6 digit authorisation code sent to your email.'
  }, [step])

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-r from-[#6F6857] via-[#B8AF9A] to-[#F2E1B9]">
      <header className="absolute left-6 top-6 flex items-center gap-3">
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
            <form className="mt-8 space-y-5" onSubmit={credentialsForm.handleSubmit(onSubmitCredentials)}>
              <FormField label="Email ID" error={credentialsForm.formState.errors.email?.message}>
                <Input
                  type="email"
                  className="border-0 border-b border-white/10 bg-transparent text-slate-100 shadow-none focus-visible:ring-0"
                  placeholder="admin@gmail.com"
                  {...credentialsForm.register('email')}
                />
              </FormField>

              <FormField label="Password" error={credentialsForm.formState.errors.password?.message}>
                <Input
                  type="password"
                  className="border-0 border-b border-white/10 bg-transparent text-slate-100 shadow-none focus-visible:ring-0"
                  placeholder="admin123"
                  {...credentialsForm.register('password')}
                />
              </FormField>

              <Button className="mt-2 w-full" type="submit" disabled={isPending}>
                {isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={otpForm.handleSubmit(onSubmitOtp)}>
              <div className="space-y-3">
                {/* eslint-disable-next-line react-hooks/incompatible-library */}
                <OtpInput value={otpForm.watch('code')} onChange={(next) => otpForm.setValue('code', next)} />
                {otpForm.formState.errors.code?.message ? (
                  <p className="text-center text-xs text-rose-300">{otpForm.formState.errors.code.message}</p>
                ) : null}
              </div>

              <Button className="w-full" type="submit">
                Login
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

      <footer className="absolute bottom-0 left-0 right-0 border-t border-black/20 bg-black/10 px-6 py-3 text-[11px] text-slate-800">
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
