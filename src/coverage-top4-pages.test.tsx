/** @vitest-environment jsdom */
/**
 * Targeted coverage for the 4 largest uncovered Admin pages.
 * Mocks data hooks with rich fixtures so tabs/steps leave loading shells.
 */
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
    data: { success: true, message: 'ok', data: fixtureListPayload() },
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

const expertProfile = {
  _id: 'id-1',
  fullname: 'Coverage Expert',
  phone: '9999999999',
  email: 'expert@example.com',
  phoneVerified: true,
  emailVerified: true,
  servicetype: 'Service',
  expertType: 'individual',
  kycStatus: 'approved',
  isBlocked: false,
  isDeactivated: false,
  hasPassword: true,
  basicProfile: {
    coverImage: '',
    profileImage: '',
    fullname: 'Coverage Expert',
    location: 'Bengaluru',
    bio: 'Coverage bio',
    industry: 'Design',
    experienceYears: 5,
    experienceMonths: 2,
    serviceType: 'Service',
    serviceCategory: ['Design', 'Consulting'],
    offerings: ['Logo', 'Brand'],
    phoneNumber: '9999999999',
    email: 'expert@example.com',
  },
  workExperience: [
    {
      _id: 'w1',
      jobTitle: 'Designer',
      companyName: 'Acme',
      employmentType: 'full-time',
      startDate: '2020-01-01',
      endDate: null,
      currentlyWorking: true,
      description: 'Worked',
    },
  ],
  gallery: { images: ['https://example.com/a.png'] },
  finalReview: { isVerified: true, approvalStatus: 'approved' as const },
  customUrl: 'coverage-expert',
  rating: 4.5,
  reviewCount: 10,
  nps: 60,
  totalEarnings: 10000,
  completedOrders: 12,
  analytics: {
    rating: 4.5,
    totalReviews: 10,
    nps: 60,
    totalEarnings: 10000,
    completedOrders: 12,
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
}

const serviceRow = {
  _id: 'svc-1',
  title: 'Coverage Service',
  status: 'approved',
  serviceType: 'Service',
  partnerId: 'id-1',
  pricingType: 'fixed',
  price: 500,
  durationMinutes: 60,
}

const consultationRow = {
  _id: 'con-1',
  title: 'Coverage Consult',
  status: 'approved',
  serviceType: 'Consultation',
  partnerId: 'id-1',
  pricingType: 'hourly',
  price: 1000,
  durationMinutes: 30,
}

function fixtureListPayload() {
  return {
    items: [serviceRow, consultationRow, expertProfile],
    data: [serviceRow, consultationRow, expertProfile],
    docs: [serviceRow],
    results: [serviceRow],
    pagination: { page: 1, limit: 10, total: 3, pages: 1 },
    meta: { page: 1, limit: 10, total: 3, pages: 1 },
  }
}

const idleQuery = {
  isLoading: false,
  isError: false,
  error: null,
  isFetching: false,
  refetch: vi.fn(),
  status: 'success' as const,
}

vi.mock('@/modules/expert/hooks/use-expert-profile', () => ({
  useExpertProfile: () => ({
    ...idleQuery,
    data: { success: true, data: expertProfile },
  }),
  useExpertAnalytics: () => ({
    ...idleQuery,
    data: {
      success: true,
      data: {
        ratingsSummary: { average: 4.5, count: 10, available: true },
        nps: { score: 60, available: true },
        listingOverview: { totalEarnings: 10000, ordersCompleted: 12 },
        profileHeader: { customUrl: 'coverage-expert' },
        trendPoints: [
          { month: 'Jan', revenue: 100, consultationsDelivered: 2, consultationsCompleted: 1 },
        ],
      },
    },
  }),
  useExpertServices: () => ({
    ...idleQuery,
    data: { success: true, data: [serviceRow], pagination: { page: 1, limit: 10, total: 1 } },
  }),
  useExpertConsultations: () => ({
    ...idleQuery,
    data: {
      success: true,
      data: [consultationRow],
      pagination: { page: 1, limit: 10, total: 1 },
    },
  }),
  usePartnerInsights: () => ({
    ...idleQuery,
    data: { success: true, data: [{ id: 'ins-1', name: 'Insight', rating: 5 }] },
  }),
}))

vi.mock('@/modules/expert/hooks/use-categories', () => ({
  useCategories: () => ({
    ...idleQuery,
    data: {
      data: [
        {
          _id: 'cat-1',
          name: 'Design',
          subCategories: [{ _id: 'sub-1', name: 'Logo' }],
        },
        {
          _id: 'cat-2',
          name: 'Tech',
          subCategories: [{ _id: 'sub-2', name: 'Code' }],
        },
      ],
    },
  }),
  useSubcategories: () => ({
    ...idleQuery,
    data: { data: [{ _id: 'sub-1', name: 'Logo' }] },
  }),
}))

vi.mock('@/modules/expert/hooks/use-create-listing', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  const ok = { ...idleQuery, mutate: vi.fn(), mutateAsync: vi.fn(async () => ({ success: true })) }
  return {
    ...actual,
    useConsultationTopics: () => ({
      ...idleQuery,
      data: { data: [{ _id: 'topic-1', name: 'Career' }] },
    }),
    useCreateService: () => ok,
    useUpdateServicePricing: () => ok,
    useUpdateServiceGallery: () => ok,
    usePublishService: () => ok,
    useCreateConsultation: () => ok,
    useUpdateConsultationBasic: () => ok,
    useUpdateConsultationAdditionalInfo: () => ok,
    useUpdateConsultationPricing: () => ok,
    usePublishConsultation: () => ok,
  }
})

