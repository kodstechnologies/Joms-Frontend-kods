import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Ban, Copy, Eye, FileBarChart, Pause, Play } from 'lucide-react'

import type { Communication, CommunicationStatus } from '../api/communication-api'
import {
  useCancelCommunication,
  useDeleteCommunication,
  useDuplicateCommunication,
  usePauseCommunication,
  useResumeCommunication,
} from '../hooks/use-communications'
import {
  TableActionsDropdown,
  TableActionsItem,
} from '@/shared/components/table/table-actions-dropdown'
import { ExportDataIcon } from '@/shared/components/icons/action-button-icons'
import { getApiErrorMessage } from '@/shared/lib/api-error'
import { useDefaultExportFormat } from '@/modules/settings/hooks/use-default-export-format'
import { exportMappedItemsToFile } from '@/shared/utils/export-filter-utils'
import { exportDisplayValue } from '@/shared/utils/export-utils'

import editIcon from '@/assets/JOMS_ICONS-2/edit.svg'
import deleteIcon from '@/assets/JOMS_ICONS-2/icons8-delete.svg'

const canEdit = (status: CommunicationStatus) =>
  !['processing', 'sent', 'delivered'].includes(status)

const canCancel = (status: CommunicationStatus) =>
  !['sent', 'delivered', 'cancelled'].includes(status)

const canPause = (status: CommunicationStatus) => status === 'scheduled' || status === 'active'

const canResume = (status: CommunicationStatus) => status === 'paused'

const canDelete = (status: CommunicationStatus) =>
  status === 'draft' || status === 'cancelled' || status === 'failed'

const ANALYTICS_EXPORT_COLUMN_MAP: Record<
  string,
  { header: string; accessor: (c: Communication) => string }
> = {
  'message-id': { header: 'Message ID', accessor: (c) => exportDisplayValue(c.messageId) },
  'campaign-id': { header: 'Campaign ID', accessor: (c) => exportDisplayValue(c.campaignId) },
  title: { header: 'Title', accessor: (c) => exportDisplayValue(c.title) },
  channel: { header: 'Channel', accessor: (c) => exportDisplayValue(c.channelLabel) },
  status: { header: 'Status', accessor: (c) => exportDisplayValue(c.statusLabel) },
  sent: {
    header: 'Sent',
    accessor: (c) => exportDisplayValue(c.analytics?.sent ?? 0),
  },
  delivered: {
    header: 'Delivered',
    accessor: (c) => exportDisplayValue(c.analytics?.delivered ?? c.deliveredCount),
  },
  opened: {
    header: 'Opened',
    accessor: (c) => exportDisplayValue(c.analytics?.opened ?? 0),
  },
  clicked: {
    header: 'Clicked',
    accessor: (c) => exportDisplayValue(c.analytics?.clicked ?? 0),
  },
  failed: {
    header: 'Failed',
    accessor: (c) => exportDisplayValue(c.analytics?.failed ?? c.failedCount),
  },
  bounced: {
    header: 'Bounced',
    accessor: (c) => exportDisplayValue(c.analytics?.bounced ?? 0),
  },
  'open-rate': { header: 'Open Rate', accessor: (c) => `${c.openRate ?? 0}%` },
  'click-rate': { header: 'Click Rate', accessor: (c) => `${c.clickRate ?? 0}%` },
}

