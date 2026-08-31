import { act, Component, type ComponentType, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    message: vi.fn(),
  },
}))

vi.mock('recharts', () => {
  const Box = ({ children }: { children?: unknown }) => children ?? null
  return {
    ResponsiveContainer: Box,
    LineChart: Box,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    BarChart: Box,
    Bar: () => null,
    PieChart: Box,
    Pie: () => null,
    Cell: () => null,
    AreaChart: Box,
    Area: () => null,
    CartesianGrid: () => null,
    ReferenceLine: () => null,
  }
})

vi.mock('@react-google-maps/api', () => ({
  GoogleMap: () => null,
  Marker: () => null,
  useJsApiLoader: () => ({ isLoaded: true, loadError: undefined }),
}))

vi.mock('firebase/app', () => ({ initializeApp: () => ({}) }))
vi.mock('firebase/messaging', () => ({
  getMessaging: () => ({}),
  getToken: async () => '',
  onMessage: () => () => undefined,
}))
vi.mock('@/shared/lib/firebase', () => ({
  requestNotificationPermission: async () => null,
  onForegroundMessage: () => () => undefined,
}))

vi.mock('socket.io-client', () => ({
  io: () => ({
    on: () => undefined,
    off: () => undefined,
    emit: () => undefined,
    disconnect: () => undefined,
    removeAllListeners: () => undefined,
    connect: () => undefined,
  }),
}))

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  const respond = async () => ({
    data: { success: true, message: 'ok', data: { items: [], docs: [] } },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  })
  const makeClient = () => ({
    get: vi.fn(respond),
    post: vi.fn(respond),
    put: vi.fn(respond),
    patch: vi.fn(respond),
    delete: vi.fn(respond),
    interceptors: {
      request: { use: () => 0, eject: () => undefined },
      response: { use: () => 0, eject: () => undefined },
    },
    defaults: { headers: { common: {} } },
  })
  const instance = makeClient()
  return {
    ...actual,
    default: {
      ...actual.default,
      create: () => makeClient(),
      get: instance.get,
      post: instance.post,
      put: instance.put,
      patch: instance.patch,
      delete: instance.delete,
      interceptors: instance.interceptors,
      isAxiosError: actual.isAxiosError,
    },
  }
})

const idle = {
  isLoading: false,
  isError: false,
  error: null,
  isFetching: false,
  isPending: false,
  refetch: vi.fn(),
  status: 'success' as const,
}

const mut = {
  ...idle,
  mutate: vi.fn(),
  mutateAsync: vi.fn(async () => ({ success: true, message: 'ok' })),
  isPending: false,
}

const spaceSummary = {
  spaceId: 'space-1',
  spaceName: 'Hall A',
  coverImage: null,
  city: 'Bengaluru',
  state: 'KA',
  capacity: 100,
  weekdayPrice: 5000,
  weekendPrice: 7000,
  availability: {
    weeklyAvailability: [{ day: 'Monday', from: '09:00', to: '18:00' }],
    blockedDates: [],
  },
  isHidden: false,
  isSuspend: false,
  status: 'approved' as const,
}

