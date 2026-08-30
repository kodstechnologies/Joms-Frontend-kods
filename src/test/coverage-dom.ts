import { vi } from 'vitest'

export function installCoverageDomShims() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })

  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)

  class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
    root = null
    rootMargin = ''
    thresholds = []
  }
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

  vi.stubGlobal(
    'scrollTo',
    vi.fn(() => undefined),
  )
  vi.stubGlobal(
    'open',
    vi.fn(() => null),
  )

  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = () => 'blob:coverage'
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => undefined
  }
}
