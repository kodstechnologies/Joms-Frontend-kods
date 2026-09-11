import type { ColumnDef } from '@tanstack/react-table'

import type { VenueReportItem } from '../components/venue-report-detail-modal'
import type { Venue } from '../type/venue'
import { getVenueDisplayId, getVenueDisplaySpaceId } from './venue-list'
import { getManagementStatusDisplay } from './management-status'
import { TableDateTimeCell } from '@/shared/components/table/table-datetime-cell'

export function pickVenuePreferenceColumns<T>(
  dataColumnsById: Record<string, ColumnDef<T>>,
  visibleIds: string[],
  fallbackIds: string[],
): ColumnDef<T>[] {
  const ids = visibleIds.length ? visibleIds : fallbackIds
  return ids.map((id) => dataColumnsById[id]).filter(Boolean) as ColumnDef<T>[]
}

export function createVenueSelectColumn({
  allVisibleSelected,
  someVisibleSelected,
  selectedVenueIds,
  toggleVisible,
  toggleOne,
  ariaLabel,
}: {
  allVisibleSelected: boolean
  someVisibleSelected: boolean
  selectedVenueIds: string[]
  toggleVisible: () => void
  toggleOne: (venueId: string) => void
  ariaLabel: string
}): ColumnDef<Venue> {
  return {
    id: 'select',
    header: () => (
      <input
        type="checkbox"
        aria-label={ariaLabel}
        checked={allVisibleSelected}
        ref={(input) => {
          if (input) input.indeterminate = someVisibleSelected && !allVisibleSelected
        }}
        onChange={toggleVisible}
        className="ui-table-checkbox"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={`Select ${row.original.venueName}`}
        checked={selectedVenueIds.includes(row.original._id)}
        onChange={() => toggleOne(row.original._id)}
        onClick={(event) => event.stopPropagation()}
        className="ui-table-checkbox"
      />
    ),
    meta: { headerClassName: 'pl-5', cellClassName: 'pl-5' },
  }
}

const venueIdCol = (): ColumnDef<Venue> => ({
  id: 'venue-id',
  accessorKey: 'venueid',
  header: 'Venue ID',
  cell: ({ row }) => (
    <span className="ui-table-id uppercase">{getVenueDisplayId(row.original)}</span>
  ),
})

const venueNameCol = (): ColumnDef<Venue> => ({
  id: 'venue-name',
  accessorKey: 'venueName',
  header: 'Venue Name',
  cell: ({ row }) => (
    <span className="font-medium text-white">{row.original.venueName || '—'}</span>
  ),
})

const adminIdCol = (): ColumnDef<Venue> => ({
  id: 'admin-id',
  accessorKey: 'adminId',
  header: 'Admin ID',
  cell: ({ row }) => <span className="ui-table-id">{row.original.adminId || 'ADM-001'}</span>,
})

const escalatedByCol = (): ColumnDef<Venue> => ({
  id: 'escalated-by',
  accessorKey: 'escalatedBy',
  header: 'Escalated By',
  cell: ({ row }) => <span className="text-slate-300">{row.original.escalatedBy || 'Admin'}</span>,
})

const escalationReasonCol = (): ColumnDef<Venue> => ({
  id: 'escalation-reason',
  accessorKey: 'escalationReason',
  header: 'Escalation Reason',
  cell: ({ row }) => <span className="text-slate-300">{row.original.escalationReason || '—'}</span>,
})

const escalatedAtCol = (): ColumnDef<Venue> => ({
  id: 'escalated-at',
  accessorKey: 'escalatedAt',
  header: 'Escalated At',
  cell: ({ row }) =>
    row.original.escalatedAt ? <TableDateTimeCell value={row.original.escalatedAt} /> : '—',
})