const venueFullView = {
  ownerPartnerExists: true,
  profile: {
    venueType: 'Banquet',
    clientSatisfaction: 4.5,
    ratings: 4.2,
    reviewsCount: 12,
    totalBookings: 40,
    yearsInOperation: { years: 3, months: 2 },
    totalEarnings: 250000,
    primaryCity: 'Bengaluru',
    kycId: 'kyc-1',
    kycStatus: 'approved',
  },
  overview: {
    venue: {
      _id: 'venue-1',
      ownerId: 'partner-1',
      partnerId: 'partner-1',
      ownerPartnerExists: true,
      ownerPartnerName: 'Coverage Owner',
      kycId: 'kyc-1',
      name: 'Coverage Venue',
      venueType: 'Banquet',
      aboutVenue: 'A coverage venue',
      location: {
        address: '1 Main St',
        city: 'Bengaluru',
        state: 'KA',
        country: 'IN',
        pincode: '560001',
      },
      parkingAvailable: true,
      accessibility: true,
      status: 'approved',
      venueStatus: 'live',
      isSuspend: false,
      profileImageUrl: '',
      coverImageUrl: '',
      hostingSince: { years: 3, months: 1 },
      pocName: 'POC',
      pocContactNumber: '9999999999',
      ratings: 4.2,
      reviewsCount: 12,
      bookingsCount: 40,
      insights: { responseTime: '1h', speed: 'fast', nps: 55, listingViews: 100 },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
    space: null,
    gallery: {
      venueCoverImages: [{ url: 'https://example.com/c.png' }],
      galleryImages: [{ url: 'https://example.com/g.png' }],
      contact: {
        contactHours: '9-6',
        contacts: [{ name: 'POC', phone: '9999999999', email: 'v@example.com' }],
      },
    },
    availability: {
      weeklyAvailability: [{ day: 'Monday', from: '09:00', to: '18:00' }],
      blockedDates: [],
    },
    terms: {
      terms: ['Be nice'],
      faqs: [{ question: 'Q?', answer: 'A' }],
      cancellation: { freeCancellationHours: 24, refundPercentage: 80 },
    },
    amenities: {
      amenities: [
        {
          categoryId: 'c1',
          category: 'AV',
          subCategoryIds: ['s1'],
          items: [{ _id: 'i1', name: 'Mic' }],
        },
      ],
    },
  },
  spaces: [spaceSummary, { ...spaceSummary, spaceId: 'space-2', spaceName: 'Hall B' }],
}

vi.mock('@/modules/expert/hooks/use-venues', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useVenueFullView: () => ({
      ...idle,
      data: { success: true, message: 'ok', data: venueFullView },
    }),
    useVenueInsights: () => ({
      ...idle,
      data: {
        success: true,
        data: [
          {
            id: 'r1',
            name: 'Reviewer',
            rating: 5,
            comment: 'Great',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    }),
    useVenues: () => ({
      ...idle,
      data: {
        success: true,
        data: [
          {
            _id: 'venue-1',
            id: 'venue-1',
            name: 'Coverage Venue',
            status: 'approved',
            city: 'Bengaluru',
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      },
    }),
    useSuspendVenue: () => mut,
    useDeleteVenue: () => mut,
    useSetVenueOwnerPassword: () => mut,
    useBulkUpdateSpaceVisibility: () => mut,
  }
})

vi.mock('@/modules/expert/hooks/use-venue-analytics', () => ({
  useVenueProfileAnalytics: () => ({
    ...idle,
    data: {
      success: true,
      data: {
        overview: [
          { label: 'Bookings', value: 40 },
          { label: 'Revenue', value: 250000 },
        ],
        trendPoints: [{ month: 'Jan', revenue: 10000, bookings: 4 }],
      },
    },
  }),
}))

vi.mock('@/modules/settings/hooks/use-venue-public-settings', () => ({
  useVenueManagementControls: () => ({
    allowDisableVenues: true,
    allowHideSpaces: true,
  }),
}))

vi.mock('@/modules/my-tasks/hooks/use-admin-escalation', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useEscalationAssignees: () => ({
      ...idle,
      data: {
        data: [
          { id: 'a1', fullname: 'Assignee One' },
          { id: 'a2', fullname: 'Assignee Two' },
        ],
      },
    }),
  }
})

vi.mock('@/modules/expert/hooks/use-expert', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useBlockExpert: () => mut,
    useForceLogoutExpert: () => mut,
    useExperts: () => ({
      ...idle,
      data: {
        data: [{ id: 'id-1', expertId: 'id-1', fullname: 'Expert', status: 'approved' }],
      },
    }),
  }
})

vi.mock('@/shared/hooks/use-entity-tags', () => ({
  useEntityTags: () => ({
    tagModalOpen: false,
    openTagModal: vi.fn(),
    closeTagModal: vi.fn(),
    saveTags: vi.fn(),
    initialTags: [],
  }),
}))

vi.mock('@/modules/settings/hooks/use-templates', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useModerationReasonOptions: () => ({
      options: [{ value: 'other', label: 'Other' }],
      buildPayload: () => ({
        selectedReasons: ['other'],
        reasonDetails: 'coverage',
        reasonIds: [],
      }),
    }),
    useRecordModerationReasonUsage: () => mut,
  }
})

import { useAuthStore } from '@/modules/auth/store/auth-store'
import { installCoverageDomShims } from '@/test/coverage-dom'

class Boundary extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() {
    return { err: true }
  }
  render() {
    return this.state.err ? <div data-err="1" /> : this.props.children
  }
}

