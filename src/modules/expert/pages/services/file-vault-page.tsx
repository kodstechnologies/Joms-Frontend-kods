import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Folder } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { InPageMediaViewer } from '@/shared/components/media/in-page-media-viewer'

import { useAdminConsultationBooking } from '../../hooks/use-consultation-drilldown'
import {
  useAdminChatVault,
  useAdminOrderDetail,
  useAdminServiceDetail,
} from '../../hooks/use-service-drilldown'
import { EmptyState, ShimmerBlock } from '../../components/service-drilldown/drilldown-primitives'
import { DrilldownHeader } from '../../components/service-drilldown/engagement-chrome'
import {
  consultationBookingPath,
  consultationPerformancePath,
  serviceDetailPath,
  serviceOrderDetailPath,
} from '../../lib/service-navigation'
import type { AdminVaultFile } from '../../type/service-drilldown'

const TABS = [
  { key: 'client', label: "Client's Files" },
  { key: 'expert', label: "Expert's Files" },
] as const

function truncateFileName(name: string) {
  if (name.length <= 18) return name
  const dot = name.lastIndexOf('.')
  if (dot <= 0) return `${name.slice(0, 14)}...`
  return `${name.slice(0, 12)}...${name.slice(dot)}`
}

function FileTile({ file }: { file: AdminVaultFile }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-[120px] flex-col items-center gap-2"
      >
        <div className="grid size-[110px] place-items-center rounded-xl bg-[#1A1A1A]">
          <Folder className="size-10 fill-[#F6CB86] text-[#F6CB86]" />
        </div>
        <p className="w-full truncate text-center text-[12px] text-white" title={file.fileName}>
          {truncateFileName(file.fileName)}
        </p>
      </button>
      <InPageMediaViewer
        open={open}
        items={[{ url: file.fileUrl, title: file.fileName }]}
        index={0}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

export function FileVaultPage() {
  const {
    expertId = '',
    serviceId = '',
    consultationId = '',
    orderId = '',
    bookingId = '',
  } = useParams<{
    expertId: string
    serviceId: string
    consultationId: string
    orderId: string
    bookingId: string
  }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isConsultation = Boolean(consultationId)
  const engagementId = bookingId || orderId
  const orderType = (searchParams.get('type') as 'order' | 'proposal' | null) ?? 'order'
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['key']>('expert')

  const orderQuery = useAdminOrderDetail(isConsultation ? undefined : orderId, orderType)
  const serviceQuery = useAdminServiceDetail(isConsultation ? undefined : serviceId)
  const bookingQuery = useAdminConsultationBooking(isConsultation ? bookingId : undefined)
  const order = orderQuery.data?.data
  const booking = bookingQuery.data?.data
  const threadId = (isConsultation ? booking?.threadId : order?.links.threadId) ?? undefined
  const vaultQuery = useAdminChatVault(threadId)
  const vault = vaultQuery.data?.data
  const files = activeTab === 'client' ? (vault?.clientFiles ?? []) : (vault?.expertFiles ?? [])
  const isLoading =
    (isConsultation ? bookingQuery.isLoading : orderQuery.isLoading) || vaultQuery.isLoading
  const expertName =
    (isConsultation ? booking?.expert?.name : order?.expert?.name) ||
    serviceQuery.data?.data.expert?.name ||
    'Expert'
  const listingTitle = isConsultation
    ? booking?.title || 'Consultation'
    : order?.links.serviceTitle || order?.engagement.title || 'Service Title'
  const clientName = (isConsultation ? booking?.client.name : order?.client.name) || 'Client'
  const backPath = isConsultation
    ? consultationBookingPath(expertId, consultationId, engagementId)
    : serviceOrderDetailPath(expertId, serviceId, orderId, orderType)
  const listingPath = isConsultation
    ? consultationPerformancePath(expertId, consultationId)
    : serviceDetailPath(expertId, serviceId)

  return (
    <div className="flex w-full flex-col gap-6 pb-8 text-white">
      <DrilldownHeader
        title={isConsultation ? 'Consultation Performance' : 'Service Details'}
        onBack={() => navigateBackOrFallback(navigate, backPath)}
        crumbs={[
          { label: 'Expert Management', onClick: () => navigate('/experts/management') },
          { label: expertName, onClick: () => navigate(`/experts/management/profile/${expertId}`) },
          {
            label: isConsultation ? 'Consultation Performance' : 'Service listing',
            onClick: () => navigate(listingPath),
          },
          { label: listingTitle },
          { label: clientName },
          { label: 'File Vault' },
        ]}
      />

      <button
        type="button"
        onClick={() => navigateBackOrFallback(navigate, backPath)}
        className="group flex w-fit items-center gap-2 text-lg font-bold text-white"
      >
        <span className="text-xl leading-none">‹</span>
        {listingTitle}
      </button>

      <div className="w-fit rounded-full bg-[#1A1A1A] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
              activeTab === tab.key ? 'bg-black text-white' : 'text-muted hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
          <ShimmerBlock className="h-[110px] w-[110px]" />
          <ShimmerBlock className="h-[110px] w-[110px]" />
          <ShimmerBlock className="h-[110px] w-[110px]" />
        </div>
      ) : !threadId ? (
        <EmptyState message="This engagement has no chat thread, so there are no shared files." />
      ) : files.length === 0 ? (
        <EmptyState
          message={
            activeTab === 'client'
              ? 'The client has not shared any files.'
              : 'The expert has not shared any files.'
          }
        />
      ) : (
        <ul className="flex flex-wrap gap-6">
          {files.map((file) => (
            <li key={file._id}>
              <FileTile file={file} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