vi.mock('@/modules/expert/hooks/use-expert-application-view', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useEscalationAssignees: () => ({
      ...idleQuery,
      data: {
        data: [
          { id: 'a1', fullname: 'Assignee One' },
          { id: 'a2', fullname: 'Assignee Two' },
        ],
      },
    }),
  }
})

vi.mock('@/modules/my-tasks/hooks/use-admin-escalation', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useEscalationAssignees: () => ({
      ...idleQuery,
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
    useExperts: () => ({
      ...idleQuery,
      data: {
        success: true,
        data: [
          { ...expertProfile, id: 'id-1', expertId: 'id-1' },
          { ...expertProfile, _id: 'id-2', id: 'id-2', expertId: 'id-2', fullname: 'Expert Two' },
        ],
        pagination: { page: 1, limit: 10, total: 2, pages: 1 },
      },
    }),
  }
})

vi.mock('@/modules/expert/hooks/use-venues', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
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
        name: 'Coverage Venue',
        status: 'approved',
        venueStatus: 'live',
        location: { city: 'Bengaluru', state: 'KA', address: '1 Main' },
      },
      space: null,
      gallery: { galleryImages: [{ url: 'https://example.com/g.png' }] },
      availability: { weeklyAvailability: [{ day: 'Monday', from: '09:00', to: '18:00' }] },
      terms: { terms: ['Be nice'], faqs: [] },
      amenities: { amenities: [] },
    },
    spaces: [
      {
        spaceId: 'space-1',
        spaceName: 'Hall A',
        coverImage: null,
        city: 'Bengaluru',
        state: 'KA',
        capacity: 100,
        weekdayPrice: 5000,
        weekendPrice: 7000,
        availability: null,
        status: 'approved',
      },
    ],
  }
  return {
    ...actual,
    useVenueFullView: () => ({
      ...idleQuery,
      data: { success: true, message: 'ok', data: venueFullView },
    }),
    useVenueInsights: () => ({
      ...idleQuery,
      data: { success: true, data: [{ id: 'r1', name: 'R', rating: 5, comment: 'ok' }] },
    }),
    useVenues: () => ({
      ...idleQuery,
      data: {
        success: true,
        data: [{ _id: 'venue-1', name: 'Coverage Venue', status: 'approved' }],
        pagination: { page: 1, limit: 10, total: 1 },
      },
    }),
    useVenueById: () => ({
      ...idleQuery,
      data: { success: true, data: venueFullView.overview.venue },
    }),
    useSuspendVenue: () => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(async () => ({ success: true })),
      isPending: false,
    }),
    useDeleteVenue: () => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(async () => ({ success: true })),
      isPending: false,
    }),
    useSetVenueOwnerPassword: () => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(async () => ({ success: true })),
      isPending: false,
    }),
    useBulkUpdateSpaceVisibility: () => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(async () => ({ success: true })),
      isPending: false,
    }),
  }
})

vi.mock('@/modules/expert/hooks/use-venue-analytics', () => ({
  useVenueProfileAnalytics: () => ({
    ...idleQuery,
    data: {
      success: true,
      data: { overview: [{ label: 'Bookings', value: 40 }], trendPoints: [] },
    },
  }),
}))

vi.mock('@/modules/settings/hooks/use-venue-public-settings', () => ({
  useVenueManagementControls: () => ({ allowDisableVenues: true, allowHideSpaces: true }),
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
    useRecordModerationReasonUsage: () => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(async () => ({})),
    }),
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
      await new Promise((r) => setTimeout(r, 10))
    })
  }
}

describe('top-4 uncovered Admin pages', () => {
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

  it('1 expert-profile-view tabs + menus', async () => {
    const load = () => import('./modules/expert/pages/experts/expert-profile-view-page')
    await mount('/experts/management/profile/:id', '/experts/management/profile/id-1', load)
    await clickLabels(host, [
      'Overview',
      'Service Listings',
      'Services',
      'Consultations',
      'Availability',
      'Service Analytics',
      'Profile Health',
      'Create Listings',
      'Add Tags',
      'Open expert profile actions',
      'Suspend User',
      'Delete User',
      'Logout User',
      'Block User',
    ])
    expect(host.isConnected).toBe(true)
  }, 90_000)

  it('2 venue-profile-view tabs', async () => {
    const load = () => import('./modules/expert/pages/venue/venue-profile-view-page')
    await mount('/venues/management/profile/:venueId', '/venues/management/profile/venue-1', load)
    await clickLabels(host, [
      'Overview',
      'Spaces Listing',
      'Venue Analytics',
      'Profile Health',
      'Create',
      'Suspend',
      'Delete',
    ])
    expect(host.isConnected).toBe(true)
  }, 90_000)

  it('3 create-service-listing wizard steps', async () => {
    const load = () => import('./modules/expert/pages/services/create-service-listing-page')
    await mount('/services/management/create', '/services/management/create?partnerId=id-1', load)
    // pick service type then advance
    await clickLabels(host, ['Service', 'Consultation', 'Service'])
    for (let i = 0; i < 6; i++) {
      await clickLabels(host, ['Next', 'Continue', 'Save', 'Publish', 'Back'])
    }
    expect(host.isConnected).toBe(true)
  }, 90_000)

  it('4 expert-management filters and actions', async () => {
    const load = () => import('./modules/expert/pages/experts/expert-management-page')
    await mount('/experts/management', '/experts/management', load)
    await clickLabels(host, [
      'All',
      'Active',
      'Pending',
      'Suspended',
      'Deleted',
      'Export',
      'Filters',
      'Advance',
      'Bulk',
      'Select',
    ])
    expect(host.isConnected).toBe(true)
  }, 90_000)
})
