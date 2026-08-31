import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  Hourglass,
  Landmark,
  MessageSquare,
} from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

import type { OrderMilestone } from '../../type/service-drilldown'
import { DASH, formatCurrency } from './drilldown-format'
import { milestoneChrome, type StatusTone } from './engagement-tone'

export type { StatusTone } from './engagement-tone'

export type Crumb = { label: string; onClick?: () => void }

export function PersonAvatar({
  name,
  src,
  size = 'md',
}: {
  name?: string | null
  src?: string | null
  size?: 'sm' | 'md'
}) {
  const initials =
    String(name || 'U')
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U'
  const box = size === 'sm' ? 'size-9 text-[11px]' : 'size-12 text-sm'

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Profile'}
        className={cn('shrink-0 rounded-full object-cover', box)}
      />
    )
  }

  return (
    <div
      className={cn(
        'bg-brand-accent/20 text-brand-accent grid shrink-0 place-items-center rounded-full font-bold',
        box,
      )}
    >
      {initials}
    </div>
  )
}

export function DrilldownHeader({
  title,
  onBack,
  crumbs,
  subtitleBack,
  actions,
}: {
  title: string
  onBack: () => void
  crumbs?: Crumb[]
  subtitleBack?: { label: string; onClick: () => void }
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="group font-heading hover:text-brand-accent text-h3 flex w-fit items-center gap-2 font-bold tracking-tight text-white transition-colors"
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span>{title}</span>
        </button>

        {subtitleBack ? (
          <button
            type="button"
            onClick={subtitleBack.onClick}
            className="text-body-sm mt-1 flex w-fit items-center gap-2 pl-7 font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            {subtitleBack.label}
          </button>
        ) : null}

        {crumbs?.length ? (
          <div className="text-body-sm text-muted mt-1 flex flex-wrap items-center gap-1.5 pl-7 font-medium">
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1
              return (
                <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 ? <span>/</span> : null}
                  {crumb.onClick && !isLast ? (
                    <button
                      type="button"
                      onClick={crumb.onClick}
                      className="hover:text-brand-text transition-colors"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className={isLast ? 'font-bold text-white' : undefined}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div>
      ) : null}
    </header>
  )
}

export function GoldActionButton({
  children,
  onClick,
  badge,
}: {
  children: ReactNode
  onClick: () => void
  badge?: number
}) {
  return (
    <Button
      variant="primary"
      className="relative h-10 gap-2 rounded-lg px-4 text-sm font-semibold"
      onClick={onClick}
    >
      {children}
      {typeof badge === 'number' ? (
        <span className="absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
          {String(badge).padStart(2, '0')}
        </span>
      ) : null}
    </Button>
  )
}

export function OutlineActionButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <Button
      variant="outline"
      className="h-10 gap-2 rounded-lg px-4 text-sm font-semibold"
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export function FileVaultButton({ onClick, count }: { onClick: () => void; count?: number }) {
  return (
    <GoldActionButton onClick={onClick} badge={count}>
      <FolderOpen className="size-4" aria-hidden="true" />
      File Vault
    </GoldActionButton>
  )
}

export function MonitorMessagesButton({ onClick }: { onClick: () => void }) {
  return (
    <GoldActionButton onClick={onClick}>
      <MessageSquare className="size-4" aria-hidden="true" />
      Monitor Messages
    </GoldActionButton>
  )
}

const TONE_BAR: Record<StatusTone, string> = {
  success: 'bg-[#23783F]',
  active: 'bg-[#8A5A2B]',
  idle: 'bg-[#3A3A3A]',
  danger: 'bg-[#7A2E2E]',
}

export function StatusBar({
  paymentLabel,
  workLabel,
  tone,
  onPaymentClick,
}: {
  paymentLabel: string
  workLabel: string
  tone: StatusTone
  onPaymentClick?: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-5 py-3 text-sm font-semibold text-white',
        TONE_BAR[tone],
      )}
    >
      <button
        type="button"
        onClick={onPaymentClick}
        disabled={!onPaymentClick}
        className="flex items-center gap-2 disabled:cursor-default"
      >
        <Landmark className="size-4" aria-hidden="true" />
        {paymentLabel}
      </button>
      <span className="flex items-center gap-2">
        {workLabel === 'Completed' ? (
          <CheckCircle2 className="size-4.5 fill-white text-[#23783F]" aria-hidden="true" />
        ) : workLabel === 'Ongoing' || workLabel === 'Pending Review' ? (
          <Hourglass className="size-4" aria-hidden="true" />
        ) : (
          <ClipboardList className="size-4" aria-hidden="true" />
        )}
        {workLabel}
      </span>
    </div>
  )
}

