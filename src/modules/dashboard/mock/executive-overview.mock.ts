import {
  DEFAULT_EXECUTIVE_METRIC_IDS,
  EXECUTIVE_OVERVIEW_MODULE_KEY,
} from '@/modules/dashboard/config/executive-overview-metrics.config'
import type { StatCardProps } from '@/shared/components/dashboard/stat-card'

export type ExecutiveKpiStat = StatCardProps & { id: string }

export { DEFAULT_EXECUTIVE_METRIC_IDS, EXECUTIVE_OVERVIEW_MODULE_KEY }
