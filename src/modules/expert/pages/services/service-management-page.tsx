import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  PauseCircle,
  Trash2,
  BarChart3,
  Plus,
  Eye,
  type LucideIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useServices } from '../../hooks/use-services'
import { useExpertStore } from '../../store/expert-store'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/cn'

export const ServiceManagementPage = () => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery, currentPage, setCurrentPage, activeStatus, setActiveStatus } = useExpertStore()
  
  const { data, isLoading } = useServices({
    page: currentPage,
    limit: 10,
    status: activeStatus !== 'all' ? activeStatus : undefined,
    search: searchQuery
  })

  const services = data?.data || []
  const meta = data?.meta
  const counts = meta?.counts || {
    approvalsPending: 0,
    reportedServices: 0,
    suspendedServices: 0,
    deletedServices: 0
  }

  const statusCards: {
    label: string
    count: number
    color: string
    bg: string
    border: string
    icon: LucideIcon
    status: string
  }[] = [
    { label: 'Approvals Pending', count: counts.approvalsPending, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: ShieldCheck, status: 'pending' },
    { label: 'Reported Services', count: counts.reportedServices, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: AlertCircle, status: 'reported' },
    { label: 'Suspended Services', count: counts.suspendedServices, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', icon: PauseCircle, status: 'suspended' },
    { label: 'Deleted Services', count: counts.deletedServices, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: Trash2, status: 'deleted' },
  ]

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Service Management</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Comprehensive user data and admin controls</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <Button className="bg-amber-400 text-black hover:bg-amber-500 font-semibold gap-2 w-full md:w-auto justify-center">
            <BarChart3 className="size-4" />
            Manage Metrics
          </Button>
          <Button 
            className="bg-white text-black hover:bg-slate-200 font-semibold gap-2 w-full md:w-auto justify-center"
            onClick={() => navigate('/services/management/create')}
          >
            <Plus className="size-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statusCards.map((card) => (
          <button
            key={card.label}
            onClick={() => setActiveStatus(activeStatus === card.status ? 'all' : card.status)}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.02]",
              card.bg,
              card.border,
              activeStatus === card.status ? "ring-2 ring-amber-400/50" : ""
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", card.bg)}>
                <card.icon className={cn("size-5", card.color)} />
              </div>
              <span className="text-sm font-medium text-slate-300">{card.label}</span>
            </div>
            <span className={cn("text-lg font-bold", card.color)}>{card.count.toString().padStart(2, '0')}</span>
          </button>
        ))}
      </div>

      <div className="bg-[#121212] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <Input 
              placeholder="Search by name, ID or profession" 
              className="pl-10 bg-[#1A1A1A] border-slate-800 text-white placeholder:text-slate-600 focus:ring-amber-400/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="secondary" className="flex-1 sm:flex-none border-slate-800 bg-transparent text-white gap-2 text-xs md:text-sm">
              <Filter className="size-4" />
              Advance Filters
            </Button>
            <Button className="flex-1 sm:flex-none bg-amber-100 text-black hover:bg-amber-200 font-semibold gap-2 text-xs md:text-sm">
              <Download className="size-4" />
              Export Data
            </Button>
          </div>
        </div>

        <div className="px-5 pb-3">
          <p className="text-xs text-slate-500">
            Showing <span className="text-slate-300">1-{services.length}</span> of <span className="text-slate-300">{meta?.pagination.total || 0}</span> users
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-y border-slate-800/50">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4 font-semibold"><input type="checkbox" className="rounded border-slate-700 bg-transparent" /></th>
                <th className="px-3 py-4 font-semibold">Service ID</th>
                <th className="px-3 py-4 font-semibold">Service Name</th>
                <th className="px-3 py-4 font-semibold">Service Category</th>
                <th className="px-3 py-4 font-semibold">Service Type</th>
                <th className="px-3 py-4 font-semibold">Pricing</th>
                <th className="px-3 py-4 font-semibold">Expert ID</th>
                <th className="px-3 py-4 font-semibold">Expert Name</th>
                <th className="px-3 py-4 font-semibold">Status</th>
                <th className="px-3 py-4 font-semibold">Created at</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-4 rounded bg-slate-800" /></td>
                    <td className="px-3 py-4"><div className="h-4 w-12 rounded bg-slate-800" /></td>
                    <td className="px-3 py-4"><div className="h-4 w-32 rounded bg-slate-800" /></td>
                    <td className="px-3 py-4"><div className="h-4 w-24 rounded bg-slate-800" /></td>
                    <td className="px-3 py-4"><div className="h-4 w-20 rounded bg-slate-800" /></td>
                    <td className="px-3 py-4"><div className="h-4 w-16 rounded bg-slate-800" /></td>
                    <td className="px-3 py-4"><div className="h-4 w-14 rounded bg-slate-800" /></td>
                    <td className="px-3 py-4"><div className="h-4 w-24 rounded bg-slate-800" /></td>
                    <td className="px-3 py-4"><div className="h-6 w-16 rounded bg-slate-800" /></td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="h-3 w-20 rounded bg-slate-800" />
                        <div className="h-2 w-12 rounded bg-slate-800" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right"><div className="ml-auto h-4 w-4 rounded bg-slate-800" /></td>
                  </tr>
                ))
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-5 py-10 text-center text-slate-500">No services found.</td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service._id} className="text-sm text-slate-300 hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-4"><input type="checkbox" className="rounded border-slate-700 bg-transparent" /></td>
                    <td className="px-3 py-4 font-mono text-xs uppercase">{service._id.slice(-6)}</td>
                    <td className="px-3 py-4 font-medium text-white">{service.title}</td>
                    <td className="px-3 py-4">{service.categoryName}</td>
                    <td className="px-3 py-4">{service.serviceType}</td>
                    <td className="px-3 py-4">₹{service.pricing.toLocaleString()}</td>
                    <td className="px-3 py-4 font-mono text-xs">EXP-{service.partnerId.slice(-5).toUpperCase()}</td>
                    <td className="px-3 py-4">{service.expertName}</td>
                    <td className="px-3 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        service.status === 'live' ? "bg-green-500/10 text-green-500" : 
                        service.status === 'in_review' ? "bg-amber-500/10 text-amber-500" :
                        "bg-slate-500/10 text-slate-500"
                      )}>
                        {(service.status as string).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col">
                        <span>{new Date(service.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-[10px] text-slate-500">{new Date(service.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveDropdownId(activeDropdownId === service._id ? null : service._id)
                        }}
                        className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-800/50"
                      >
                        <MoreVertical className="size-4" />
                      </button>

                      {activeDropdownId === service._id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdownId(null)}
                          />
                          <div className="absolute right-5 mt-2 z-20 w-40 rounded-xl border border-slate-800 bg-[#1A1A1A] py-1.5 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                            <button
                              onClick={() => {
                                setActiveDropdownId(null)
                                navigate(`/services/management/view/${service._id}`)
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-all flex items-center gap-2"
                            >
                              <Eye className="size-3.5" />
                              View Details
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 md:p-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto border-slate-800 bg-transparent text-white gap-2 disabled:opacity-50"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 md:gap-2">
            {(() => {
              const totalPages = meta?.pagination.pages || 1
              const maxVisible = 5
              let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
              const end = Math.min(totalPages, start + maxVisible - 1)

              if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1)
              }

              return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "size-8 rounded flex items-center justify-center text-xs md:text-sm font-medium transition-colors",
                    currentPage === page ? "bg-amber-400 text-black" : "text-slate-500 hover:text-white"
                  )}
                >
                  {page.toString().padStart(2, '0')}
                </button>
              ))
            })()}
          </div>
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto border-slate-800 bg-transparent text-white gap-2 disabled:opacity-50"
            onClick={() => setCurrentPage(Math.min(meta?.pagination.pages || 1, currentPage + 1))}
            disabled={currentPage === (meta?.pagination.pages || 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
