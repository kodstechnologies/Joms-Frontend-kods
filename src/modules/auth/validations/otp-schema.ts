import { z } from 'zod'

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter a valid 6 digit code'),
})

export type OtpSchema = z.infer<typeof otpSchema>
