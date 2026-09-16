import { z } from 'zod'

export const otpSchema = z.object({
  code: z.string().regex(/^\d{4,6}$/, 'Enter a valid code'),
})

export type OtpSchema = z.infer<typeof otpSchema>
