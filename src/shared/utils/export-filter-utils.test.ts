import { describe, expect, it, vi } from 'vitest'

import {
  buildCategoryListQueryParams,
  buildCommunicationListQueryParams,
  buildEscalationsListQueryParams,
  buildExpertListQueryParams,
  buildExpertMembershipsListQueryParams,
  buildExpertProfileServicesQueryParams,
  buildFilterParams,
  buildFinanceEscrowListQueryParams,
  buildFinanceInvoicesListQueryParams,
  buildFinanceMembershipsListQueryParams,
  buildFinancePayoutsListQueryParams,
  buildFinanceRefundsListQueryParams,
  buildFinanceReconciliationListQueryParams,
  buildFinanceServicesListQueryParams,
  buildFinanceTaxListQueryParams,
  buildFinanceVenuesListQueryParams,
  buildPrefixedListQueryParams,
  buildReferralListQueryParams,
  buildRevenueListQueryParams,
  buildServiceListQueryParams,
  buildSupportTicketsListQueryParams,
  buildVenueCategoryListQueryParams,
  buildVenueListQueryParams,
  createCategoryFilteredExportHandler,
  createClientFilteredExportHandler,
  createCommunicationFilteredExportHandler,
  createFilteredExportHandler,
  createFinanceServicesFilteredExportHandler,
  createFinanceVenuesFilteredExportHandler,
  createReferralFilteredExportHandler,
  createRevenueFilteredExportHandler,
  createServiceFilteredExportHandler,
  createVenueCategoryFilteredExportHandler,
  createVenueFilteredExportHandler,
  rowMatchesClientFilters,
} from './export-filter-utils'