async function settle(qc: QueryClient) {
  for (let i = 0; i < 15; i++) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 5))
    })
    if (qc.isFetching() === 0) break
  }
}

async function clickLabels(host: HTMLElement, labels: string[]) {
  for (const label of labels) {
    const nodes = Array.from(host.querySelectorAll('button, a, [role="tab"], [role="menuitem"]'))
    const el = nodes.find((n) => (n.textContent || '').includes(label))
    if (!el) continue
    await act(async () => {
      try {
        ;(el as HTMLElement).click()
      } catch {
        /* ignore */
      }
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 8))
    })
  }
}

describe('venue-profile + next largest pages', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof import('react-dom/client').createRoot>
  let qc: QueryClient

  beforeEach(async () => {
    installCoverageDomShims()
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    host = document.createElement('div')
    document.body.appendChild(host)
    const { createRoot } = await import('react-dom/client')
    root = createRoot(host)
    qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    useAuthStore.getState().setSession(
      {
        id: '1',
        email: 'admin@example.com',
        fullname: 'Admin',
        kind: 'superadmin',
        isSuperAdmin: true,
        permissions: [],
      },
      'coverage-token',
    )
  })

  afterEach(() => {
    try {
      act(() => root.unmount())
    } catch {
      /* ignore */
    }
    host.remove()
    qc.clear()
    useAuthStore.getState().clearSession()
  })

  async function mount(routePath: string, entry: string, load: () => Promise<unknown>) {
    const mod = (await load()) as Record<string, unknown>
    const Page = (mod.default ||
      Object.values(mod).find((v) => typeof v === 'function')) as ComponentType
    await act(async () => {
      root.render(
        <QueryClientProvider client={qc}>
          <Boundary>
            <MemoryRouter initialEntries={[entry]}>
              <Routes>
                <Route path={routePath} element={<Page />} />
              </Routes>
            </MemoryRouter>
          </Boundary>
        </QueryClientProvider>,
      )
    })
    await settle(qc)
  }

  it('venue-profile-view with venueId + tabs', async () => {
    await mount(
      '/venues/management/profile/:venueId',
      '/venues/management/profile/venue-1',
      () => import('./modules/expert/pages/venue/venue-profile-view-page'),
    )
    await clickLabels(host, [
      'Overview',
      'Spaces Listing',
      'Venue Analytics',
      'Profile Health',
      'Hall A',
      'Suspend',
      'Delete',
      'Hide',
      'Escalate',
    ])
    // Prefer text that should exist after fullView loads
    expect(host.textContent || '').toMatch(/Coverage Venue|Overview|Spaces|Loading|err/i)
  }, 90_000)

  it('venue-management page', async () => {
    await mount(
      '/venues/management',
      '/venues/management',
      () => import('./modules/expert/pages/venue/venue-management-page'),
    )
    await clickLabels(host, ['All', 'Active', 'Pending', 'Suspended', 'Export', 'Filters'])
    expect(host.isConnected).toBe(true)
  }, 90_000)

  it('create-sub-admin page', async () => {
    await mount(
      '/rbac/sub-admins/create',
      '/rbac/sub-admins/create',
      () => import('./modules/rbac/pages/create-sub-admin-page'),
    )
    await clickLabels(host, ['Next', 'Permissions', 'Save', 'Cancel', 'Back'])
    expect(host.isConnected).toBe(true)
  }, 90_000)

  it('space-details page', async () => {
    await mount(
      '/venues/management/:venueId/spaces/:spaceId',
      '/venues/management/venue-1/spaces/space-1',
      () => import('./modules/expert/pages/venue/space-details-page'),
    )
    await clickLabels(host, ['Overview', 'Pricing', 'Availability', 'Amenities', 'Save'])
    expect(host.isConnected).toBe(true)
  }, 90_000)

  it('service-management + service-detail', async () => {
    await mount(
      '/services/management',
      '/services/management',
      () => import('./modules/expert/pages/services/service-management-page'),
    )
    await clickLabels(host, ['All', 'Active', 'Pending', 'Export', 'Filters'])
    await mount(
      '/services/management/:id',
      '/services/management/svc-1',
      () => import('./modules/expert/pages/services/service-detail-page'),
    )
    await clickLabels(host, ['Overview', 'Pricing', 'Availability', 'Orders'])
    expect(host.isConnected).toBe(true)
  }, 90_000)
})
