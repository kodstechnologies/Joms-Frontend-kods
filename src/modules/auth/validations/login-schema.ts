import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginSchema = z.infer<typeof loginSchema>
