import { describe, expect, it } from 'vitest'

import { loginSchema } from '@/modules/auth/validations/login-schema'
import { otpSchema } from '@/modules/auth/validations/otp-schema'

describe('loginSchema', () => {
  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'nope', password: 'password1' })
    expect(result.success).toBe(false)
  })

  it('rejects a short password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@example.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a valid email and password and lowercases email', () => {
    const result = loginSchema.safeParse({
      email: 'Admin@Example.com',
      password: 'password1',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('admin@example.com')
    }
  })
})

describe('otpSchema', () => {
  it('accepts a 6 digit code', () => {
    expect(otpSchema.safeParse({ code: '123456' }).success).toBe(true)
  })

  it('rejects a short code', () => {
    expect(otpSchema.safeParse({ code: '12' }).success).toBe(false)
  })
})