describe('export-filter-utils builders', () => {
  it('buildFilterParams flattens text, arrays, ranges, and location', () => {
    expect(
      buildFilterParams({
        'section.name': '  Ada  ',
        'section.tags': ['a', 'b'],
        'section.emptyArr': [],
        'section.amount': { from: '1', to: '9' },
        'section.location': { state: ' TN ', city: ' Chennai ' },
        'section.skip': '',
        bare: 'solo',
      }),
    ).toEqual({
      name: 'Ada',
      tags: 'a,b',
      amountMin: '1',
      amountMax: '9',
      locationState: 'TN',
      locationCity: 'Chennai',
      bare: 'solo',
    })
  })

  it('buildExpertListQueryParams maps colliding category keys and options', () => {
    const params = buildExpertListQueryParams(
      {
        'services.category': 'photo',
        'experts.category': 'expert-cat',
        'customers.totalOrders': { from: '1', to: '5' },
        'customers.onboardingDate': { from: '2024-01-01', to: '2024-12-31' },
        search: 'ada',
      },
      { page: 2, limit: 25, search: 'override', status: 'pending' },
    )

    expect(params.page).toBe(2)
    expect(params.limit).toBe(25)
    expect(params.status).toBe('pending')
    expect(params.search).toBe('override')
    expect(params.serviceCategory).toBe('photo')
    expect(params.category).toBe('expert-cat')
    expect(params.customerTotalOrdersMin).toBe('1')
    expect(params.customerTotalOrdersMax).toBe('5')
    expect(params.customerOnboardingDateMin).toBe('2024-01-01')
    expect(params.customerOnboardingDateMax).toBe('2024-12-31')
  })

  it('domain list builders accept filters and pagination options', () => {
    const filters = {
      'section.status': 'active',
      'section.amount': { from: '10', to: '20' },
      'section.location': { state: 'KA', city: 'BLR' },
      'section.tags': ['x'],
    }
    const opts = { page: 3, limit: 50, search: 'q' }

    expect(buildServiceListQueryParams(filters, opts).page).toBe(3)
    expect(buildCategoryListQueryParams(filters, opts).limit).toBe(50)
    expect(buildVenueListQueryParams(filters, opts).search).toBe('q')
    expect(buildVenueCategoryListQueryParams(filters, opts).page).toBe(3)
    expect(buildCommunicationListQueryParams(filters, opts).limit).toBe(50)
    expect(buildReferralListQueryParams(filters, opts).search).toBe('q')
    expect(buildRevenueListQueryParams(filters, opts).page).toBe(3)
    expect(buildFinanceServicesListQueryParams(filters, opts).limit).toBe(50)
    expect(buildFinanceVenuesListQueryParams(filters, opts).search).toBe('q')
    expect(buildFinanceMembershipsListQueryParams(filters, opts).page).toBe(3)
    expect(buildFinancePayoutsListQueryParams(filters, opts).limit).toBe(50)
    expect(buildFinanceRefundsListQueryParams(filters, opts).search).toBe('q')
    expect(buildFinanceTaxListQueryParams(filters, opts).page).toBe(3)
    expect(buildFinanceInvoicesListQueryParams(filters, opts).limit).toBe(50)
    expect(buildFinanceReconciliationListQueryParams(filters, opts).search).toBe('q')
    expect(buildFinanceEscrowListQueryParams(filters, opts).page).toBe(3)
    expect(buildExpertMembershipsListQueryParams(filters, opts).limit).toBe(50)
    expect(buildSupportTicketsListQueryParams(filters, opts).search).toBe('q')
    expect(buildExpertProfileServicesQueryParams(filters, opts).page).toBe(3)
    expect(buildPrefixedListQueryParams(filters, opts).page).toBe(3)
  })

  it('maps referral table search params to API query fields', () => {
    const params = buildReferralListQueryParams(
      { 'referral.status': ['pending'] },
      {
        page: 1,
        limit: 10,
        search: 'global',
        searchById: 'REF-001',
        searchByName: 'Jane',
        searchByStatus: 'pending',
        searchByDate: '2024-06-01',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    )

    expect(params.search).toBe('global')
    expect(params.referralId).toBe('REF-001')
    expect(params.referrerName).toBe('Jane')
    expect(params.status).toBe('pending')
    expect(params.createdAtFrom).toBe('2024-06-01')
    expect(params.createdAtTo).toBe('2024-06-01')
    expect(params.sortBy).toBe('createdAt')
    expect(params.sortOrder).toBe('desc')
  })

  it('maps escalation table search params to API query fields', () => {
    const params = buildEscalationsListQueryParams(
      { 'escalations.roleId': 'ROL-AD001' },
      {
        page: 1,
        limit: 10,
        search: 'ESC-123ABC',
        searchById: 'ESC-999999',
        searchByName: 'Reviewer',
        searchByStatus: 'Open',
        searchByDate: '2024-06-01',
      },
    )

    expect(params.search).toBe('ESC-123ABC')
    expect(params.escalationId).toBe('ESC-999999')
    expect(params.roleName).toBe('Reviewer')
    expect(params.status).toBe('Open')
    expect(params.createdOnMin).toBe('2024-06-01')
    expect(params.createdOnMax).toBe('2024-06-01')
    expect(params.roleId).toBe('ROL-AD001')
  })

  it('maps support ticket table search params and preserves tab options', () => {
    const params = buildSupportTicketsListQueryParams(
      { 'tickets.status': ['open'] },
      {
        page: 2,
        limit: 10,
        search: 'billing',
        searchById: 'TKT-1001',
        searchByName: 'Payment failed',
        searchByStatus: 'in_progress',
        searchByCategory: 'Payments',
        searchByDate: '2024-06-01',
        tab: 'my_tickets',
        includeClosed: true,
        sortBy: 'updatedAt',
        sortOrder: 'asc',
      },
    )

    expect(params.search).toBe('billing')
    expect(params.ticketId).toBe('TKT-1001')
    expect(params.subject).toBe('Payment failed')
    expect(params.status).toBe('in_progress')
    expect(params.category).toBe('Payments')
    expect(params.from).toBe('2024-06-01')
    expect(params.to).toBe('2024-06-01')
    expect(params.tab).toBe('my_tickets')
    expect(params.includeClosed).toBe(true)
    expect(params.sortBy).toBe('updatedAt')
    expect(params.sortOrder).toBe('asc')
    expect(params.page).toBe(2)
  })

  it('rowMatchesClientFilters and createFilteredExportHandler exercise export path', async () => {
    const accessors = { name: (r: { name: string }) => r.name }
    expect(rowMatchesClientFilters({ name: 'Ada' }, { name: 'Ada' }, '', accessors)).toBe(true)
    expect(rowMatchesClientFilters({ name: 'Ada' }, { name: 'Bob' }, '', accessors)).toBe(false)
    expect(rowMatchesClientFilters({ name: 'Ada' }, {}, 'ada', accessors)).toBe(true)
    expect(rowMatchesClientFilters({ name: 'Ada' }, {}, 'zoe', accessors)).toBe(false)

    const clicks: string[] = []
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: () => 'blob:export',
        revokeObjectURL: () => undefined,
      }),
    )
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)
    HTMLAnchorElement.prototype.click = function click() {
      clicks.push(this.getAttribute('download') || '')
    }

    const fetchRows = vi.fn(async () => [{ name: 'Ada' }])
    const handler = createFilteredExportHandler(
      fetchRows,
      { name: { header: 'Name', accessor: (r: { name: string }) => r.name } },
      'people',
    )
    await handler({ name: 'Ada' }, 'csv')
    expect(fetchRows).toHaveBeenCalled()
    expect(clicks.some((name) => name.endsWith('.csv'))).toBe(true)

    const columnMap = { name: { header: 'Name', accessor: (r: { name: string }) => r.name } }
    const wrapped = async () => ({ data: [{ name: 'Ada' }] })

    await createServiceFilteredExportHandler(wrapped, columnMap, 'services')({}, 'csv')
    await createCategoryFilteredExportHandler(wrapped, columnMap, 'categories')({}, 'csv')
    await createVenueFilteredExportHandler(wrapped, columnMap, 'venues')({}, 'csv')
    await createVenueCategoryFilteredExportHandler(
      wrapped,
      columnMap,
      'venue-categories',
    )({}, 'csv')
    await createCommunicationFilteredExportHandler(wrapped, columnMap, 'comms')({}, 'csv')
    await createReferralFilteredExportHandler(wrapped, columnMap, 'referrals')({}, 'csv')
    await createRevenueFilteredExportHandler(wrapped, columnMap, 'revenue')({}, 'csv')
    await createFinanceServicesFilteredExportHandler(wrapped, columnMap, 'fin-services')({}, 'csv')
    await createFinanceVenuesFilteredExportHandler(wrapped, columnMap, 'fin-venues')({}, 'csv')
    await createClientFilteredExportHandler(() => [{ name: 'Ada' }], columnMap, 'client')({}, 'csv')
  })
})
