import { useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'

import { useMyTasks } from '../hooks/use-my-tasks'
import { useOpenEscalation } from '../hooks/use-open-escalation'
import type { MyTask, TaskStatus, TaskTab } from '../types/my-tasks'
import { useAuthStore } from '@/modules/auth/store/auth-store'
import { cn } from '@/shared/lib/cn'

const TABS: { key: TaskTab; label: string; superAdminOnly?: boolean }[] = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In-Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'escalated_by_you', label: 'Escalated by you', superAdminOnly: true },
]

const STATUS_SECTIONS: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To do' },
  { key: 'in_progress', label: 'In-Progress' },
  { key: 'completed', label: 'Completed' },
]

const formatTaskTime = (value?: string) => {
  if (!value) return 'Today ,12:30 PM'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Today ,12:30 PM'

  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const time = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return isToday
    ? `Today ,${time}`
    : `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ,${time}`
}

function StatusBadge({ status }: { status: TaskStatus }) {
  if (status === 'completed') {
    return (
      <span
        className="inline-flex h-5 items-center justify-center rounded-full px-3 text-[11px] font-medium"
        style={{ backgroundColor: 'rgba(0, 166, 62, 0.20)', color: '#00D062' }}
      >
        Completed
      </span>
    )
  }
  if (status === 'in_progress') {
    return (
      <span
        className="inline-flex h-5 items-center justify-center rounded-full px-3 text-[11px] font-medium"
        style={{ backgroundColor: 'rgba(21, 93, 252, 0.20)', color: '#60A5FA' }}
      >
        In-Progress
      </span>
    )
  }
  return (
    <span
      className="inline-flex h-5 items-center justify-center rounded-full px-3 text-[11px] font-medium"
      style={{ backgroundColor: 'rgba(246, 203, 134, 0.20)', color: '#F6CB86' }}
    >
      Pending
    </span>
  )
}

function TaskCard({
  task,
  onOpen,
  showStatus,
}: {
  task: MyTask
  onOpen: (task: MyTask) => void
  showStatus?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className="group flex min-h-[76px] w-full items-center justify-between gap-4 rounded-[10px] bg-[#000000] px-5 py-4 text-left transition-colors hover:bg-white/[0.04] sm:min-h-[80px]"
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <ClipboardList
          className="size-5 shrink-0 text-white/80 transition-colors group-hover:text-white"
          strokeWidth={1.75}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14px] font-semibold text-white">{task.title}</p>
            {showStatus && <StatusBadge status={task.status} />}
          </div>
          <p className="mt-0.5 truncate text-[12px] leading-normal text-white/50">
            {task.description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="inline-flex h-5 items-center justify-center rounded-full bg-[#00A63E]/20 px-3 text-[11px] font-medium text-[#00D062]">
          {task.module || 'User Management'}
        </span>
        <span className="inline-flex items-center text-xs font-semibold tracking-tight text-white">
          {formatTaskTime(task.escalatedAt)}
        </span>
      </div>
    </button>
  )
}

function TaskSection({
  title,
  count,
  tasks,
  onOpen,
  showStatus,
}: {
  title: string
  count: number
  tasks: MyTask[]
  onOpen: (task: MyTask) => void
  showStatus?: boolean
}) {
  if (!tasks.length) return null

  return (
    <section className="space-y-4 rounded-xl bg-[#141414] p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <span className="inline-flex h-[18px] items-center justify-center rounded-full bg-[#F6CB86] px-2 text-[10px] font-bold text-black">
          {String(count).padStart(2, '0')}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onOpen} showStatus={showStatus} />
        ))}
      </div>
    </section>
  )
}

function TaskCardSkeleton() {
  return (
    <div className="space-y-4 rounded-xl bg-[#141414] p-5 sm:p-6">
      <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`skel-row-${index}`}
            className="flex min-h-[80px] w-full items-center justify-between gap-4 rounded-[10px] bg-[#000000] px-5 py-4"
          >
            <div className="flex flex-1 items-center gap-3.5">
              <div className="size-5 shrink-0 animate-pulse rounded bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-44 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-72 animate-pulse rounded bg-white/5" />
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="h-5 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MyTasksPage() {
  const openEscalation = useOpenEscalation()
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<TaskTab>('all')
  const { data, isLoading, isError } = useMyTasks(activeTab)
  const { data: escalatedData } = useMyTasks('escalated_by_you')

  const visibleTabs = useMemo(
    () => TABS.filter((tab) => !tab.superAdminOnly || user?.isSuperAdmin),
    [user?.isSuperAdmin],
  )

  const tasks = data?.data.tasks ?? []
  const grouped = data?.data.grouped
  const escalatedTasks = escalatedData?.data.tasks ?? []

  const handleOpenTask = (task: MyTask) => {
    openEscalation({
      entityType: task.entityType,
      entityId: task.entityId,
      venueId: task.venueId,
      serviceType: task.serviceType,
      applicationUrl: task.applicationUrl,
      escalationTarget: task.escalationTarget,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">My Tasks</h1>
        <p className="mt-1 text-xs text-white/50">Manage all the task assigned to you.</p>
      </div>

      <div className="flex flex-wrap gap-8 border-b border-white/10">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'pb-3 text-xs font-medium transition-colors sm:text-sm',
              activeTab === tab.key
                ? 'border-b-2 border-[#E0A263] text-[#E0A263]'
                : 'text-white/50 hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <TaskCardSkeleton key={`task-skeleton-${index}`} />
          ))}
        </div>
      ) : isError ? (
        <div className="border-brand-danger/30 bg-brand-danger/10 text-body-md text-brand-danger rounded-xl border px-4 py-3">
          Failed to load tasks.
        </div>
      ) : activeTab === 'all' ? (
        <div className="space-y-5">
          {STATUS_SECTIONS.map((section) => (
            <TaskSection
              key={section.key}
              title={section.label}
              count={grouped?.[section.key]?.length ?? 0}
              tasks={grouped?.[section.key] ?? []}
              onOpen={handleOpenTask}
            />
          ))}
          {escalatedTasks.length > 0 && (
            <TaskSection
              title="Escalated by you"
              count={escalatedTasks.length}
              tasks={escalatedTasks}
              onOpen={handleOpenTask}
              showStatus
            />
          )}
          {!grouped?.todo?.length &&
          !grouped?.in_progress?.length &&
          !grouped?.completed?.length &&
          !escalatedTasks.length ? (
            <div className="text-body-md rounded-xl bg-[#141414] px-4 py-8 text-center text-white/50">
              No tasks assigned yet.
              <p className="text-body-sm mt-2 text-white/40">
                Escalated expert applications assigned to you will appear here.
              </p>
            </div>
          ) : null}
        </div>
      ) : activeTab === 'escalated_by_you' ? (
        tasks.length ? (
          <section className="space-y-3 rounded-xl bg-[#141414] p-5 sm:p-6">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onOpen={handleOpenTask} showStatus />
            ))}
          </section>
        ) : (
          <div className="text-body-md rounded-xl bg-[#141414] px-4 py-8 text-center text-white/50">
            No escalated tasks.
          </div>
        )
      ) : tasks.length ? (
        <section className="space-y-3 rounded-xl bg-[#141414] p-5 sm:p-6">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={handleOpenTask} />
          ))}
        </section>
      ) : (
        <div className="text-body-md rounded-xl bg-[#141414] px-4 py-8 text-center text-white/50">
          No tasks in this section.
        </div>
      )}
    </div>
  )
}
