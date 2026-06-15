import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Eye, 
  Image as ImageIcon, 
  History, 
  Gavel, 
  Check, 
  RotateCcw, 
  ArrowUpRight, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Info
} from 'lucide-react'
import { useService } from '../../hooks/use-services'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

export const ServiceViewPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: apiResponse, isLoading, error } = useService(id || '')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTierIndex, setActiveTierIndex] = useState(1) 
  const [internalNotes, setInternalNotes] = useState('')
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | null }>({ message: '', type: null })

  const service = apiResponse?.data

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setActionToast({ message, type })
    setTimeout(() => {
      setActionToast({ message: '', type: null })
    }, 4000)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-amber-400" />
        <p className="text-sm font-medium text-slate-400">Fetching service information...</p>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 text-center px-4">
        <div className="rounded-full bg-red-500/10 p-3 text-red-500">
          <Info className="size-10" />
        </div>
        <h3 className="text-lg font-semibold text-white">Service Not Found</h3>
        <p className="max-w-md text-sm text-slate-400">
          The service details could not be loaded. Please ensure the service ID is correct.
        </p>
        <Button variant="ghost" className="text-amber-400 hover:bg-transparent hover:text-amber-300 mt-4 gap-2" onClick={() => navigate('/services/management')}>
          <ArrowLeft className="size-4" /> Back to management
        </Button>
      </div>
    )
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A'
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Applied recently'
    const createdDate = new Date(isoString).getTime()
    const now = new Date().getTime()
    const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return 'Applied today'
    if (diffDays === 1) return 'Applied 1 day ago'
    return `Applied ${diffDays} days ago`
  }

  const handlePrevImage = () => {
    if (service.images && service.images.length > 0) {
      setActiveImageIndex((prev) => (prev === 0 ? service.images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (service.images && service.images.length > 0) {
      setActiveImageIndex((prev) => (prev === service.images.length - 1 ? 0 : prev + 1))
    }
  }

  const getTierDetails = () => {
    if (service.pricingType === 'tiered' && service.tieredPricing?.tiers) {
      const activeTier = service.tieredPricing.tiers[activeTierIndex] || service.tieredPricing.tiers[0]
      
      const rawDescription = activeTier.description || ''
      const parts = rawDescription.split('+')
      const mainDescription = parts[0]?.trim() || ''
      const features = parts.slice(1).map(f => f.trim()).filter(Boolean)

      return {
        name: activeTier.name,
        description: mainDescription,
        features: features,
        price: activeTier.price,
        timelineValue: activeTier.timelineValue,
        timelineUnit: activeTier.timelineUnit
      }
    }
    return null
  }

  const tierDetails = getTierDetails()

  return (
    <div className="flex flex-col gap-6 p-0 text-white min-h-screen relative pb-12">
      {actionToast.message && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4",
          actionToast.type === 'success' ? "bg-emerald-950/95 border-emerald-500/30 text-emerald-400" :
          actionToast.type === 'error' ? "bg-red-950/95 border-red-500/30 text-red-400" :
          "bg-slate-900/95 border-slate-800 text-slate-300"
        )}>
          <div className="size-2 rounded-full animate-pulse bg-current" />
          <span className="text-sm font-semibold">{actionToast.message}</span>
          <button onClick={() => setActionToast({ message: '', type: null })} className="ml-2 hover:opacity-80">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <button 
          onClick={() => navigate('/services/management')}
          className="flex items-center gap-2 text-white hover:text-slate-200 transition-colors group w-fit text-xl font-semibold"
        >
          <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
          <span>Service View</span>
        </button>
        
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
          <span>Service management</span>
          <span>/</span>
          <span>Service View</span>
          <span>/</span>
          <span className="text-white font-medium">{service.partnerName || service.expertName || 'Michael Chen'}</span>
        </div>
        
        <h1 className="text-2xl font-bold text-white mt-4">Service Details</h1>
      </div>

      <div className="bg-[#0B0B0B] border border-[#161616] rounded-2xl p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-white">
              {service.partnerName || service.expertName || 'Michael Chen'}
            </h2>
            <p className="text-[#6C6C6C] text-sm font-medium">
              {getRelativeTime(service.createdAt)}
            </p>
          </div>
          
          <button 
            onClick={() => showToast("Navigating to expert profile details...", "info")}
            className="flex items-center gap-2 border border-[#2A2A2A] bg-black text-[#E6E6E6] hover:bg-[#121212] transition-colors rounded-lg px-4 py-2 text-sm font-medium"
          >
            <Eye className="size-4" />
            <span>View Profile</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-[#0F0F0F] rounded-xl p-4 min-w-[180px] flex-1 sm:flex-none">
            <span className="block text-xs font-medium text-[#6C6C6C] mb-1.5">Expert ID</span>
            <span className="block text-sm font-semibold text-white font-mono uppercase">
              #Expert-{(service.partnerId || '10234').slice(-5).toUpperCase()}
            </span>
          </div>
          <div className="bg-[#0F0F0F] rounded-xl p-4 min-w-[200px] flex-1 sm:flex-none">
            <span className="block text-xs font-medium text-[#6C6C6C] mb-1.5">Submitted</span>
            <span className="block text-sm font-semibold text-white">
              {formatDate(service.createdAt)}
            </span>
          </div>
          <div className="bg-[#0F0F0F] rounded-xl p-4 min-w-[200px] flex-1 sm:flex-none">
            <span className="block text-xs font-medium text-[#6C6C6C] mb-1.5">Last Updated</span>
            <span className="block text-sm font-semibold text-white">
              {formatDate(service.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
        <div className="lg:col-span-4 w-full">
          <div className="relative aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden border border-[#222222] bg-[#0A0A0A] group">
            {service.images && service.images.length > 0 ? (
              <img 
                src={service.images[activeImageIndex]} 
                alt={service.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0A0A0A] text-slate-600">
                <ImageIcon className="size-12" />
                <span className="text-xs font-medium">No images uploaded</span>
              </div>
            )}

            {service.images && service.images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button 
                  onClick={handleNextImage} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 right-4 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#222222]/40 flex items-center gap-2 text-xs font-medium text-white shadow-lg">
              <ImageIcon className="size-3.5 text-slate-400" />
              <span>
                {(service.images && service.images.length > 0) ? `${activeImageIndex + 1}/${service.images.length}` : '0/0'}
              </span>
            </div>
          </div>

          {service.pricingType === 'tiered' && service.tieredPricing?.tiers && (
            <div className="bg-[#0B0B0B] border border-[#161616] rounded-2xl p-5 flex flex-col gap-5 mt-6">
              <div className="bg-black p-1 rounded-full border border-[#222222] flex items-center">
                {service.tieredPricing.tiers.map((tier, idx) => (
                  <button
                    key={tier.name}
                    onClick={() => setActiveTierIndex(idx)}
                    className={cn(
                      "flex-1 text-center py-2 px-3 text-xs font-semibold rounded-full transition-all duration-300",
                      activeTierIndex === idx 
                        ? "bg-white text-black font-bold shadow-lg" 
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {tier.name}
                  </button>
                ))}
              </div>

              {tierDetails && (
                <div className="flex flex-col gap-4">
                  {tierDetails.description && (
                    <p className="text-slate-300 text-sm font-semibold italic border-l-2 border-amber-400 pl-3 py-0.5">
                      "{tierDetails.description}"
                    </p>
                  )}

                  {tierDetails.features.length > 0 && (
                    <ul className="flex flex-col gap-2 mt-1">
                      {tierDetails.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-400">
                          <span className="size-1.5 rounded-full bg-amber-400/80 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="bg-black border border-[#222222] p-4 rounded-xl flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-bold text-white">
                        ₹{tierDetails.price?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Pricing</span>
                    </div>

                    <div className="bg-black border border-[#222222] p-4 rounded-xl flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-bold text-white">
                        {tierDetails.timelineValue.toString().padStart(2, '0')} {tierDetails.timelineUnit}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Timelines</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-4 justify-between min-h-[300px]">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-semibold text-white tracking-tight">{service.title}</h2>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  {service.category?.name || 'Category'}
                </span>
              </div>

              <span className="bg-[#2D1B10] border border-[#522F1B] text-[#D08B5C] px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {service.status === 'in_review' ? 'Review Pending' : service.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
              {service.description}
            </p>

            {service.deliverables && (
              <div className="flex flex-col gap-2 mt-2">
                <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Deliverables</h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl bg-[#0F0F0F] border border-[#1C1C1C] rounded-xl p-4">
                  {service.deliverables}
                </p>
              </div>
            )}

            {service.subCategory && service.subCategory.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {service.subCategory.map((subCat) => (
                  <span 
                    key={subCat._id} 
                    className="border border-[#222222] bg-[#0B0B0B] rounded-lg px-3 py-1.5 text-xs text-slate-300 font-medium"
                  >
                    {subCat.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {service.pricingType !== 'tiered' && (
            <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-[#1C1C1C]">
              {/* 1. Custom Pricing */}
              {service.pricingType === 'custom' && service.customPricing && (
                <>
                  <div className="flex flex-col items-center gap-2">
                    <div className="border border-[#222222] bg-[#0B0B0B] rounded-xl px-5 py-2.5 min-w-[120px] text-center">
                      <span className="text-sm font-semibold text-white">
                        ₹{service.customPricing.minPrice?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Starting From</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="border border-[#222222] bg-[#0B0B0B] rounded-xl px-5 py-2.5 min-w-[180px] text-center">
                      <span className="text-sm font-semibold text-white capitalize">
                        {service.customPricing.timelineFrom}-{service.customPricing.timelineTo} {service.customPricing.timelineUnit}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Timelines</span>
                  </div>
                </>
              )}

              {service.pricingType === 'fixed' && service.fixedPricing && (
                <>
                  <div className="flex flex-col items-center gap-2">
                    <div className="border border-[#222222] bg-[#0B0B0B] rounded-xl px-5 py-2.5 min-w-[120px] text-center">
                      <span className="text-sm font-semibold text-white">
                        ₹{service.fixedPricing.price?.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Pricing</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="border border-[#222222] bg-[#0B0B0B] rounded-xl px-5 py-2.5 min-w-[100px] text-center">
                      <span className="text-sm font-semibold text-white">
                        {service.fixedPricing.discountPercent}% Off
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Discounts</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="border border-[#222222] bg-[#0B0B0B] rounded-xl px-5 py-2.5 min-w-[100px] text-center">
                      <span className="text-sm font-semibold text-white">
                        {service.fixedPricing.timelineValue} {service.fixedPricing.timelineUnit.charAt(0).toUpperCase() + service.fixedPricing.timelineUnit.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Timelines</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mt-6">
        <div className="md:col-span-6 bg-[#0B0B0B] border border-[#161616] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <History className="size-4 text-slate-400" />
            <h3>Internal Notes</h3>
          </div>

          <textarea
            placeholder="No notes yet."
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            className="w-full h-full min-h-[120px] bg-black border border-[#222222] rounded-xl p-4 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 transition-all resize-none"
          />
        </div>

        <div className="md:col-span-6 bg-[#0B0B0B] border border-[#161616] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Gavel className="size-4 text-slate-400" />
            <h3>Decision Controls</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-auto mb-auto">
            <button
              onClick={() => showToast("Service listing approved successfully! Publishing to marketplace...", "success")}
              className="bg-[#00AC5C] hover:opacity-90 active:scale-[0.98] text-white flex items-center gap-2 rounded-xl py-3 px-4 font-semibold text-xs uppercase tracking-wider transition-all"
            >
              <span>Approve</span>
              <div className="size-4 rounded-full bg-white flex items-center justify-center">
                <Check className="size-2.5 text-[#00AC5C] stroke-[3px]" />
              </div>
            </button>

            <button
              onClick={() => showToast("Revision request submitted. Notification sent to the partner.", "info")}
              className="bg-[#DFA16E] hover:opacity-90 active:scale-[0.98] text-black flex items-center gap-2 rounded-xl py-3 px-4 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Ask for Re-Submit</span>
              <div className="size-4 rounded-full bg-black flex items-center justify-center">
                <RotateCcw className="size-2.5 text-[#DFA16E] stroke-[3px]" />
              </div>
            </button>

            <button
              onClick={() => showToast("Service listing escalated to senior administrative review.", "info")}
              className="bg-[#1A5CFF] hover:opacity-90 active:scale-[0.98] text-white flex items-center gap-2 rounded-xl py-3 px-4 font-semibold text-xs uppercase tracking-wider transition-all"
            >
              <span>Escalate</span>
              <div className="size-4 rounded-full bg-white flex items-center justify-center">
                <ArrowUpRight className="size-2.5 text-[#1A5CFF] stroke-[3px]" />
              </div>
            </button>

            <button
              onClick={() => showToast("Service application rejected. Partner notified with notes.", "error")}
              className="bg-[#E52E2E] hover:opacity-90 active:scale-[0.98] text-white flex items-center gap-2 rounded-xl py-3 px-4 font-semibold text-xs uppercase tracking-wider transition-all"
            >
              <span>Reject Application</span>
              <div className="size-4 rounded-full bg-white flex items-center justify-center">
                <X className="size-2.5 text-[#E52E2E] stroke-[3px]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