export function buildVenueDataColumnsById(): Record<string, ColumnDef<Venue>> {
  return {
    'suspension-id': {
      id: 'suspension-id',
      accessorKey: 'suspensionId',
      header: 'Suspension ID',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#E5B54E]">
          {row.original.suspensionId || `SUS-${getVenueDisplayId(row.original)}`}
        </span>
      ),
    },
    'deletion-id': {
      id: 'deletion-id',
      accessorKey: 'deletionId',
      header: 'Deletion ID',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#E5B54E]">
          {row.original.deletionId || `DEL-${getVenueDisplayId(row.original)}`}
        </span>
      ),
    },
    'venue-id': venueIdCol(),
    'venue-name': venueNameCol(),
    'suspension-reason': {
      id: 'suspension-reason',
      accessorKey: 'suspensionReason',
      header: 'Suspension Reason',
      cell: ({ row }) => (
        <span
          className="block max-w-[200px] truncate text-slate-300"
          title={row.original.suspensionReason || 'Policy Violation'}
        >
          {row.original.suspensionReason || row.original.reason || 'Policy Violation'}
        </span>
      ),
    },
    'suspended-by': {
      id: 'suspended-by',
      accessorKey: 'suspendedBy',
      header: 'Suspended By',
      cell: ({ row }) => (
        <span className="text-slate-300">{row.original.suspendedBy || 'Admin'}</span>
      ),
    },
    'admin-id': adminIdCol(),
    'suspended-at': {
      id: 'suspended-at',
      accessorKey: 'suspendedAt',
      header: 'Suspended At',
      cell: ({ row }) => (
        <TableDateTimeCell value={row.original.suspendedAt || row.original.updatedAt} />
      ),
    },
    'suspension-until': {
      id: 'suspension-until',
      accessorKey: 'suspensionUntil',
      header: 'Suspension Until',
      cell: ({ row }) => {
        const until = row.original.suspensionUntil
        return until && until !== 'Permanent' ? (
          <TableDateTimeCell value={until} />
        ) : (
          <span className="text-slate-400">Permanent</span>
        )
      },
    },
    'escalated-by': escalatedByCol(),
    'escalation-reason': escalationReasonCol(),
    'escalated-at': escalatedAtCol(),
    'compliance-status': {
      id: 'compliance-status',
      accessorKey: 'complianceStatus',
      header: 'Compliance Status',
      cell: ({ row }) => {
        const status = row.original.complianceStatus || row.original.status || 'Pending Review'
        const archived = status === 'Archived'
        const resolved = status === 'Resolved'
        return (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              archived
                ? 'border border-slate-700 bg-slate-800 text-slate-300'
                : resolved
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            {status}
          </span>
        )
      },
    },
    'deleted-by': {
      id: 'deleted-by',
      accessorKey: 'deletedBy',
      header: 'Deleted By',
      cell: ({ row }) => (
        <span className="text-slate-300">{row.original.deletedBy || 'Admin'}</span>
      ),
    },
    'deletion-reason': {
      id: 'deletion-reason',
      accessorKey: 'reason',
      header: 'Deletion Reason',
      cell: ({ row }) => (
        <span
          className="block max-w-[200px] truncate text-slate-300"
          title={row.original.deletionReason || row.original.reason || 'User Request'}
        >
          {row.original.deletionReason || row.original.reason || 'User Request'}
        </span>
      ),
    },
    'deleted-at': {
      id: 'deleted-at',
      accessorKey: 'deletedAt',
      header: 'Deleted At',
      cell: ({ row }) =>
        row.original.deletedAt ? (
          <TableDateTimeCell value={row.original.deletedAt} />
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    'venue-category': {
      id: 'venue-category',
      accessorKey: 'venueCategory',
      header: 'Venue Category',
      cell: ({ row }) => (
        <span className="text-slate-300">{row.original.venueCategory || '—'}</span>
      ),
    },
    'venue-type': {
      id: 'venue-type',
      accessorKey: 'venueType',
      header: 'Venue Type',
      cell: ({ row }) => (
        <span className="text-slate-300">
          {row.original.venueType || row.original.eventType || '—'}
        </span>
      ),
    },
    'venue-location': {
      id: 'venue-location',
      accessorKey: 'venueLocation',
      header: 'Venue Location',
      cell: ({ row }) => (
        <span
          className="block max-w-[200px] truncate text-slate-300"
          title={row.original.venueLocation}
        >
          {row.original.venueLocation || '—'}
        </span>
      ),
    },
    'venue-status': {
      id: 'venue-status',
      accessorKey: 'status',
      header: 'Venue Status',
      cell: ({ row }) => {
        const { label, className } = getManagementStatusDisplay(row.original.status, {
          isSuspend: row.original.isSuspend,
        })
        return <span className={className}>{label}</span>
      },
    },
    'space-id': {
      id: 'space-id',
      accessorKey: 'spaceid',
      header: 'Space ID',
      cell: ({ row }) => (
        <span className="ui-table-id">{getVenueDisplaySpaceId(row.original)}</span>
      ),
    },
    'space-name': {
      id: 'space-name',
      accessorKey: 'spaceName',
      header: 'Space Name',
      cell: ({ row }) => row.original.spaceName || '—',
    },
    'space-category': {
      id: 'space-category',
      accessorKey: 'spaceCategory',
      header: 'Space Category',
      cell: ({ row }) => (
        <span className="text-slate-300">{row.original.spaceCategory || '—'}</span>
      ),
    },
    'space-location': {
      id: 'space-location',
      accessorKey: 'spaceLocation',
      header: 'Space Location',
      cell: ({ row }) => (
        <span
          className="block max-w-[180px] truncate text-slate-300"
          title={row.original.spaceLocation}
        >
          {row.original.spaceLocation || '—'}
        </span>
      ),
    },
    'space-type': {
      id: 'space-type',
      accessorKey: 'spaceType',
      header: 'Space Type',
      cell: ({ row }) => <span className="text-slate-300">{row.original.spaceType || '—'}</span>,
    },
    'space-status': {
      id: 'space-status',
      accessorKey: 'spaceStatus',
      header: 'Space Status',
      cell: ({ row }) => {
        const status = row.original.spaceStatus || 'submitted'
        const { label, className } = getManagementStatusDisplay(status, {})
        return <span className={className}>{label}</span>
      },
    },
    city: {
      id: 'city',
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => row.original.city || '—',
    },
    'submitted-at': {
      id: 'submitted-at',
      accessorKey: 'submittedAt',
      header: 'Submitted At',
      cell: ({ row }) => <TableDateTimeCell value={row.original.createdAt} />,
    },
    'submitted-by': {
      id: 'submitted-by',
      accessorKey: 'submittedBy',
      header: 'Submitted By',
      cell: ({ row }) => (
        <span className="text-slate-300">
          {row.original.submittedBy || (row.original.ownerId ? 'Host' : 'Admin')}
        </span>
      ),
    },
  }
}

