import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('@/modules/auth/store/auth-store', () => ({
  useAuthStore: { getState: () => ({ token: null }) },
}))

import { toast } from 'sonner'

import { getApiErrorMessage } from '@/shared/lib/api-error'

import { authApiClient } from './axios'

describe('axios offline interceptor NET-03', () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear()
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
  })

  it('rejects the request and toasts when the browser is offline', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })

    await expect(authApiClient.get('/health')).rejects.toMatchObject({
      isOffline: true,
      code: 'ERR_NETWORK',
    })
    expect(toast.error).toHaveBeenCalledWith(
      'You are offline. Check your connection and try again.',
    )
  })
})

describe('getApiErrorMessage offline', () => {
  it('returns the offline copy for isOffline errors', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    const error = Object.assign(new Error('network'), {
      isAxiosError: true,
      isOffline: true,
      code: 'ERR_NETWORK',
    })
    expect(
      getApiErrorMessage(
        Object.assign(new Error('You are offline. Check your connection and try again.'), {
          isOffline: true,
        }),
      ),
    ).toMatch(/offline/i)
    expect(error.code).toBe('ERR_NETWORK')
  })
})