export function CommunicationActions({ communication }: { communication: Communication }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { fileFormat } = useDefaultExportFormat()
  const deleteMutation = useDeleteCommunication()
  const duplicateMutation = useDuplicateCommunication()
  const cancelMutation = useCancelCommunication()
  const pauseMutation = usePauseCommunication()
  const resumeMutation = useResumeCommunication()

  const handleExportAnalytics = useCallback(async () => {
    try {
      await exportMappedItemsToFile(
        ANALYTICS_EXPORT_COLUMN_MAP,
        [communication],
        fileFormat,
        `communication_analytics_${communication.messageId || communication.id}`,
      )
      toast.success('Analytics exported')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to export analytics'))
    }
  }, [communication, fileFormat])

  return (
    <TableActionsDropdown
      label="Communication actions"
      isOpen={open}
      onOpenChange={setOpen}
      menuWidth={200}
      maxVisibleItems={8}
    >
      <TableActionsItem
        icon={<Eye className="size-3.5" />}
        className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
        onClick={() => {
          setOpen(false)
          navigate(`/communication/view/${communication.id}`)
        }}
      >
        View Details
      </TableActionsItem>
      {canEdit(communication.status) ? (
        <TableActionsItem
          icon={<img src={editIcon} alt="" className="size-3.5" aria-hidden="true" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setOpen(false)
            navigate(`/communication/create?edit=${communication.id}`)
          }}
        >
          Edit
        </TableActionsItem>
      ) : null}
      <TableActionsItem
        icon={<Copy className="size-3.5" />}
        className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
        onClick={() => {
          setOpen(false)
          duplicateMutation.mutate(communication.id, {
            onSuccess: () => toast.success('Communication duplicated as a draft'),
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }}
      >
        Duplicate
      </TableActionsItem>
      {canPause(communication.status) ? (
        <TableActionsItem
          icon={<Pause className="size-3.5" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setOpen(false)
            pauseMutation.mutate(communication.id, {
              onSuccess: () => toast.success('Campaign paused'),
              onError: (error) => toast.error(getApiErrorMessage(error)),
            })
          }}
        >
          Pause Campaign
        </TableActionsItem>
      ) : null}
      {canResume(communication.status) ? (
        <TableActionsItem
          icon={<Play className="size-3.5" />}
          className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => {
            setOpen(false)
            resumeMutation.mutate(communication.id, {
              onSuccess: () => toast.success('Campaign resumed'),
              onError: (error) => toast.error(getApiErrorMessage(error)),
            })
          }}
        >
          Resume Campaign
        </TableActionsItem>
      ) : null}
      {canCancel(communication.status) ? (
        <TableActionsItem
          icon={<Ban className="size-3.5" />}
          className="text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger"
          onClick={() => {
            setOpen(false)
            cancelMutation.mutate(communication.id, {
              onSuccess: () => toast.success('Communication withdrawn'),
              onError: (error) => toast.error(getApiErrorMessage(error)),
            })
          }}
        >
          Cancel
        </TableActionsItem>
      ) : null}
      {canDelete(communication.status) ? (
        <TableActionsItem
          icon={<img src={deleteIcon} alt="" className="size-3.5" aria-hidden="true" />}
          className="text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger"
          onClick={() => {
            setOpen(false)
            deleteMutation.mutate(communication.id, {
              onSuccess: () => toast.success('Communication deleted'),
              onError: (error) => toast.error(getApiErrorMessage(error)),
            })
          }}
        >
          Delete
        </TableActionsItem>
      ) : null}
      <TableActionsItem
        icon={<FileBarChart className="size-3.5" />}
        className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
        onClick={() => {
          setOpen(false)
          navigate(`/communication/view/${communication.id}#delivery-report`)
        }}
      >
        View Delivery Report
      </TableActionsItem>
      <TableActionsItem
        icon={<ExportDataIcon className="size-3.5" />}
        className="text-slate-800 hover:bg-slate-100 hover:text-slate-900"
        onClick={() => {
          setOpen(false)
          void handleExportAnalytics()
        }}
      >
        Export Analytics
      </TableActionsItem>
    </TableActionsDropdown>
  )
}

export function CommunicationStatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, { bg: string; color: string }> = {
    Sent: { bg: 'rgb(0 166 62 / 15%)', color: '#00A63E' },
    Delivered: { bg: 'rgb(0 166 62 / 15%)', color: '#00A63E' },
    Active: { bg: 'rgb(0 166 62 / 15%)', color: '#00A63E' },
    Scheduled: { bg: 'rgb(246 203 134 / 15%)', color: '#F6CB86' },
    Processing: { bg: 'rgb(246 203 134 / 15%)', color: '#F6CB86' },
    Paused: { bg: 'rgb(246 203 134 / 15%)', color: '#F6CB86' },
    Draft: { bg: 'rgb(255 255 255 / 10%)', color: '#B3B3B3' },
    Failed: { bg: 'rgb(211 25 28 / 15%)', color: '#D3191C' },
    Cancelled: { bg: 'rgb(211 25 28 / 15%)', color: '#D3191C' },
  }

  const style = statusStyles[status] ?? { bg: 'rgb(255 255 255 / 10%)', color: '#B3B3B3' }

  return (
    <span
      className="text-body-sm-semibold inline-flex h-5 items-center rounded px-2"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  )
}
