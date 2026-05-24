import { useState, useRef, useCallback } from 'react'
import { ChevronLeft, Briefcase, MessageCircle, ChevronDown, Info, Plus, MapPin, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

const steps = [
  { id: '01', title: 'Service Type', description: 'Choose type offered' },
  { id: '02', title: 'Service Details', description: 'Title and category' },
  { id: '03', title: 'Pricing', description: 'Set service price' },
  { id: '04', title: 'Gallery', description: 'Add images/media' },
  { id: '05', title: 'Review', description: 'Check before publish' },
]

export const CreateServiceListingPage = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedType, setSelectedType] = useState<'service' | 'consultation' | null>('service')
  const [pricingType, setPricingType] = useState<'fixed' | 'custom' | 'tiered'>('fixed')
  const [selectedDiscount, setSelectedDiscount] = useState<string>('10%')
  const [timelineType, setTimelineType] = useState<'long' | 'short'>('long')
  const [selectedTier, setSelectedTier] = useState<'Basic' | 'Standard' | 'Premium'>('Standard')
  const [fixedPrice, setFixedPrice] = useState('₹60,000.00')
  const [fixedTimeline, setFixedTimeline] = useState('25')
  const [fixedTimelineUnit, setFixedTimelineUnit] = useState('Days')
  const [customPrice, setCustomPrice] = useState('₹60,000.00')
  const [customTimelineMin, setCustomTimelineMin] = useState('2')
  const [customTimelineMax, setCustomTimelineMax] = useState('5')
  const [customTimelineUnit, setCustomTimelineUnit] = useState('Months')
  const [tieredBasicPrice] = useState('₹30,000.00')
  const [tieredBasicTimeline] = useState('03 Days')
  const [tieredStandardPrice, setTieredStandardPrice] = useState('₹60,000.00')
  const [tieredStandardTimeline, setTieredStandardTimeline] = useState('05 Days')
  const [tieredPremiumPrice] = useState('₹1,50,000.00')
  const [tieredPremiumTimeline] = useState('10 Days')
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string; name: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const MAX_IMAGES = 5

  const handleFilesAdded = useCallback((files: FileList | null) => {
    if (!files) return
    const remaining = MAX_IMAGES - uploadedImages.length
    const toAdd = Array.from(files).slice(0, remaining)
    const newImages = toAdd.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
    }))
    setUploadedImages((prev) => [...prev, ...newImages])
  }, [uploadedImages.length])

  const handleRemoveImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFilesAdded(e.dataTransfer.files)
  }

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
    else navigate(-1)
  }

  return (
    <div className="flex flex-col gap-6 pb-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white hover:text-[#FBC078] transition-colors w-fit group"
        >
          <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <h1 className="text-xl font-bold tracking-tight">Create Service Listing</h1>
        </button>
        <div className="flex items-center gap-1.5 text-[#666666] text-[13px] font-medium pl-7">
          <span>Expert management</span>
          <span className="text-[#333333]">/</span>
          <span>Manage Experts</span>
          <span className="text-[#333333]">/</span>
          <span>Sarah Johnson</span>
          <span className="text-[#333333]">/</span>
          <span className="text-white font-bold">Create Listing</span>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-[16px] p-6 md:p-8 shadow-xl relative overflow-hidden w-full">
        <div className="flex justify-between items-start relative w-full px-4 md:px-10 mx-auto">
          <div className="absolute top-[18px] left-[60px] right-[60px] h-[1.5px] bg-[#222222] -z-0" />

          {steps.map((step, index) => {
            const stepNum = index + 1
            const isActive = stepNum === currentStep
            const isCompleted = stepNum < currentStep

            return (
              <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 bg-[#111111] px-2 md:px-4">
                <div className={cn(
                  "size-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                  isActive
                    ? "bg-[#FBC078] text-black shadow-[0_0_20px_rgba(251,192,120,0.1)]"
                    : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-[#111111] border-2 border-[#222222] text-[#666666]"
                )}>
                  {step.id}
                </div>
                <div className="text-center hidden lg:block">
                  <p className={cn(
                    "text-[13px] font-bold tracking-tight transition-colors",
                    isActive ? "text-white" : isCompleted ? "text-emerald-500/80" : "text-[#666666]"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-[#444444] font-medium whitespace-nowrap">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-[16px] p-8 md:p-10 shadow-xl w-[90%] mx-auto min-h-[400px]">
        {currentStep === 1 ? (
          <>
            <div className="mb-8">
              <h2 className="text-[18px] font-bold text-white mb-2">Choose Service Type</h2>
              <p className="text-[#888888] text-[14px] font-medium leading-relaxed">
                Select what kind of offering you're listing. This decision controls the rest of the form.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setSelectedType('service')}
                className={cn(
                  "group relative p-8 rounded-[20px] border-2 transition-all duration-300 flex flex-col items-center text-center gap-5 overflow-hidden",
                  selectedType === 'service'
                    ? "bg-[#FBC078] border-[#FBC078] text-black shadow-lg"
                    : "bg-black border-white/5 text-[#888888] hover:border-white/10"
                )}
              >
                <div className={cn(
                  "size-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                  selectedType === 'service' ? "bg-black text-white" : "bg-[#1A1A1A] text-white"
                )}>
                  <Briefcase className="size-7" />
                </div>
                <div className="space-y-3">
                  <h3 className={cn(
                    "text-[20px] font-bold tracking-tight",
                    selectedType === 'service' ? "text-black" : "text-white"
                  )}>
                    Service
                  </h3>
                  <p className={cn(
                    "text-[14px] font-medium leading-relaxed max-w-[240px]",
                    selectedType === 'service' ? "text-black/80" : "text-[#555555]"
                  )}>
                    Best for clearly defined offerings with deliverables, pricing, and timelines
                  </p>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('consultation')}
                className={cn(
                  "group relative p-8 rounded-[20px] border-2 transition-all duration-300 flex flex-col items-center text-center gap-5 overflow-hidden",
                  selectedType === 'consultation'
                    ? "bg-[#FBC078] border-[#FBC078] text-black shadow-lg"
                    : "bg-black border-white/5 text-[#888888] hover:border-white/10"
                )}
              >
                <div className={cn(
                  "size-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                  selectedType === 'consultation' ? "bg-black text-white" : "bg-[#1A1A1A] text-white"
                )}>
                  <MessageCircle className="size-7" />
                </div>
                <div className="space-y-3">
                  <h3 className={cn(
                    "text-[20px] font-bold tracking-tight",
                    selectedType === 'consultation' ? "text-black" : "text-white"
                  )}>
                    Consultation
                  </h3>
                  <p className={cn(
                    "text-[14px] font-medium leading-relaxed max-w-[240px]",
                    selectedType === 'consultation' ? "text-black/80" : "text-[#555555]"
                  )}>
                    Best for time-based or advisory sessions without fixed deliverables
                  </p>
                </div>
              </button>
            </div>
          </>
        ) : currentStep === 2 ? (
          <div className="max-w-4xl animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-10">
              <h2 className="text-[18px] font-bold text-white mb-1">About Service</h2>
              <p className="text-[#888888] text-[14px] font-medium">
                Provide details about your service offering
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-2.5">
                <label className="text-[14px] font-bold text-white tracking-tight">
                  Service title *
                </label>
                <input
                  type="text"
                  placeholder="e.g NDA Review & Legal Advisory"
                  className="w-full bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white placeholder:text-[#333333] outline-none focus:border-[#FBC078]/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-[14px] font-bold text-white tracking-tight">
                    Service Category *
                  </label>
                  <div className="relative group">
                    <select className="w-full appearance-none bg-black border border-white/5 rounded-xl p-4 text-[15px] text-[#555555] outline-none focus:border-[#FBC078]/50 transition-colors cursor-pointer pr-10">
                      <option value="" disabled selected>Select here</option>
                      <option>Legal</option>
                      <option>Finance</option>
                      <option>Technology</option>
                      <option>Marketing</option>
                      <option>Design</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#444444] pointer-events-none group-hover:text-[#666666] transition-colors" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[14px] font-bold text-white tracking-tight">
                    Service sub-category *
                  </label>
                  <div className="relative group">
                    <select className="w-full appearance-none bg-black border border-white/5 rounded-xl p-4 text-[15px] text-[#555555] outline-none focus:border-[#FBC078]/50 transition-colors cursor-pointer pr-10">
                      <option value="" disabled selected>Select here</option>
                      <option>Contract Review</option>
                      <option>NDA Advisory</option>
                      <option>Compliance</option>
                      <option>IP & Patents</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#444444] pointer-events-none group-hover:text-[#666666] transition-colors" />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[14px] font-bold text-white tracking-tight">
                  Describe Deliverables *
                </label>
                <textarea
                  placeholder="Describe what you will deliver to your client. Be specific about outputs, formats, and any revisions included..."
                  className="w-full bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white placeholder:text-[#333333] outline-none focus:border-[#FBC078]/50 transition-colors min-h-[160px] resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        ) : currentStep === 3 ? (
          <div className="max-w-4xl animate-in fade-in slide-in-from-right-4 duration-300 space-y-10">
            <div className="space-y-6">
              <div>
                <h2 className="text-[18px] font-bold text-white mb-1">Pricing Options</h2>
                <p className="text-[#888888] text-[14px] font-medium">
                  Select one pricing model. Each model has its own fields.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPricingType('fixed')}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 text-left",
                    pricingType === 'fixed'
                      ? "bg-[#1A1A1A] border-[#FBC078] shadow-[0_0_15px_rgba(251,192,120,0.05)]"
                      : "bg-black border-white/5 hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "size-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0",
                    pricingType === 'fixed' ? "border-[#FBC078]" : "border-[#444444]"
                  )}>
                    {pricingType === 'fixed' && <div className="size-2.5 rounded-full bg-[#FBC078]" />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[15px] mb-1">Fixed Pricing</h3>
                    <p className="text-[#666666] text-[13px] leading-snug">
                      Best for clearly defined scope, deliverables, and deadlines
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setPricingType('custom')}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 text-left",
                    pricingType === 'custom'
                      ? "bg-[#1A1A1A] border-[#FBC078] shadow-[0_0_15px_rgba(251,192,120,0.05)]"
                      : "bg-black border-white/5 hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "size-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0",
                    pricingType === 'custom' ? "border-[#FBC078]" : "border-[#444444]"
                  )}>
                    {pricingType === 'custom' && <div className="size-2.5 rounded-full bg-[#FBC078]" />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[15px] mb-1">Custom Pricing</h3>
                    <p className="text-[#666666] text-[13px] leading-snug">
                      Best for flexible scope, evolving requirements, variable timelines
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setPricingType('tiered')}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 text-left md:col-span-1",
                    pricingType === 'tiered'
                      ? "bg-[#1A1A1A] border-[#FBC078] shadow-[0_0_15px_rgba(251,192,120,0.05)]"
                      : "bg-black border-white/5 hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "size-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0",
                    pricingType === 'tiered' ? "border-[#FBC078]" : "border-[#444444]"
                  )}>
                    {pricingType === 'tiered' && <div className="size-2.5 rounded-full bg-[#FBC078]" />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[15px] mb-1">Tiered Pricing</h3>
                    <p className="text-[#666666] text-[13px] leading-snug">
                      Best for multiple service levels with increasing value
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              {pricingType === 'fixed' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-[18px] font-bold text-white">Fixed Pricing Details</h2>

                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 w-full space-y-8">
                      <div className="space-y-2.5">
                        <label className="text-[14px] font-bold text-white tracking-tight">Price *</label>
                        <input
                          type="text"
                          placeholder="Enter Price"
                          value={fixedPrice}
                          onChange={(e) => setFixedPrice(e.target.value)}
                          className="w-full bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white placeholder:text-[#333333] outline-none focus:border-[#FBC078]/50 transition-colors"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-[14px] font-bold text-white tracking-tight">Set Timelines *</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={fixedTimeline}
                            onChange={(e) => setFixedTimeline(e.target.value)}
                            className="w-full bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white outline-none focus:border-[#FBC078]/50 transition-colors"
                          />
                          <div className="relative group shrink-0 w-32">
                            <select
                              value={fixedTimelineUnit}
                              onChange={(e) => setFixedTimelineUnit(e.target.value)}
                              className="w-full appearance-none bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white outline-none focus:border-[#FBC078]/50 transition-colors cursor-pointer pr-10"
                            >
                              <option>Days</option>
                              <option>Weeks</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#666666] pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <label className="text-[14px] font-bold text-white tracking-tight">Discount (%)</label>
                          <Info className="size-4 text-[#666666] cursor-help" />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {['00%', '10%', '15%', '20%'].map((discount) => (
                            <button
                              key={discount}
                              onClick={() => setSelectedDiscount(discount)}
                              className={cn(
                                "px-6 py-2.5 rounded-lg font-bold text-[14px] transition-all duration-200",
                                selectedDiscount === discount
                                  ? "bg-white text-black shadow-lg"
                                  : "bg-[#1A1A1A] text-[#666666] border border-white/5 hover:border-white/10"
                              )}
                            >
                              {discount}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-[320px]">
                      <div className="bg-[#1a2e1a] border border-[#2d4d2d] rounded-xl p-5 flex gap-4">
                        <div className="size-10 rounded-full bg-[#2d4d2d] flex items-center justify-center shrink-0">
                          <MapPin className="size-5 text-emerald-500" />
                        </div>
                        <p className="text-[13px] text-emerald-500/90 leading-relaxed font-medium">
                          The market rate for NDA review is ₹6K–₹15K. It's recommended to set your price within this range.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pricingType === 'custom' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-[18px] font-bold text-white">Custom Pricing Details</h2>

                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 w-full space-y-8">
                      <div className="space-y-2.5">
                        <label className="text-[14px] font-bold text-white tracking-tight">Set Price *</label>
                        <input
                          type="text"
                          placeholder="Enter price"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          className="w-full bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white placeholder:text-[#333333] outline-none focus:border-[#FBC078]/50 transition-colors"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[14px] font-bold text-white tracking-tight">Times lines *</label>
                        <div className="flex gap-6">
                          <button
                            onClick={() => setTimelineType('long')}
                            className="flex items-center gap-2.5 group"
                          >
                            <div className={cn(
                              "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                              timelineType === 'long' ? "border-[#FBC078]" : "border-[#444444]"
                            )}>
                              {timelineType === 'long' && <div className="size-2.5 rounded-full bg-[#FBC078]" />}
                            </div>
                            <span className={cn(
                              "text-[14px] font-medium transition-colors",
                              timelineType === 'long' ? "text-white" : "text-[#666666]"
                            )}>Long term</span>
                          </button>
                          <button
                            onClick={() => setTimelineType('short')}
                            className="flex items-center gap-2.5 group"
                          >
                            <div className={cn(
                              "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                              timelineType === 'short' ? "border-[#FBC078]" : "border-[#444444]"
                            )}>
                              {timelineType === 'short' && <div className="size-2.5 rounded-full bg-[#FBC078]" />}
                            </div>
                            <span className={cn(
                              "text-[14px] font-medium transition-colors",
                              timelineType === 'short' ? "text-white" : "text-[#666666]"
                            )}>Short term</span>
                          </button>
                        </div>
                        <p className="text-[#555555] text-[13px]">
                          Best for services with flexible scope, evolving requirements, and variable timelines.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-[14px] font-bold text-white tracking-tight">Set Timelines *</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={customTimelineMin}
                            onChange={(e) => setCustomTimelineMin(e.target.value)}
                            className="w-24 bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white text-center outline-none focus:border-[#FBC078]/50 transition-colors"
                          />
                          <span className="text-[#444444] font-medium text-[14px]">To</span>
                          <input
                            type="text"
                            value={customTimelineMax}
                            onChange={(e) => setCustomTimelineMax(e.target.value)}
                            className="w-24 bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white text-center outline-none focus:border-[#FBC078]/50 transition-colors"
                          />
                          <div className="relative group shrink-0 w-32">
                            <select
                              value={customTimelineUnit}
                              onChange={(e) => setCustomTimelineUnit(e.target.value)}
                              className="w-full appearance-none bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white outline-none focus:border-[#FBC078]/50 transition-colors cursor-pointer pr-10"
                            >
                              <option value="Days">Days</option>
                              <option value="Weeks">Weeks</option>
                              <option value="Months">Months</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#666666] pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-[320px]">
                      <div className="bg-[#1a2e1a] border border-[#2d4d2d] rounded-xl p-5 flex gap-4">
                        <div className="size-10 rounded-full bg-[#2d4d2d] flex items-center justify-center shrink-0">
                          <MapPin className="size-5 text-emerald-500" />
                        </div>
                        <p className="text-[13px] text-emerald-500/90 leading-relaxed font-medium">
                          The market rate for NDA review is ₹6K–₹15K. It's recommended to set your price within this range.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pricingType === 'tiered' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center">
                    <h2 className="text-[18px] font-bold text-white">Tiered Pricing Details</h2>
                    <Button className="bg-[#FBC078] hover:bg-[#FBC078]/90 text-black font-bold h-9 px-4 rounded-lg flex items-center gap-2">
                      <Plus className="size-4" />
                      Add Tier
                    </Button>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <label className="text-[14px] font-bold text-white tracking-tight">Tier Name *</label>
                        <input
                          type="text"
                          placeholder="Standard"
                          className="w-full bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white placeholder:text-[#333333] outline-none focus:border-[#FBC078]/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[14px] font-bold text-white tracking-tight">Price *</label>
                        <input
                          type="text"
                          placeholder="enter Price here..."
                          value={tieredStandardPrice}
                          onChange={(e) => setTieredStandardPrice(e.target.value)}
                          className="w-full bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white placeholder:text-[#333333] outline-none focus:border-[#FBC078]/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[14px] font-bold text-white tracking-tight">Basic</label>
                      <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-6">
                        <ul className="space-y-3">
                          {[
                            "Priority access to event",
                            "Access to live session",
                            "Post-event recording (24h access)",
                            "Access to live session",
                            "Post-event recording (24h access)"
                          ].map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-[14px] text-[#888888]">
                              <span className="text-[#FBC078] mt-1.5">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2.5 max-w-[300px]">
                      <label className="text-[14px] font-bold text-white tracking-tight">Set Timelines *</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={tieredStandardTimeline.split(' ')[0]}
                          onChange={(e) => setTieredStandardTimeline(e.target.value.padStart(2, '0') + ' Days')}
                          className="w-full bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white text-center outline-none focus:border-[#FBC078]/50 transition-colors"
                        />
                        <div className="relative group shrink-0 w-32">
                          <select className="w-full appearance-none bg-black border border-white/5 rounded-xl p-4 text-[15px] text-white outline-none focus:border-[#FBC078]/50 transition-colors cursor-pointer pr-10">
                            <option>Days</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#666666] pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : currentStep === 4 ? (
          <div className="max-w-4xl animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div>
              <h2 className="text-[18px] font-bold text-white mb-1">Gallery</h2>
              <p className="text-[#888888] text-[14px] font-medium">
                Upload visual assets to support your service (optional)
              </p>
            </div>

            <div className="bg-[#0D0D0D] border border-white/5 rounded-[16px] p-6 space-y-6">
              <p className="text-[13px] text-[#666666] font-medium">
                Maximum {MAX_IMAGES} images. Allowed formats: JPG, PNG, WebP
              </p>

              <div
                onClick={() => uploadedImages.length < MAX_IMAGES && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-14 gap-3 transition-all duration-300 cursor-pointer select-none",
                  isDragging
                    ? "border-[#FBC078]/60 bg-[#FBC078]/5"
                    : uploadedImages.length >= MAX_IMAGES
                      ? "border-white/5 bg-black/30 cursor-not-allowed opacity-50"
                      : "border-white/10 bg-black/30 hover:border-[#FBC078]/40 hover:bg-[#FBC078]/5"
                )}
              >
                <div className="size-11 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center">
                  <Upload className="size-5 text-[#666666]" />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold text-white">
                    {uploadedImages.length >= MAX_IMAGES ? 'Maximum images reached' : 'Click to upload Images'}
                  </p>
                  {uploadedImages.length < MAX_IMAGES && (
                    <p className="text-[13px] text-[#555555] mt-1">Or drag &amp; drop</p>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleFilesAdded(e.target.files)}
              />

              {uploadedImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[13px] font-semibold text-white">
                    Uploaded Images ({uploadedImages.length}/{MAX_IMAGES})
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {uploadedImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-[120px] h-[90px] object-cover rounded-xl border border-white/5"
                        />
                        <button
                          onClick={() => handleRemoveImage(img.id)}
                          className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors shadow-lg"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : currentStep === 5 ? (
          <div className="max-w-4xl animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div>
              <h2 className="text-[18px] font-bold text-white mb-1">Review &amp; Publish</h2>
              <p className="text-[#888888] text-[14px] font-medium">
                Review your service listing details before publishing
              </p>
            </div>

            <div className="bg-[#0D0D0D] border border-white/5 rounded-[16px] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
              
              <div className="w-full md:w-[380px] shrink-0 flex flex-col gap-6">
                <div className="relative w-full h-[220px] rounded-xl overflow-hidden border border-white/5">
                  <img
                    src={uploadedImages.length > 0 ? uploadedImages[0].url : "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000"}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm border border-white/10 text-white text-[12px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>1/{uploadedImages.length || 12}</span>
                  </div>
                </div>

                {pricingType === 'tiered' && (() => {
                  const tierData = {
                    Basic: {
                      description: 'Ideal for quick scans or simple NDAs',
                      features: [
                        'High-level scan of the NDA for obvious flags',
                        'Clear summary of key clauses',
                        'Flags standard clauses'
                      ],
                      price: tieredBasicPrice,
                      timeline: tieredBasicTimeline,
                    },
                    Standard: {
                      description: 'Ideal for early-stage reviews or first-time signings',
                      features: [
                        'High-level review of the NDA for obvious risks',
                        'Clear summary of key confidentiality and obligation clauses',
                        'Flags sections that may need closer attention before signing',
                      ],
                      price: tieredStandardPrice,
                      timeline: tieredStandardTimeline,
                    },
                    Premium: {
                      description: 'Full-service NDA advisory for complex agreements',
                      features: [
                        'Comprehensive multi-party NDA review',
                        'Legal opinion letter included',
                        'Redlining and tracked changes',
                        'Priority turnaround & revision rounds',
                        'Post-review consultation call',
                      ],
                      price: tieredPremiumPrice,
                      timeline: tieredPremiumTimeline,
                    },
                  }
                  const current = tierData[selectedTier]
                  return (
                    <div className="space-y-6">
                      <div className="flex bg-black border border-white/5 rounded-full p-1 w-full justify-between">
                        {(['Basic', 'Standard', 'Premium'] as const).map((tier) => (
                          <button
                            key={tier}
                            onClick={() => setSelectedTier(tier)}
                            className={cn(
                              'px-6 py-2 rounded-full text-[13px] font-bold transition-all duration-300 flex-1 text-center',
                              selectedTier === tier
                                ? 'bg-white text-black shadow-lg font-bold'
                                : 'text-[#666666] hover:text-white bg-transparent'
                            )}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <p className="text-[13.5px] text-[#888888] font-medium italic">{current.description}</p>
                        <ul className="space-y-2 ml-1">
                          {current.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#888888] font-medium">
                              <span className="text-[#FBC078] mt-1.5 text-[10px]">•</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-4 pt-2">
                        <div className="flex flex-col gap-1.5">
                          <div className="border border-white/10 bg-[#0D0D0D] px-6 py-3.5 rounded-xl min-w-[120px] flex items-center justify-center">
                            <span className="text-[15px] font-bold text-white">{current.price}</span>
                          </div>
                          <span className="text-[12px] text-[#666666] font-bold text-center">Pricing</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="border border-white/10 bg-[#0D0D0D] px-6 py-3.5 rounded-xl min-w-[120px] flex items-center justify-center">
                            <span className="text-[15px] font-bold text-white">{current.timeline}</span>
                          </div>
                          <span className="text-[12px] text-[#666666] font-bold text-center">Timelines</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div className="flex-1 flex flex-col justify-between self-stretch">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[22px] font-bold text-white tracking-tight mb-1">NDA Document Review</h3>
                    <span className="text-[13px] text-[#888888] font-medium">Legal</span>
                  </div>

                  <p className="text-[14px] text-[#888888] leading-relaxed font-medium">
                    Get your Non-Disclosure Agreement reviewed to identify risks, unclear clauses, and potential gaps. Receive clear feedback on confidentiality terms, obligations, and limitations so you can sign or share documents with confidence.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {['NDA review', 'Policy review'].map((tag) => (
                      <span key={tag} className="px-3.5 py-1.5 bg-[#161616] border border-white/5 text-[#888888] text-[12px] font-bold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {pricingType === 'fixed' && (
                  <div className="flex flex-wrap gap-4 pt-6 mt-auto">
                    <div className="flex flex-col gap-1.5">
                      <div className="border border-white/10 bg-[#0D0D0D] px-6 py-3.5 rounded-xl min-w-[120px] flex items-center justify-center">
                        <span className="text-[15px] font-bold text-white">{fixedPrice}</span>
                      </div>
                      <span className="text-[12px] text-[#666666] font-bold text-center">Pricing</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="border border-white/10 bg-[#0D0D0D] px-6 py-3.5 rounded-xl min-w-[120px] flex items-center justify-center">
                        <span className="text-[15px] font-bold text-white">{selectedDiscount} Off</span>
                      </div>
                      <span className="text-[12px] text-[#666666] font-bold text-center">Discounts</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="border border-white/10 bg-[#0D0D0D] px-6 py-3.5 rounded-xl min-w-[120px] flex items-center justify-center">
                        <span className="text-[15px] font-bold text-white">{fixedTimeline} {fixedTimelineUnit}</span>
                      </div>
                      <span className="text-[12px] text-[#666666] font-bold text-center">Timelines</span>
                    </div>
                  </div>
                )}

                {pricingType === 'custom' && (
                  <div className="flex flex-wrap gap-4 pt-6 mt-auto">
                    <div className="flex flex-col gap-1.5">
                      <div className="border border-white/10 bg-[#0D0D0D] px-6 py-3.5 rounded-xl min-w-[120px] flex items-center justify-center">
                        <span className="text-[15px] font-bold text-white">{customPrice}</span>
                      </div>
                      <span className="text-[12px] text-[#666666] font-bold text-center">Starting From</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="border border-white/10 bg-[#0D0D0D] px-6 py-3.5 rounded-xl min-w-[120px] flex items-center justify-center">
                        <span className="text-[15px] font-bold text-white">{timelineType === 'long' ? 'Long term' : 'Short term'} ({customTimelineMin}-{customTimelineMax} {customTimelineUnit})</span>
                      </div>
                      <span className="text-[12px] text-[#666666] font-bold text-center">Timelines</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-[#444444] italic">
            Step {currentStep} coming soon...
          </div>
        )}
      </div>

      <div className="bg-[#111111]  border border-white/5 rounded-[12px] p-4 flex justify-between items-center shadow-lg w-[90%] mx-auto">
        <Button
          variant="secondary"
          onClick={handleBack}
          className="px-6 py-2 border border-[#222222] bg-transparent text-[#666666] rounded-[8px] hover:bg-white/5 hover:border-[#333333] transition-all h-auto"
        >
          Previous
        </Button>
        <div className="flex items-center gap-4">
          {((currentStep > 1 && currentStep < 5) || (currentStep === 5 && pricingType === 'fixed')) && (
            <Button
              variant="secondary"
              className="px-6 py-2 border border-[#222222] bg-transparent text-[#888888] rounded-[8px] hover:bg-white/5 transition-all h-auto"
            >
              Save as Draft
            </Button>
          )}
          {currentStep === 5 ? (
            pricingType === 'fixed' ? (
              <Button
                onClick={handleNext}
                className="px-8 py-2 bg-[#FBC078] text-black font-bold rounded-[8px] transition-all shadow-md h-auto hover:bg-[#eeb46a]"
              >
                Save &amp; Continue
              </Button>
            ) : (
              <Button
                className="px-8 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-[8px] transition-all shadow-md h-auto flex items-center gap-2"
              >
                Publish service
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </Button>
            )
          ) : (
            <Button
              onClick={handleNext}
              className={cn(
                "px-8 py-2 bg-[#FBC078] text-black font-bold rounded-[8px] transition-all shadow-md h-auto hover:bg-[#eeb46a]",
                (currentStep === 1 && !selectedType) ? "opacity-50 cursor-not-allowed" : "opacity-100"
              )}
              disabled={currentStep === 1 && !selectedType}
            >
              {currentStep === 1 ? 'Next' : 'Save & Continue'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
