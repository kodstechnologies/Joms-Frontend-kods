import { useState, useRef, useCallback } from 'react'
import {
  Briefcase,
  MessageCircle,
  ChevronDown,
  Info,
  Plus,
  MapPin,
  Upload,
  Phone,
  Languages,
  Loader2,
  X,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useCategories, useSubcategories } from '@/modules/expert/hooks/use-categories'
import {
  useCreateConsultation,
  useCreateService,
  usePublishConsultation,
  usePublishService,
  useUpdateConsultationAdditionalInfo,
  useUpdateConsultationPricing,
  useUpdateServiceGallery,
  useUpdateServicePricing,
} from '@/modules/expert/hooks/use-create-listing'
import {
  CONSULTATION_MODES,
  DURATION_OPTIONS,
  getApiErrorMessage,
  normalizeTimelineUnit,
  parsePrice,
} from '@/modules/expert/lib/listing-form-utils'
import type { ConsultationTopic } from '@/modules/expert/type/service'
import type { UpdateServicePricingPayload } from '@/modules/expert/type/service'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { CreateListingWizard } from '@/modules/expert/components'

type UploadedImage = {
  id: string
  url: string
  name: string
  file: File
}

const serviceSteps = [
  { id: '01', title: 'Service Type', description: 'Choose type offered' },
  { id: '02', title: 'Service Details', description: 'Title and category' },
  { id: '03', title: 'Pricing', description: 'Set service price' },
  { id: '04', title: 'Gallery', description: 'Add images/media' },
  { id: '05', title: 'Review', description: 'Check before publish' },
]

const consultationSteps = [
  { id: '01', title: 'Service Type', description: 'Choose type offered' },
  { id: '02', title: 'Consultation Details', description: 'Title and topic' },
  { id: '03', title: 'Additional Info', description: 'Session Info' },
  { id: '04', title: 'Pricing & Duration', description: 'Set fees and time' },
  { id: '05', title: 'Review', description: 'Check before publish' },
]

