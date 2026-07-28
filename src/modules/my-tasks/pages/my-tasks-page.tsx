import { useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useMyTasks } from '../hooks/use-my-tasks'
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
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const time = date.toLocaleString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return isToday
    ? `Today, ${time}`
    : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

function StatusBadge({ status }: { status: TaskStatus }) {
  if (status === 'completed') {
    return (
      <span
        className="text-body-sm-semibold inline-flex h-5 items-center rounded px-2"
        style={{ backgroundColor: 'rgb(0 166 62 / 20%)', color: '#00A63E' }}
      >
        Completed
      </span>
    )
  }
  if (status === 'in_progress') {
    return (
      <span
        className="text-body-sm-semibold inline-flex h-5 items-center rounded px-2"
        style={{ backgroundColor: 'rgb(20 71 230 / 20%)', color: '#1447E6' }}
      >
        In-Progress
      </span>
    )
  }
  return (
    <span
      className="text-body-sm-semibold inline-flex h-5 items-center rounded px-2"
      style={{ backgroundColor: 'rgb(246 203 134 / 20%)', color: '#F6CB86' }}
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
      className="radius-lg bg-brand-surface hover:border-brand-accent/30 flex w-full items-start justify-between gap-4 border border-white/5 px-4 py-4 text-left transition-colors"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="bg-brand-bg text-brand-accent mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg">
          <ClipboardList className="size-3.5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-body-md-semibold text-brand-text">{task.title}</p>
            {showStatus && <StatusBadge status={task.status} />}
          </div>
          <p className="text-body-sm text-muted mt-1 leading-relaxed">{task.description}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span
          className="text-body-sm-semibold inline-flex h-5 items-center rounded px-2"
          style={{ backgroundColor: 'rgb(0 166 62 / 20%)', color: '#00A63E' }}
        >
          {task.module}
        </span>
        <span className="text-body-sm text-muted inline-flex h-5 items-center">
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
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-body-md-semibold text-brand-text">{title}</h2>
        <span className="text-body-sm-semibold bg-brand-accent inline-flex h-[22px] items-center rounded-full px-2 font-bold text-black">
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

export function MyTasksPage() {
  const navigate = useNavigate()
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
    navigate(task.applicationUrl)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-brand-text font-bold">My Tasks</h1>
        <p className="text-body-md text-muted mt-1">Manage all the task assigned to you.</p>
      </div>

      <div className="flex flex-wrap gap-6 border-b border-white/10">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'text-body-md-semibold pb-3 transition-colors',
              activeTab === tab.key
                ? 'border-brand-accent text-brand-accent border-b-2'
                : 'text-muted hover:text-brand-text',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="border-brand-accent size-9 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      ) : isError ? (
        <div className="radius-lg border-brand-danger/30 bg-brand-danger/10 text-body-md text-brand-danger border px-4 py-3">
          Failed to load tasks.
        </div>
      ) : activeTab === 'all' ? (
        <div className="space-y-8">
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
            <div className="radius-lg bg-brand-surface text-body-md text-muted border border-white/5 px-4 py-8 text-center">
              No tasks assigned yet.
              <p className="text-body-sm text-muted mt-2">
                Escalated expert applications assigned to you will appear here.
              </p>
            </div>
          ) : null}
        </div>
      ) : activeTab === 'escalated_by_you' ? (
        tasks.length ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onOpen={handleOpenTask} showStatus />
            ))}
          </div>
        ) : (
          <div className="radius-lg bg-brand-surface text-body-md text-muted border border-white/5 px-4 py-8 text-center">
            No escalated tasks.
          </div>
        )
      ) : tasks.length ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={handleOpenTask} />
          ))}
        </div>
      ) : (
        <div className="radius-lg bg-brand-surface text-body-md text-muted border border-white/5 px-4 py-8 text-center">
          No tasks in this section.
        </div>
      )}
    </div>
  )
}