export function buildVenueReportDataColumnsById(): Record<string, ColumnDef<VenueReportItem>> {
  return {
    'report-id': {
      id: 'report-id',
      accessorKey: 'reportId',
      header: 'Report ID',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-[#E5B54E]">
          {row.original.reportId || 'VR000'}
        </span>
      ),
    },
    'venue-id': {
      id: 'venue-id',
      accessorKey: 'venueId',
      header: 'Venue ID',
      cell: ({ row }) => (
        <span className="ui-table-id uppercase">{row.original.venueId || '—'}</span>
      ),
    },
    'venue-name': {
      id: 'venue-name',
      accessorKey: 'venueName',
      header: 'Venue Name',
      cell: ({ row }) => (
        <span className="font-semibold text-white">{row.original.venueName || '—'}</span>
      ),
    },
    'report-reason': {
      id: 'report-reason',
      accessorKey: 'reason',
      header: 'Report Reason',
      cell: ({ row }) => (
        <div
          className="max-w-xs truncate text-xs text-slate-300"
          title={row.original.reason || row.original.issueType}
        >
          {row.original.reason || row.original.issueType || '—'}
        </div>
      ),
    },
    'reported-by': {
      id: 'reported-by',
      accessorKey: 'reporterName',
      header: 'Reported By',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-200">{row.original.reporterName || '—'}</div>
          <div className="text-[11px] text-slate-400">{row.original.reporterType || 'User'}</div>
        </div>
      ),
    },
    'reported-at': {
      id: 'reported-at',
      accessorKey: 'createdAt',
      header: 'Reported At',
      cell: ({ row }) => (
        <TableDateTimeCell value={row.original.submittedAt || row.original.createdAt} />
      ),
    },
    'escalated-by': {
      id: 'escalated-by',
      accessorKey: 'escalatedBy',
      header: 'Escalated By',
      cell: ({ row }) => (
        <span className="text-slate-300">{row.original.escalatedBy || 'Admin'}</span>
      ),
    },
    'escalation-reason': {
      id: 'escalation-reason',
      accessorKey: 'escalationReason',
      header: 'Escalation Reason',
      cell: ({ row }) => (
        <span className="text-slate-300">{row.original.escalationReason || '—'}</span>
      ),
    },
    'escalated-at': {
      id: 'escalated-at',
      accessorKey: 'escalatedAt',
      header: 'Escalated At',
      cell: ({ row }) =>
        row.original.escalatedAt ? <TableDateTimeCell value={row.original.escalatedAt} /> : '—',
    },
    'compliance-status': {
      id: 'compliance-status',
      accessorKey: 'investigationStatus',
      header: 'Compliance Status',
      cell: ({ row }) => {
        const status =
          row.original.complianceStatus || row.original.investigationStatus || 'Under Investigation'
        const isResolved = status === 'Resolved' || status === 'Closed'
        const isReview = status === 'Under Review' || status === 'Escalated'
        return (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isResolved
                ? 'bg-emerald-500/15 text-emerald-400'
                : isReview
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-blue-500/15 text-blue-400'
            }`}
          >
            {status}
          </span>
        )
      },
    },
  }
}