export function EngagementCard({
  typeLabel,
  title,
  description,
  timeline,
  allottedFund,
  currency,
  paymentLabel,
  workLabel,
  tone,
  onPaymentClick,
}: {
  typeLabel: string
  title: string
  description?: string | null
  timeline?: string | null
  allottedFund: number
  currency: string
  paymentLabel: string
  workLabel: string
  tone: StatusTone
  onPaymentClick?: () => void
}) {
  return (
    <article className="w-[355px] max-w-full overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#141414]">
      <StatusBar
        paymentLabel={paymentLabel}
        workLabel={workLabel}
        tone={tone}
        onPaymentClick={onPaymentClick}
      />
      <div className="px-6 py-5">
        <p className="text-muted text-[12px] font-medium">{typeLabel}</p>
        <h2 className="mt-1 text-lg font-bold text-white">{title}</h2>
        {description ? (
          <p className="text-muted mt-3 text-sm leading-relaxed">{description}</p>
        ) : null}
        <div className="mt-6 grid grid-cols-2 gap-6 border-t border-white/[0.08] pt-4">
          <FundStat
            icon={<Calendar className="size-4" />}
            label="Timelines"
            value={timeline || DASH}
            align="left"
          />
          <FundStat
            icon={<Landmark className="size-4" />}
            label="Allotted Fund"
            value={formatCurrency(allottedFund, currency, 2)}
            align="right"
          />
        </div>
      </div>
    </article>
  )
}

export function MilestoneStatusCard({
  milestone,
  currency,
}: {
  milestone: OrderMilestone
  currency: string
}) {
  const chrome = milestoneChrome(milestone)
  const milestoneLabel = `Milestone ${milestone.index + 1}`
  const cleanTitle =
    milestone.title.replace(/^milestone\s*\d*\s*[:\-–—]?\s*/i, '').trim() || milestone.title

  return (
    <article className="w-[355px] max-w-full overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#141414]">
      <StatusBar
        paymentLabel={chrome.paymentLabel}
        workLabel={chrome.workLabel}
        tone={chrome.tone}
      />
      <div className="px-5 py-4">
        <p className="text-muted text-[12px] font-medium">{milestoneLabel}</p>
        <h3 className="mt-1 text-sm font-bold text-white">{cleanTitle}</h3>
        {milestone.description || milestone.goal ? (
          <p className="text-muted mt-2.5 line-clamp-3 text-[12px] leading-relaxed">
            {milestone.description || milestone.goal}
          </p>
        ) : null}
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-4">
          <FundStat
            icon={<Calendar className="size-3.5" />}
            label="Timelines"
            value={milestone.timeline || DASH}
            align="left"
          />
          <FundStat
            icon={<Landmark className="size-3.5" />}
            label="Allotted Fund"
            value={formatCurrency(milestone.advanceAmount ?? milestone.price, currency, 2)}
            align="right"
          />
        </div>
      </div>
    </article>
  )
}

function FundStat({
  icon,
  label,
  value,
  align = 'left',
}: {
  icon: ReactNode
  label: string
  value: string
  align?: 'left' | 'right'
}) {
  return (
    <div className={cn(align === 'right' ? 'text-right' : 'text-left')}>
      <p className="text-muted text-[11px]">{label}</p>
      <p
        className={cn(
          'mt-1 flex items-center gap-2 text-sm font-semibold text-white',
          align === 'right' ? 'justify-end' : 'justify-start',
        )}
      >
        <span className="text-white/80">{icon}</span>
        <span>{value}</span>
      </p>
    </div>
  )
}

export function PairingRow({
  expertName,
  expertRole,
  expertAvatar,
  clientName,
  clientRole,
  clientAvatar,
}: {
  expertName?: string | null
  expertRole?: string | null
  expertAvatar?: string | null
  clientName?: string | null
  clientRole?: string | null
  clientAvatar?: string | null
}) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <PersonBlock name={expertName || 'Expert'} role={expertRole} avatar={expertAvatar} />
      <ArrowLeftRight className="text-muted size-5" aria-hidden="true" />
      <PersonBlock
        name={clientName || 'Client'}
        role={clientRole || 'Client'}
        avatar={clientAvatar}
      />
    </div>
  )
}

function PersonBlock({
  name,
  role,
  avatar,
}: {
  name: string
  role?: string | null
  avatar?: string | null
}) {
  return (
    <div className="flex items-center gap-3">
      <PersonAvatar name={name} src={avatar} />
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          {name}
          <MessageSquare className="text-muted size-3.5" aria-hidden="true" />
        </p>
        {role ? <p className="text-muted text-[11px]">{role}</p> : null}
      </div>
    </div>
  )
}

export function InfoPill({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white">
      {value}
    </span>
  )
}
