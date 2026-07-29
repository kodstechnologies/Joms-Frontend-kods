import { activityMock, chatMessagesMock, queueTicketsMock } from '../mock/support.mock'
import { useSupportStore } from '../store/support-store'
import { TicketCasePanel } from '../components/ticket-case-panel'
import { TicketFilterPanel } from '../components/ticket-filter-panel'
import { TicketIntelligencePanel } from '../components/ticket-intelligence-panel'
import { TicketMessagesPanel } from '../components/ticket-messages-panel'
import { TicketQueuePanel } from '../components/ticket-queue-panel'
import { cn } from '@/shared/lib/cn'

export function SupportWorkspacePage() {
  const {
    searchQuery,
    setSearchQuery,
    selectedTicketId,
    setSelectedTicketId,
    workspaceTab,
    setWorkspaceTab,
    showFilters,
    setShowFilters,
  } = useSupportStore()

  const selected = queueTicketsMock.find((t) => t.id === selectedTicketId) ?? queueTicketsMock[0]

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h2 text-brand-text font-semibold tracking-tight">
            Support Management
          </h1>
          <span className="text-body-sm-semibold border-brand-positive/30 bg-brand-positive/10 text-brand-positive inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5">
            <span className="bg-brand-positive size-1.5 rounded-full" />
            Live Context Active
          </span>
        </div>
        <p className="text-body-md text-muted mt-1">
          Decision-centric workspace for high-impact tickets requiring approval, enforcement, or
          oversight.
        </p>
      </div>

      <div className="grid min-h-[calc(100vh-220px)] grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <TicketQueuePanel
            tickets={queueTicketsMock}
            selectedId={selected.id}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelect={setSelectedTicketId}
            onToggleFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            filterPanel={
              <TicketFilterPanel
                onApply={() => setShowFilters(false)}
                onClear={() => setShowFilters(false)}
              />
            }
          />
        </div>

        <div className="radius-lg bg-brand-surface flex flex-col gap-4 border border-white/10 p-5 lg:col-span-5">
          <div className="radius-lg bg-brand-bg flex gap-1 border border-white/5 p-1">
            {(['intelligence', 'messages'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setWorkspaceTab(tab)}
                className={cn(
                  'text-body-md-medium flex-1 rounded-lg px-4 py-2.5 capitalize transition-colors',
                  workspaceTab === tab
                    ? 'bg-brand-surface text-brand-text'
                    : 'text-brand-text hover:bg-white/5',
                )}
              >
                {tab === 'intelligence' ? 'Intelligence' : 'Messages'}
              </button>
            ))}
          </div>

          {workspaceTab === 'intelligence' ? (
            <TicketIntelligencePanel
              title={selected.subject}
              ticketId={selected.id}
              createdAt="01/01/2026 | 11:23:00 AM IST"
              dueIn="1hr 59m"
              eventName="AWS Conference"
              eventDate="01/14/2026"
              issueName="Payment failed"
              issueDetail="3 failed attempts"
              activities={activityMock}
            />
          ) : (
            <TicketMessagesPanel
              title={selected.subject}
              ticketId={selected.id}
              createdAt="01/01/2026 | 11:23:00 AM IST"
              dueIn="1hr 59m"
              assignedTo="Sarah John"
              messages={chatMessagesMock}
            />
          )}
        </div>

        <div className="lg:col-span-4">
          <TicketCasePanel
            reporterName="John Doe"
            reporterId="JD_112"
            pastTicketsCount={14}
            assignedTo="Mariam Mah"
            status="In-Progress"
            priority="Medium"
            module="Events"
            issueType="Payment Failed"
            comments="Verified system configuration no anomalies detected."
          />
        </div>
      </div>
    </div>
  )
}
