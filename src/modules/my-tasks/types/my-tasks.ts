export type TaskStatus = 'todo' | 'in_progress' | 'completed'

export type TaskTab = 'all' | TaskStatus | 'escalated_by_you'

export type MyTask = {
  id: string
  partnerId: string
  entityType?: 'partner' | 'service' | 'consultation' | 'venue_space'
  entityId?: string
  venueId?: string
  title: string
  description: string
  module: string
  moduleKey: string
  status: TaskStatus
  reviewStatus: string
  escalationTarget: 'kyc' | 'banking' | 'application'
  serviceType: string
  assigneeSubAdminId: string
  assigneeName: string
  escalatedByAdminId: string
  escalatedByName: string
  escalationNote: string
  escalatedAt: string
  applicationUrl: string
  direction: string
}

export type MyTasksGrouped = Record<TaskStatus, MyTask[]> & {
  escalated_by_you?: MyTask[]
}

export type MyTasksResponse = {
  success?: boolean
  data: {
    tasks: MyTask[]
    grouped: MyTasksGrouped
    meta: {
      total: number
      tab: string
    }
  }
}