export const CreateServiceListingPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const partnerId = searchParams.get('partnerId') || ''
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedType, setSelectedType] = useState<'service' | 'consultation' | null>('service')
  const [listingId, setListingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [serviceTitle, setServiceTitle] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [deliverables, setDeliverables] = useState('')

  const [consultationTitle, setConsultationTitle] = useState('')
  const [topics, setTopics] = useState<ConsultationTopic[]>([])
  const [topicIdInput, setTopicIdInput] = useState('')
  const [topicNameInput, setTopicNameInput] = useState('')
  const [sessionOutline, setSessionOutline] = useState('')
  const [whoItsFor, setWhoItsFor] = useState('')
  const [languages, setLanguages] = useState('')
  const [hasPreSessionRequirement, setHasPreSessionRequirement] = useState(false)
  const [preSessionRequirement, setPreSessionRequirement] = useState('')
  const [hasPostSessionMessage, setHasPostSessionMessage] = useState(false)
  const [postSessionMessage, setPostSessionMessage] = useState('')
  const [hasFollowUp, setHasFollowUp] = useState(false)
  const [followUpDays, setFollowUpDays] = useState('7')
  const [consultationMode, setConsultationMode] = useState<'audio' | 'video' | 'chat'>('video')
  const [consultationDuration, setConsultationDuration] = useState<number>(30)
  const [consultationPricingType, setConsultationPricingType] = useState<'free' | 'paid'>('paid')
  const [consultationPrice, setConsultationPrice] = useState('')

  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategories({
    page: 1,
    limit: 100,
  })
  const { data: subcategoriesResponse, isLoading: isSubcategoriesLoading } = useSubcategories(
    selectedCategoryId,
    { page: 1, limit: 100 },
  )
  const categories = categoriesResponse?.data || []
  const subcategories = subcategoriesResponse?.data || []

  const createServiceMutation = useCreateService()
  const updateServicePricingMutation = useUpdateServicePricing()
  const updateServiceGalleryMutation = useUpdateServiceGallery()
  const publishServiceMutation = usePublishService()
  const createConsultationMutation = useCreateConsultation()
  const updateConsultationAdditionalInfoMutation = useUpdateConsultationAdditionalInfo()
  const updateConsultationPricingMutation = useUpdateConsultationPricing()
  const publishConsultationMutation = usePublishConsultation()
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
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const MAX_IMAGES = 5

  const handleFilesAdded = useCallback((files: FileList | null) => {
    if (!files) return
    const remaining = MAX_IMAGES - uploadedImages.length
    const toAdd = Array.from(files).slice(0, remaining)
    const newImages: UploadedImage[] = toAdd.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
      file,
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

  const toggleSubCategory = (subCategoryId: string) => {
    setSelectedSubCategoryIds((current) =>
      current.includes(subCategoryId)
        ? current.filter((id) => id !== subCategoryId)
        : [...current, subCategoryId],
    )
  }

  const addTopic = () => {
    const name = topicNameInput.trim()
    const _id = topicIdInput.trim()
    if (!_id || !_id.match(/^[a-f\d]{24}$/i)) {
      toast.error('Topic ID must be a valid 24-character MongoDB ObjectId.')
      return
    }
    if (!name) {
      toast.error('Topic name is required.')
      return
    }
    if (topics.some((topic) => topic._id === _id)) {
      toast.error('This topic is already added.')
      return
    }
    setTopics((current) => [...current, { _id, name }])
    setTopicIdInput('')
    setTopicNameInput('')
  }

  const removeTopic = (topicId: string) => {
    setTopics((current) => current.filter((topic) => topic._id !== topicId))
  }

  const buildServicePricingPayload = (): UpdateServicePricingPayload => {
    if (pricingType === 'fixed') {
      return {
        pricingType: 'fixed',
        fixedPricing: {
          price: parsePrice(fixedPrice),
          discountPercent: Number.parseInt(selectedDiscount.replace('%', ''), 10) || 0,
          timelineValue: Number.parseInt(fixedTimeline, 10) || 0,
          timelineUnit: normalizeTimelineUnit(fixedTimelineUnit),
        },
      }
    }

    if (pricingType === 'custom') {
      const price = parsePrice(customPrice)
      return {
        pricingType: 'custom',
        customPricing: {
          durationType: timelineType === 'long' ? 'long_term' : 'short_term',
          minPrice: price,
          maxPrice: price,
          timelineFrom: Number.parseInt(customTimelineMin, 10) || 0,
          timelineTo: Number.parseInt(customTimelineMax, 10) || 0,
          timelineUnit: normalizeTimelineUnit(customTimelineUnit),
        },
      }
    }

    return {
      pricingType: 'tiered',
      tieredPricing: {
        tiers: [
          {
            name: 'basic',
            description: 'Basic tier package',
            price: parsePrice(tieredBasicPrice),
            timelineValue: Number.parseInt(tieredBasicTimeline, 10) || 0,
            timelineUnit: 'days',
          },
          {
            name: 'standard',
            description: 'Standard tier package',
            price: parsePrice(tieredStandardPrice),
            timelineValue: Number.parseInt(tieredStandardTimeline.split(' ')[0], 10) || 0,
            timelineUnit: 'days',
          },
          {
            name: 'premium',
            description: 'Premium tier package',
            price: parsePrice(tieredPremiumPrice),
            timelineValue: Number.parseInt(tieredPremiumTimeline, 10) || 0,
            timelineUnit: 'days',
          },
        ],
      },
    }
  }

  const requirePartnerId = () => {
    if (!partnerId) {
      toast.error('Partner ID is required. Open this page with ?partnerId=<id> in the URL.')
      return false
    }
    return true
  }

  const handlePrimaryAction = async () => {
    if (currentStep === 1) {
      handleNext()
      return
    }

    if (!requirePartnerId()) return

    setIsSubmitting(true)
    try {
      if (selectedType === 'service') {
        if (currentStep === 2) {
          if (!serviceTitle.trim()) {
            toast.error('Service title is required.')
            return
          }
          if (!selectedCategoryId) {
            toast.error('Service category is required.')
            return
          }

          const response = await createServiceMutation.mutateAsync({
            partnerId,
            title: serviceTitle.trim(),
            category: selectedCategoryId,
            subCategory: selectedSubCategoryIds,
            description: description.trim() || undefined,
            deliverables: deliverables.trim() || undefined,
            pricingType,
          })
          setListingId(response.data._id)
          toast.success('Service created successfully')
          handleNext()
          return
        }

        if (!listingId) {
          toast.error('Service ID is missing. Go back and complete service details.')
          return
        }

        if (currentStep === 3) {
          await updateServicePricingMutation.mutateAsync({
            id: listingId,
            payload: buildServicePricingPayload(),
          })
          toast.success('Pricing updated successfully')
          handleNext()
          return
        }

        if (currentStep === 4) {
          if (uploadedImages.length > 0) {
            await updateServiceGalleryMutation.mutateAsync({
              id: listingId,
              images: uploadedImages.map((image) => image.file),
            })
            toast.success('Gallery updated successfully')
          }
          handleNext()
          return
        }

        if (currentStep === 5) {
          await publishServiceMutation.mutateAsync(listingId)
          toast.success('Service published successfully')
          navigate('/services/management')
        }
        return
      }

      if (selectedType === 'consultation') {
        if (currentStep === 2) {
          if (!consultationTitle.trim()) {
            toast.error('Consultation title is required.')
            return
          }
          if (topics.length === 0) {
            toast.error('Add at least one topic.')
            return
          }
          if (!sessionOutline.trim() || !whoItsFor.trim()) {
            toast.error('Session outline and audience are required.')
            return
          }

          const response = await createConsultationMutation.mutateAsync({
            partnerId,
            title: consultationTitle.trim(),
            topics,
            sessionOutline: sessionOutline.trim(),
            whoItsFor: whoItsFor.trim(),
          })
          setListingId(response.data._id)
          toast.success('Consultation created successfully')
          handleNext()
          return
        }

        if (!listingId) {
          toast.error('Consultation ID is missing. Go back and complete consultation details.')
          return
        }

        if (currentStep === 3) {
          await updateConsultationAdditionalInfoMutation.mutateAsync({
            id: listingId,
            payload: {
              languages: languages
                .split(',')
                .map((lang) => lang.trim())
                .filter(Boolean),
              hasPreSessionRequirement,
              preSessionRequirement: hasPreSessionRequirement ? preSessionRequirement.trim() : '',
              hasPostSessionMessage,
              postSessionMessage: hasPostSessionMessage ? postSessionMessage.trim() : '',
              hasFollowUp,
              followUpDays: hasFollowUp ? Number.parseInt(followUpDays, 10) || 0 : undefined,
            },
          })
          toast.success('Additional information updated')
          handleNext()
          return
        }

        if (currentStep === 4) {
          if (consultationPricingType === 'paid' && !consultationPrice.trim()) {
            toast.error('Consultation fee is required for paid sessions.')
            return
          }

          await updateConsultationPricingMutation.mutateAsync({
            id: listingId,
            payload: {
              mode: consultationMode,
              pricingOptions: [
                {
                  durationMinutes: consultationDuration,
                  pricingType: consultationPricingType,
                  price:
                    consultationPricingType === 'paid' ? parsePrice(consultationPrice) : undefined,
                },
              ],
            },
          })
          toast.success('Pricing & duration updated')
          handleNext()
          return
        }

        if (currentStep === 5) {
          await publishConsultationMutation.mutateAsync(listingId)
          toast.success('Consultation published successfully')
          navigate('/services/management')
        }
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save listing'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeSteps = selectedType === 'consultation' ? consultationSteps : serviceSteps

  const consultationInputClass =
    'h-9 w-full rounded-md border border-white/5 bg-black px-3 text-[11px] text-white outline-none transition-colors placeholder:text-[#555555] focus:border-[#FBC078]/50'
  const consultationTextareaClass =
    'min-h-[92px] w-full resize-none rounded-md border border-white/5 bg-black p-3 text-[11px] leading-relaxed text-white outline-none transition-colors placeholder:text-[#555555] focus:border-[#FBC078]/50'

  const renderConsultationStep = () => {
    if (currentStep === 2) {
      return (
        <div className="animate-in fade-in slide-in-from-right-4 mx-auto w-full max-w-[850px] rounded-lg border border-white/5 bg-[#151515] p-5 duration-300">
          <div className="mb-6">
            <h2 className="mb-1 text-[13px] font-bold text-white">About Consultation</h2>
            <p className="text-[11px] font-medium text-[#777777]">
              Provide details about your Consultation
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold tracking-tight text-white">
                Consultation Title
              </label>
              <input
                type="text"
                placeholder="Example: NDA Review & Legal Advisory"
                value={consultationTitle}
                onChange={(e) => setConsultationTitle(e.target.value)}
                className={consultationInputClass}
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold tracking-tight text-white">Add Topics</label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input
                  type="text"
                  placeholder="Topic ID (24-char)"
                  value={topicIdInput}
                  onChange={(e) => setTopicIdInput(e.target.value)}
                  className={consultationInputClass}
                />
                <input
                  type="text"
                  placeholder="Topic name"
                  value={topicNameInput}
                  onChange={(e) => setTopicNameInput(e.target.value)}
                  className={consultationInputClass}
                />
                <Button
                  type="button"
                  onClick={addTopic}
                  className="h-9 bg-[#FBC078] text-[11px] font-bold text-black hover:bg-[#eeb46a]"
                >
                  Add
                </Button>
              </div>
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {topics.map((topic) => (
                    <span
                      key={topic._id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-black px-2.5 py-1 text-[10px] font-semibold text-white"
                    >
                      {topic.name}
                      <button type="button" onClick={() => removeTopic(topic._id)} aria-label={`Remove ${topic.name}`}>
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold tracking-tight text-white">
                  Session Outline
                </label>
                <textarea
                  placeholder="Describe what you will deliver..."
                  value={sessionOutline}
                  onChange={(e) => setSessionOutline(e.target.value)}
                  className={consultationTextareaClass}
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold tracking-tight text-white">
                  Who it is for?
                </label>
                <textarea
                  placeholder="Describe your target audience..."
                  value={whoItsFor}
                  onChange={(e) => setWhoItsFor(e.target.value)}
                  className={consultationTextareaClass}
                />
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (currentStep === 3) {
      return (
        <div className="animate-in fade-in slide-in-from-right-4 mx-auto w-full max-w-[850px] rounded-lg border border-white/5 bg-[#151515] p-5 duration-300">
          <div className="mb-6">
            <h2 className="mb-1 text-[13px] font-bold text-white">Additional</h2>
            <p className="text-[11px] font-medium text-[#777777]">
              Provide details about your Consultation
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold tracking-tight text-white">Languages</label>
              <input
                type="text"
                placeholder="English, Hindi"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className={consultationInputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-white">Pre-Requirement Session</p>
                    <p className="mt-1 text-[10px] text-[#777777]">
                      Mention any prerequisites that are essential.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasPreSessionRequirement((current) => !current)}
                    className={cn(
                      'relative h-4 w-8 rounded-full transition-colors',
                      hasPreSessionRequirement ? 'bg-white' : 'bg-[#777777]',
                    )}
                    aria-label="Toggle pre-requirement session"
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 size-3 rounded-full bg-[#151515] transition-all',
                        hasPreSessionRequirement ? 'right-0.5' : 'left-0.5',
                      )}
                    />
                  </button>
                </div>
                {hasPreSessionRequirement && (
                  <textarea
                    placeholder="Describe pre-session requirements"
                    value={preSessionRequirement}
                    onChange={(e) => setPreSessionRequirement(e.target.value)}
                    className={consultationTextareaClass}
                  />
                )}

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold tracking-tight text-white">
                      Follow up Window
                    </label>
                    <button
                      type="button"
                      onClick={() => setHasFollowUp((current) => !current)}
                      className={cn(
                        'relative h-4 w-8 rounded-full transition-colors',
                        hasFollowUp ? 'bg-white' : 'bg-[#777777]',
                      )}
                      aria-label="Toggle follow up"
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 size-3 rounded-full bg-[#151515] transition-all',
                          hasFollowUp ? 'right-0.5' : 'left-0.5',
                        )}
                      />
                    </button>
                  </div>
                  {hasFollowUp && (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={followUpDays}
                        onChange={(e) => setFollowUpDays(e.target.value)}
                        className="h-9 w-20 rounded-md border border-white/5 bg-black px-3 text-[11px] text-white outline-none"
                      />
                      <span className="flex h-9 items-center text-[11px] text-[#777777]">Days</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-white">Post-Session Requirement</p>
                    <p className="mt-1 text-[10px] text-[#777777]">
                      Customise message to your clients.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasPostSessionMessage((current) => !current)}
                    className={cn(
                      'relative h-4 w-8 rounded-full transition-colors',
                      hasPostSessionMessage ? 'bg-white' : 'bg-[#777777]',
                    )}
                    aria-label="Toggle post-session requirement"
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 size-3 rounded-full bg-[#151515] transition-all',
                        hasPostSessionMessage ? 'right-0.5' : 'left-0.5',
                      )}
                    />
                  </button>
                </div>
                {hasPostSessionMessage && (
                  <textarea
                    placeholder="Describe requirement"
                    value={postSessionMessage}
                    onChange={(e) => setPostSessionMessage(e.target.value)}
                    className={consultationTextareaClass}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (currentStep === 4) {
      return (
        <div className="animate-in fade-in slide-in-from-right-4 mx-auto w-full max-w-[850px] rounded-lg border border-white/5 bg-[#151515] p-5 duration-300">
          <div className="mb-6">
            <h2 className="mb-1 text-[13px] font-bold text-white">Pricing &amp; Duration</h2>
            <p className="text-[11px] font-medium text-[#777777]">
              Provide details about your Consultation
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-white">Mode Of Consultation</label>
              <div className="relative">
                <select
                  value={consultationMode}
                  onChange={(e) => setConsultationMode(e.target.value as 'audio' | 'video' | 'chat')}
                  className="h-9 w-full appearance-none rounded-md border border-white/5 bg-black px-3 pr-8 text-[11px] text-white outline-none"
                >
                  {CONSULTATION_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-white" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-white">Duration</label>
              <div className="relative">
                <select
                  value={consultationDuration}
                  onChange={(e) => setConsultationDuration(Number(e.target.value))}
                  className="h-9 w-full appearance-none rounded-md border border-white/5 bg-black px-3 pr-8 text-[11px] text-white outline-none"
                >
                  {DURATION_OPTIONS.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} mins
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-white" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-white">Pricing Option</label>
              <div className="overflow-hidden rounded-md border border-white/5 bg-black">
                {(['paid', 'free'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setConsultationPricingType(option)}
                    className="flex h-8 w-full items-center justify-between px-3 text-[11px] font-bold capitalize text-white"
                  >
                    {option}
                    <span
                      className={cn(
                        'flex size-3.5 items-center justify-center rounded-full border border-white',
                        consultationPricingType === option && 'bg-white',
                      )}
                    >
                      {consultationPricingType === option && (
                        <span className="size-1.5 rounded-full bg-black" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-white">Consultation Fees</label>
              <input
                type="text"
                placeholder="₹0.00"
                value={consultationPrice}
                onChange={(e) => setConsultationPrice(e.target.value)}
                disabled={consultationPricingType === 'free'}
                className={cn(consultationInputClass, consultationPricingType === 'free' && 'opacity-50')}
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="animate-in fade-in slide-in-from-right-4 mx-auto w-full max-w-[850px] rounded-lg border border-white/5 bg-[#151515] p-7 duration-300">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-[1fr_0.9fr]">
          <div className="border-l-4 border-[#FBC078] pl-4">
            <h2 className="text-[20px] font-bold text-white">Strategy Session</h2>
            <p className="mt-1 text-[12px] text-[#777777]">Business</p>

            <div className="mt-6 space-y-5">
              <div>
                <h3 className="mb-2 text-[12px] font-bold text-white">Session outline</h3>
                <p className="text-[12px] leading-relaxed text-[#9A9A9A]">
                  A focused strategy session designed to understand your current context, clarify key challenges, explore viable options, and define clear priorities, resulting in practical recommendations and next steps that support confident decision-making and effective execution.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-[12px] font-bold text-white">Pre-Session Requirement</h3>
                <p className="text-[12px] text-[#9A9A9A]">Keep your requirements and questions ready.</p>
              </div>
              <div>
                <h3 className="mb-2 text-[12px] font-bold text-white">Post-Session Requirement</h3>
                <p className="text-[12px] text-[#9A9A9A]">“Thank you consulting Dr. Malavika”</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-[12px] font-bold text-white">Who is it for?</h3>
                <p className="text-[12px] text-[#9A9A9A]">Start-up Founders, young entrepreneurs</p>
              </div>

              <div>
                <h3 className="mb-3 text-[12px] font-bold text-white">Additional Information</h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { icon: Phone, label: 'Mode', value: '' },
                    { icon: MessageCircle, label: 'English', value: '' },
                    { icon: Languages, label: 'Follow Ups', value: '5 days' },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-2">
                      <div className="flex h-10 min-w-12 items-center justify-center gap-2 rounded-md bg-black px-3">
                        <item.icon className="size-4 text-white" />
                        {item.value && <span className="text-[12px] font-bold text-white">{item.value}</span>}
                      </div>
                      <span className="text-center text-[11px] text-[#777777]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-[12px] font-bold text-white">Duration &amp; Pricing</h3>
                <span className="inline-flex rounded-md border border-white/40 px-4 py-2 text-[12px] font-bold text-white">
                  30mins (₹2,000)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbs = [
    { label: 'Expert management' },
    { label: 'Manage Experts' },
    { label: 'Sarah Johnson' },
    { label: 'Create Listing', isActive: true },
  ]

  const showDraftAction =
    selectedType !== 'consultation' &&
    ((currentStep > 1 && currentStep < 5) || (currentStep === 5 && pricingType === 'fixed'))

  const primaryActionLabel =
    currentStep === 1 ? (
      'Next'
    ) : currentStep === 5 ? (
      selectedType === 'consultation' ? (
        'Publish Consultation'
      ) : (
        <span className="flex items-center gap-2">
          Publish service
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )
    ) : (
      'Save & Continue'
    )

  const primaryActionClassName =
    currentStep === 5 ? 'bg-emerald-500 text-white hover:bg-emerald-600' : undefined

  return (
    <CreateListingWizard
      title="Create Service Listing"
      breadcrumbs={breadcrumbs}
      steps={activeSteps}
      currentStep={currentStep}
      onBack={handleBack}
      secondaryAction={showDraftAction ? { label: 'Save as Draft' } : undefined}
      primaryAction={{
        label: isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-3.5 animate-spin" />
            Saving...
          </span>
        ) : (
          primaryActionLabel
        ),
        onClick: handlePrimaryAction,
        disabled: (currentStep === 1 && !selectedType) || isSubmitting,
        className: primaryActionClassName,
      }}
    >
        {currentStep === 1 ? (
          <div className="mx-auto w-full max-w-[850px] rounded-lg border border-white/5 bg-[#151515] p-6 shadow-xl">
            <div className="mb-8">
              <h2 className="mb-2 text-[15px] font-bold text-white">Choose Service Type</h2>
              <p className="text-[12px] font-medium leading-relaxed text-[#777777]">
                Select what kind of offering you're listing. This decision controls the rest of the form.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <button
                onClick={() => setSelectedType('service')}
                className={cn(
                  "group relative flex flex-col items-center gap-4 overflow-hidden rounded-lg border p-7 text-center transition-all duration-300",
                  selectedType === 'service'
                    ? "bg-[#FBC078] border-[#FBC078] text-black shadow-lg"
                    : "bg-black border-white/5 text-[#888888] hover:border-white/10"
                )}
              >
                <div className={cn(
                  "flex size-11 items-center justify-center rounded-full shadow-sm transition-all duration-300",
                  selectedType === 'service' ? "bg-black text-white" : "bg-[#1A1A1A] text-white"
                )}>
                  <Briefcase className="size-5" />
                </div>
                <div className="space-y-2">
                  <h3 className={cn(
                    "text-[13px] font-bold tracking-tight",
                    selectedType === 'service' ? "text-black" : "text-white"
                  )}>
                    Service
                  </h3>
                  <p className={cn(
                    "max-w-[260px] text-[12px] font-semibold leading-relaxed",
                    selectedType === 'service' ? "text-black/80" : "text-[#555555]"
                  )}>
                    Best for clearly defined offerings with deliverables, pricing, and timelines
                  </p>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('consultation')}
                className={cn(
                  "group relative flex flex-col items-center gap-4 overflow-hidden rounded-lg border p-7 text-center transition-all duration-300",
                  selectedType === 'consultation'
                    ? "border-white bg-white text-black shadow-lg"
                    : "bg-black border-white/5 text-[#888888] hover:border-white/10"
                )}
              >
                <div className={cn(
                  "flex size-11 items-center justify-center rounded-full shadow-sm transition-all duration-300",
                  selectedType === 'consultation' ? "bg-black text-white" : "bg-[#1A1A1A] text-white"
                )}>
                  <MessageCircle className="size-5" />
                </div>
                <div className="space-y-2">
                  <h3 className={cn(
                    "text-[13px] font-bold tracking-tight",
                    selectedType === 'consultation' ? "text-black" : "text-white"
                  )}>
                    Consultation
                  </h3>
                  <p className={cn(
                    "max-w-[260px] text-[12px] font-medium leading-relaxed",
                    selectedType === 'consultation' ? "text-black" : "text-[#555555]"
                  )}>
                    Best for time-based or advisory sessions without fixed deliverables
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : selectedType === 'consultation' ? (
          renderConsultationStep()
        ) : currentStep === 2 ? (
          <div className="animate-in fade-in slide-in-from-right-4 mx-auto w-full max-w-[850px] rounded-lg border border-white/5 bg-[#151515] p-6 duration-300">
            <div className="mb-8">
              <h2 className="mb-1 text-[15px] font-bold text-white">About Service</h2>
              <p className="text-[12px] font-medium text-[#777777]">
                Provide details about your service offering
              </p>
            </div>

            <div className="space-y-6">
              {!partnerId && (
                <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
                  Add <code className="text-amber-200">?partnerId=&lt;id&gt;</code> to the URL before creating a listing.
                </p>
              )}

              <div className="space-y-2.5">
                <label className="text-[12px] font-bold tracking-tight text-white">
                  Service title *
                </label>
                <input
                  type="text"
                  placeholder="e.g NDA Review & Legal Advisory"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="h-10 w-full rounded-lg border border-white/5 bg-black px-3 text-[12px] text-white outline-none transition-colors placeholder:text-[#444444] focus:border-[#FBC078]/50"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2.5">
                  <label className="text-[12px] font-bold tracking-tight text-white">
                    Service Category *
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => {
                        setSelectedCategoryId(e.target.value)
                        setSelectedSubCategoryIds([])
                      }}
                      disabled={isCategoriesLoading}
                      className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-white/5 bg-black px-3 pr-10 text-[12px] text-white outline-none transition-colors focus:border-[#FBC078]/50 disabled:opacity-50"
                    >
                      <option value="" disabled>
                        {isCategoriesLoading ? 'Loading categories...' : 'Select category'}
                      </option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-[#444444] pointer-events-none group-hover:text-[#666666] transition-colors" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[12px] font-bold tracking-tight text-white">
                    Service sub-category
                  </label>
                  <div className="min-h-10 rounded-lg border border-white/5 bg-black px-3 py-2">
                    {!selectedCategoryId ? (
                      <p className="text-[11px] text-[#555555]">Select a category first</p>
                    ) : isSubcategoriesLoading ? (
                      <p className="text-[11px] text-[#555555]">Loading subcategories...</p>
                    ) : subcategories.length === 0 ? (
                      <p className="text-[11px] text-[#555555]">No subcategories available</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {subcategories.map((subCategory) => (
                          <button
                            key={subCategory._id}
                            type="button"
                            onClick={() => toggleSubCategory(subCategory._id)}
                            className={cn(
                              'rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-colors',
                              selectedSubCategoryIds.includes(subCategory._id)
                                ? 'border-[#FBC078] bg-[#FBC078]/10 text-[#FBC078]'
                                : 'border-white/10 text-[#888888] hover:border-white/30',
                            )}
                          >
                            {subCategory.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[12px] font-bold tracking-tight text-white">
                  Description
                </label>
                <textarea
                  placeholder="Describe your service offering..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[72px] w-full resize-none rounded-lg border border-white/5 bg-black p-3 text-[12px] leading-relaxed text-white outline-none transition-colors placeholder:text-[#444444] focus:border-[#FBC078]/50"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[12px] font-bold tracking-tight text-white">
                  Describe Deliverables
                </label>
                <textarea
                  placeholder="Describe what you will deliver to your client. Be specific about outputs, formats, and any revisions included..."
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  className="min-h-[88px] w-full resize-none rounded-lg border border-white/5 bg-black p-3 text-[12px] leading-relaxed text-white outline-none transition-colors placeholder:text-[#444444] focus:border-[#FBC078]/50"
                />
              </div>
            </div>
          </div>
        ) : currentStep === 3 ? (
          <div className="animate-in fade-in slide-in-from-right-4 mx-auto w-full max-w-[850px] space-y-5 duration-300">
            <div className="space-y-5 rounded-lg border border-white/5 bg-[#151515] p-5">
              <div>
                <h2 className="mb-1 text-[13px] font-bold text-white">Pricing Options</h2>
                <p className="text-[11px] font-medium text-[#777777]">
                  Select one pricing model. Each model has its own fields.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  onClick={() => setPricingType('fixed')}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-4 text-left transition-all duration-300",
                    pricingType === 'fixed'
                      ? "border-white/70 bg-black shadow-[0_0_15px_rgba(251,192,120,0.05)]"
                      : "border-white/40 bg-black hover:border-white/70"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border",
                    pricingType === 'fixed' ? "border-white" : "border-white/70"
                  )}>
                    {pricingType === 'fixed' && <div className="size-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h3 className="mb-1 text-[11px] font-bold text-white">Fixed Pricing</h3>
                    <p className="text-[10px] leading-snug text-[#777777]">
                      Best for clearly defined scope, deliverables, and deadlines
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setPricingType('custom')}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-4 text-left transition-all duration-300",
                    pricingType === 'custom'
                      ? "border-white/70 bg-black shadow-[0_0_15px_rgba(251,192,120,0.05)]"
                      : "border-white/40 bg-black hover:border-white/70"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border",
                    pricingType === 'custom' ? "border-white" : "border-white/70"
                  )}>
                    {pricingType === 'custom' && <div className="size-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h3 className="mb-1 text-[11px] font-bold text-white">Custom Pricing</h3>
                    <p className="text-[10px] leading-snug text-[#777777]">
                      Best for flexible scope, evolving requirements, variable timelines
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setPricingType('tiered')}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-4 text-left transition-all duration-300 md:col-span-1",
                    pricingType === 'tiered'
                      ? "border-white/70 bg-black shadow-[0_0_15px_rgba(251,192,120,0.05)]"
                      : "border-white/40 bg-black hover:border-white/70"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border",
                    pricingType === 'tiered' ? "border-white" : "border-white/70"
                  )}>
                    {pricingType === 'tiered' && <div className="size-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h3 className="mb-1 text-[11px] font-bold text-white">Tiered Pricing</h3>
                    <p className="text-[10px] leading-snug text-[#777777]">
                      Best for multiple service levels with increasing value
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              {pricingType === 'fixed' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-5 rounded-lg border border-white/5 bg-[#151515] p-5 duration-500">
                  <h2 className="text-[13px] font-bold text-white">Fixed Pricing Details</h2>

                  <div className="flex flex-col items-start gap-5 md:flex-row">
                    <div className="w-full flex-1 space-y-5">
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold tracking-tight text-white">Price *</label>
                        <input
                          type="text"
                          placeholder="Enter Price"
                          value={fixedPrice}
                          onChange={(e) => setFixedPrice(e.target.value)}
                          className="h-9 w-full rounded-lg border border-white/5 bg-black px-3 text-[11px] text-white outline-none transition-colors placeholder:text-[#444444] focus:border-[#FBC078]/50"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold tracking-tight text-white">Set Timelines *</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={fixedTimeline}
                            onChange={(e) => setFixedTimeline(e.target.value)}
                            className="h-9 w-full rounded-lg border border-white/5 bg-black px-3 text-[11px] text-white outline-none transition-colors focus:border-[#FBC078]/50"
                          />
                          <div className="group relative w-20 shrink-0">
                            <select
                              value={fixedTimelineUnit}
                              onChange={(e) => setFixedTimelineUnit(e.target.value)}
                              className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-white/5 bg-black px-3 pr-8 text-[11px] text-white outline-none transition-colors focus:border-[#FBC078]/50"
                            >
                              <option>Days</option>
                              <option>Weeks</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-[#666666]" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold tracking-tight text-white">Discount (%)</label>
                          <Info className="size-3 text-[#666666] cursor-help" />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {['00%', '10%', '15%', '20%'].map((discount) => (
                            <button
                              key={discount}
                              onClick={() => setSelectedDiscount(discount)}
                              className={cn(
                                "rounded-md px-4 py-2 text-[11px] font-bold transition-all duration-200",
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

                    <div className="w-full md:w-[260px]">
                      <div className="flex gap-3 rounded-lg border border-emerald-500/15 bg-[#14521f] p-4">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-900/60">
                          <MapPin className="size-3.5 text-emerald-200" />
                        </div>
                        <p className="text-[10px] font-medium leading-relaxed text-white">
                          The market rate for NDA review is ₹6K–₹15K. It's recommended to set your price within this range.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pricingType === 'custom' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-5 rounded-lg border border-white/5 bg-[#151515] p-5 duration-500">
                  <h2 className="text-[13px] font-bold text-white">Custom Pricing Details</h2>

                  <div className="flex flex-col items-start gap-5 md:flex-row">
                    <div className="w-full flex-1 space-y-5">
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold tracking-tight text-white">Set Price *</label>
                        <input
                          type="text"
                          placeholder="Enter price"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          className="h-9 w-full rounded-lg border border-white/5 bg-black px-3 text-[11px] text-white outline-none transition-colors placeholder:text-[#444444] focus:border-[#FBC078]/50"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-bold tracking-tight text-white">Times lines *</label>
                        <div className="flex gap-5">
                          <button
                            onClick={() => setTimelineType('long')}
                            className="group flex items-center gap-2"
                          >
                            <div className={cn(
                              "flex size-3.5 items-center justify-center rounded-full border transition-all",
                              timelineType === 'long' ? "border-white" : "border-white/70"
                            )}>
                              {timelineType === 'long' && <div className="size-1.5 rounded-full bg-white" />}
                            </div>
                            <span className={cn(
                              "text-[11px] font-medium transition-colors",
                              timelineType === 'long' ? "text-white" : "text-[#777777]"
                            )}>Long term</span>
                          </button>
                          <button
                            onClick={() => setTimelineType('short')}
                            className="group flex items-center gap-2"
                          >
                            <div className={cn(
                              "flex size-3.5 items-center justify-center rounded-full border transition-all",
                              timelineType === 'short' ? "border-white" : "border-white/70"
                            )}>
                              {timelineType === 'short' && <div className="size-1.5 rounded-full bg-white" />}
                            </div>
                            <span className={cn(
                              "text-[11px] font-medium transition-colors",
                              timelineType === 'short' ? "text-white" : "text-[#777777]"
                            )}>Short term</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-[#777777]">
                          Best for services with flexible scope, evolving requirements, and variable timelines.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold tracking-tight text-white">Set Timelines *</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={customTimelineMin}
                            onChange={(e) => setCustomTimelineMin(e.target.value)}
                            className="h-9 w-24 rounded-lg border border-white/5 bg-black px-3 text-center text-[11px] text-white outline-none transition-colors focus:border-[#FBC078]/50"
                          />
                          <span className="text-[11px] font-medium text-[#555555]">To</span>
                          <input
                            type="text"
                            value={customTimelineMax}
                            onChange={(e) => setCustomTimelineMax(e.target.value)}
                            className="h-9 w-24 rounded-lg border border-white/5 bg-black px-3 text-center text-[11px] text-white outline-none transition-colors focus:border-[#FBC078]/50"
                          />
                          <div className="group relative w-20 shrink-0">
                            <select
                              value={customTimelineUnit}
                              onChange={(e) => setCustomTimelineUnit(e.target.value)}
                              className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-white/5 bg-black px-3 pr-8 text-[11px] text-white outline-none transition-colors focus:border-[#FBC078]/50"
                            >
                              <option value="Days">Days</option>
                              <option value="Weeks">Weeks</option>
                              <option value="Months">Months</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-[#666666]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-[260px]">
                      <div className="flex gap-3 rounded-lg border border-emerald-500/15 bg-[#14521f] p-4">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-900/60">
                          <MapPin className="size-3.5 text-emerald-200" />
                        </div>
                        <p className="text-[10px] font-medium leading-relaxed text-white">
                          The market rate for NDA review is ₹6K–₹15K. It's recommended to set your price within this range.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pricingType === 'tiered' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-5 rounded-lg border border-white/5 bg-[#151515] p-5 duration-500">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[13px] font-bold text-white">Tiered Pricing Details</h2>
                    <Button className="flex h-8 items-center gap-2 rounded-md bg-[#FBC078] px-4 text-[11px] font-bold text-black hover:bg-[#FBC078]/90">
                      <Plus className="size-3.5" />
                      Add Tier
                    </Button>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold tracking-tight text-white">Tier Name *</label>
                        <input
                          type="text"
                          placeholder="Standard"
                          className="h-9 w-full rounded-lg border border-white/5 bg-black px-3 text-[11px] text-white outline-none transition-colors placeholder:text-[#444444] focus:border-[#FBC078]/50"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold tracking-tight text-white">Price *</label>
                        <input
                          type="text"
                          placeholder="enter Price here..."
                          value={tieredStandardPrice}
                          onChange={(e) => setTieredStandardPrice(e.target.value)}
                          className="h-9 w-full rounded-lg border border-white/5 bg-black px-3 text-[11px] text-white outline-none transition-colors placeholder:text-[#444444] focus:border-[#FBC078]/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[11px] font-bold tracking-tight text-white">Basic</label>
                      <div className="rounded-lg border border-white/5 bg-black p-4">
                        <ul className="space-y-1">
                          {[
                            "Priority access to event",
                            "Access to live session",
                            "Post-event recording (24h access)",
                            "Access to live session",
                            "Post-event recording (24h access)"
                          ].map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11px] text-white">
                              <span className="mt-1 text-[9px] text-white">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="max-w-[300px] space-y-2.5">
                      <label className="text-[11px] font-bold tracking-tight text-white">Set Timelines *</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={tieredStandardTimeline.split(' ')[0]}
                          onChange={(e) => setTieredStandardTimeline(e.target.value.padStart(2, '0') + ' Days')}
                          className="h-9 w-full rounded-lg border border-white/5 bg-black px-3 text-center text-[11px] text-white outline-none transition-colors focus:border-[#FBC078]/50"
                        />
                        <div className="group relative w-20 shrink-0">
                          <select className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-white/5 bg-black px-3 pr-8 text-[11px] text-white outline-none transition-colors focus:border-[#FBC078]/50">
                            <option>Days</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-[#666666]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : currentStep === 4 ? (
          <div className="animate-in fade-in slide-in-from-right-4 mx-auto w-full max-w-[850px] space-y-5 rounded-lg border border-white/5 bg-[#151515] p-5 duration-300">
            <div>
              <h2 className="mb-1 text-[13px] font-bold text-white">Gallery</h2>
              <p className="text-[11px] font-medium text-[#777777]">
                Upload visual assets to support your service (optional)
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-bold text-white">
                Maximum {MAX_IMAGES} images. Allowed formats: JPG, PNG, WebP
              </p>

              <div
                onClick={() => uploadedImages.length < MAX_IMAGES && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              className={cn(
                  "flex cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-md border border-dashed py-8 transition-all duration-300",
                  isDragging
                    ? "border-[#FBC078]/60 bg-[#FBC078]/5"
                    : uploadedImages.length >= MAX_IMAGES
                      ? "border-white/5 bg-black/30 cursor-not-allowed opacity-50"
                      : "border-white/40 bg-black hover:border-[#FBC078]/40 hover:bg-[#FBC078]/5"
                )}
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-[#161616]">
                  <Upload className="size-4 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold text-white">
                    {uploadedImages.length >= MAX_IMAGES ? 'Maximum images reached' : 'Click to upload Images'}
                  </p>
                  {uploadedImages.length < MAX_IMAGES && (
                    <p className="mt-1 text-[10px] text-[#777777]">Or drag &amp; drop</p>
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
                  <p className="text-[11px] font-semibold text-white">
                    Uploaded Images ({uploadedImages.length}/{MAX_IMAGES})
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {uploadedImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.url}
                          alt={img.name}
                          className="h-[90px] w-[90px] rounded-md border border-white/5 object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(img.id)}
                          className="absolute top-1.5 left-1.5 rounded-full bg-red-500 px-2 py-0.5 text-[8px] font-bold text-white shadow-lg transition-colors hover:bg-red-600"
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
          <div className="animate-in fade-in slide-in-from-right-4 mx-auto w-full max-w-[850px] space-y-5 rounded-lg border border-white/5 bg-[#151515] p-6 duration-300">
            <div>
              <h2 className="mb-1 text-[13px] font-bold text-white">Review &amp; Publish</h2>
              <p className="text-[11px] font-medium text-[#777777]">
                Review your service listing details before publishing
              </p>
            </div>

            <div className="flex flex-col items-start gap-7 md:flex-row">
              
              <div className="flex w-full shrink-0 flex-col gap-5 md:w-[360px]">
                <div className="relative h-[210px] w-full overflow-hidden rounded-lg border border-white/5">
                  <img
                    src={uploadedImages.length > 0 ? uploadedImages[0].url : "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000"}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md border border-white/10 bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-sm">
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
                    <div className="space-y-4">
                      <div className="flex w-full justify-between rounded-full border border-white/5 bg-black p-1">
                        {(['Basic', 'Standard', 'Premium'] as const).map((tier) => (
                          <button
                            key={tier}
                            onClick={() => setSelectedTier(tier)}
                            className={cn(
                              'flex-1 rounded-full px-5 py-2 text-center text-[11px] font-bold transition-all duration-300',
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
                        <p className="text-[12px] font-medium text-white">{current.description}</p>
                        <ul className="ml-1 space-y-1.5">
                          {current.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-[12px] font-medium text-white">
                              <span className="mt-1.5 text-[9px] text-white">•</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-4 pt-1">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex min-w-[92px] items-center justify-center rounded-md border border-white/15 bg-[#151515] px-4 py-2">
                            <span className="text-[11px] font-bold text-white">{current.price}</span>
                          </div>
                          <span className="text-center text-[11px] font-medium text-[#777777]">Pricing</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex min-w-[92px] items-center justify-center rounded-md border border-white/15 bg-[#151515] px-4 py-2">
                            <span className="text-[11px] font-bold text-white">{current.timeline}</span>
                          </div>
                          <span className="text-center text-[11px] font-medium text-[#777777]">Timelines</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div className="flex flex-1 flex-col justify-between self-stretch">
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 text-[21px] font-bold tracking-tight text-white">NDA Document Review</h3>
                    <span className="text-[12px] font-medium text-[#777777]">Legal</span>
                  </div>

                  <p className="text-[13px] font-medium leading-relaxed text-white">
                    Get your Non-Disclosure Agreement reviewed to identify risks, unclear clauses, and potential gaps. Receive clear feedback on confidentiality terms, obligations, and limitations so you can sign or share documents with confidence.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {['NDA review', 'Policy review'].map((tag) => (
                      <span key={tag} className="rounded-md border border-white/20 bg-[#151515] px-3 py-1.5 text-[11px] font-bold text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {pricingType === 'fixed' && (
                  <div className="mt-auto flex flex-wrap gap-4 pt-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex min-w-[92px] items-center justify-center rounded-md border border-white/15 bg-[#151515] px-4 py-2">
                        <span className="text-[11px] font-bold text-white">{fixedPrice}</span>
                      </div>
                      <span className="text-center text-[11px] font-medium text-[#777777]">Pricing</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex min-w-[92px] items-center justify-center rounded-md border border-white/15 bg-[#151515] px-4 py-2">
                        <span className="text-[11px] font-bold text-white">{selectedDiscount} Off</span>
                      </div>
                      <span className="text-center text-[11px] font-medium text-[#777777]">Discounts</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex min-w-[92px] items-center justify-center rounded-md border border-white/15 bg-[#151515] px-4 py-2">
                        <span className="text-[11px] font-bold text-white">{fixedTimeline} {fixedTimelineUnit}</span>
                      </div>
                      <span className="text-center text-[11px] font-medium text-[#777777]">Timelines</span>
                    </div>
                  </div>
                )}

                {pricingType === 'custom' && (
                  <div className="mt-auto flex flex-wrap gap-4 pt-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex min-w-[92px] items-center justify-center rounded-md border border-white/15 bg-[#151515] px-4 py-2">
                        <span className="text-[11px] font-bold text-white">{customPrice}</span>
                      </div>
                      <span className="text-center text-[11px] font-medium text-[#777777]">Starting From</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex min-w-[92px] items-center justify-center rounded-md border border-white/15 bg-[#151515] px-4 py-2">
                        <span className="text-[11px] font-bold text-white">{timelineType === 'long' ? 'Long term' : 'Short term'} ({customTimelineMin}-{customTimelineMax} {customTimelineUnit})</span>
                      </div>
                      <span className="text-center text-[11px] font-medium text-[#777777]">Timelines</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-[#444444] italic">
            Step {currentStep} coming soon...
          </div>
        )}
    </CreateListingWizard>
  )
}