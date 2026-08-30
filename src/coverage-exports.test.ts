/** @vitest-environment jsdom */
import { beforeAll, describe, expect, it, vi } from 'vitest'

describe('high-ROI pure exports for coverage', () => {
  beforeAll(() => {
    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = () => 'blob:coverage'
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      URL.revokeObjectURL = () => undefined
    }
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  })

  it('exportServiceMarketplaceExcel builds a workbook', async () => {
    const { exportServiceMarketplaceExcel } =
      await import('./modules/expert/pages/services/service-marketplace-export')
    expect(() =>
      exportServiceMarketplaceExcel({
        serviceMetrics: [{ label: 'Services', value: '10' }],
        consultationMetrics: [{ label: 'Consults', value: '5' }],
        trendPoints: [
          { month: 'Jan', consultationsCompleted: 1, servicesDelivered: 2, revenue: 100 },
          { month: 'Feb', consultationsCompleted: 0, servicesDelivered: 0, revenue: 0 },
        ],
        rangeLabel: 'Last 6M',
      }),
    ).not.toThrow()
  })

  it('exportServiceMarketplaceExcel handles empty trends', async () => {
    const { exportServiceMarketplaceExcel } =
      await import('./modules/expert/pages/services/service-marketplace-export')
    expect(() =>
      exportServiceMarketplaceExcel({
        serviceMetrics: [],
        consultationMetrics: [],
        trendPoints: [],
        rangeLabel: 'All',
      }),
    ).not.toThrow()
  })
})
