import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import {
  Briefcase,
  MessageCircle,
  Info,
  Upload,
  Phone,
  Languages,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { navigateBackOrFallback } from '@/shared/lib/navigation'
import { toast } from 'sonner'
import { useCategories, useSubcategories } from '@/modules/expert/hooks/use-categories'
import {
  useConsultationTopics,
  useCreateConsultation,
  useCreateService,
  usePublishConsultation,
  usePublishService,
  useUpdateConsultationAdditionalInfo,
  useUpdateConsultationBasic,
  useUpdateConsultationPricing,
  useUpdateServiceGallery,
  useUpdateServicePricing,
} from '@/modules/expert/hooks/use-create-listing'
import { useConsultation } from '@/modules/expert/hooks/use-services'
import { useExpertProfile } from '@/modules/expert/hooks/use-expert-profile'
import {
  fetchPricingRecommendation,
  type PricingRecommendationResult,
} from '@/modules/expert/api/service-api'
import {
  CONSULTATION_MODES,
  DURATION_OPTIONS,
  getApiErrorMessage,
  normalizeTimelineUnit,
  parsePrice,
} from '@/modules/expert/lib/listing-form-utils'
import type { ConsultationTopic } from '@/modules/expert/type/service'
import type { UpdateServicePricingPayload } from '@/modules/expert/type/service'
import { cn } from '@/shared/lib/cn'
import { RequiredMark } from '@/shared/components/form/required-mark'
import { CreateListingWizard } from '@/modules/expert/components'
import { useServiceListingControls } from '@/modules/settings/hooks/use-service-public-settings'
import { useSettingsModule } from '@/modules/settings/hooks/use-settings'

type UploadedImage = {
  id: string
  url: string
  name: string
  file: File
}

type TierName = 'basic' | 'standard' | 'premium'

type ServiceTierForm = {
  name: TierName
  description: string
  price: string
  timelineValue: string
  timelineUnit: string
}

const DEFAULT_SERVICE_TIERS: ServiceTierForm[] = [
  { name: 'basic', description: '', price: '', timelineValue: '', timelineUnit: 'Days' },
  { name: 'standard', description: '', price: '', timelineValue: '', timelineUnit: 'Days' },
  { name: 'premium', description: '', price: '', timelineValue: '', timelineUnit: 'Days' },
]

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
  const consultationIdParam = searchParams.get('consultationId') || ''
  const isEditMode = searchParams.get('mode') === 'edit' && Boolean(consultationIdParam)

  const { data: expertProfileResponse } = useExpertProfile(partnerId || undefined)
  const { data: consultationEditResponse, isLoading: isConsultationEditLoading } = useConsultation(
    consultationIdParam,
    isEditMode,
  )
  const expertName =
    expertProfileResponse?.data?.basicProfile?.fullname ||
    expertProfileResponse?.data?.fullname ||
    'Expert'
  const [currentStep, setCurrentStep] = useState(isEditMode ? 2 : 1)
  const [selectedType, setSelectedType] = useState<'service' | 'consultation' | null>(
    isEditMode ? 'consultation' : 'service',
  )
  const [listingId, setListingId] = useState<string | null>(isEditMode ? consultationIdParam : null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasPrefill, setHasPrefill] = useState(false)

  const [serviceTitle, setServiceTitle] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [deliverables, setDeliverables] = useState('')

  const [consultationTitle, setConsultationTitle] = useState('')
  const [topics, setTopics] = useState<ConsultationTopic[]>([])
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
  const categories = useMemo(() => categoriesResponse?.data || [], [categoriesResponse?.data])
  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === selectedCategoryId),
    [categories, selectedCategoryId],
  )
  const subcategories = useMemo(() => {
    const apiData = subcategoriesResponse?.data
    if (Array.isArray(apiData) && apiData.length > 0) {
      return apiData
    }
    if (selectedCategory?.subCategories && selectedCategory.subCategories.length > 0) {
      return selectedCategory.subCategories
    }
    return []
  }, [subcategoriesResponse?.data, selectedCategory])

  const createServiceMutation = useCreateService()
  const updateServicePricingMutation = useUpdateServicePricing()
  const updateServiceGalleryMutation = useUpdateServiceGallery()
  const publishServiceMutation = usePublishService()
  const createConsultationMutation = useCreateConsultation()
  const updateConsultationBasicMutation = useUpdateConsultationBasic()
  const { data: topicsResponse, isLoading: isTopicsLoading } = useConsultationTopics({ limit: 100 })
  const topicOptions = topicsResponse?.data || []
  const updateConsultationAdditionalInfoMutation = useUpdateConsultationAdditionalInfo()
  const updateConsultationPricingMutation = useUpdateConsultationPricing()
  const publishConsultationMutation = usePublishConsultation()
  const {
    allowNewServiceListings,
    allowNewConsultationListings,
    allowSinglePriceListing,
    allowTierPriceListing,
    allowCustomPriceListing,
    displayAiPriceRecommendation: publicDisplayAi,
    maxListingDiscountPercent,
    maxConsultationFollowUpDays,
  } = useServiceListingControls()

  // Admin create flow: prefer live admin module settings (same source as Settings tab).
  // Ignore placeholderData defaults so AI isn't forced ON before real settings load.
  const adminServiceSettings = useSettingsModule('service')
  const adminAiFlag =
    adminServiceSettings.data?.config?.pricingDetails?.displayAiPriceRecommendation
  const displayAiPriceRecommendation =
    adminServiceSettings.isSuccess &&
    !adminServiceSettings.isPlaceholderData &&
    typeof adminAiFlag === 'boolean'
      ? adminAiFlag === true
      : publicDisplayAi === true

  const [pricingTypePreference, setPricingType] = useState<'fixed' | 'custom' | 'tiered'>('fixed')
  const [selectedDiscountPreference, setSelectedDiscount] = useState<string>('10%')
  const [timelineType, setTimelineType] = useState<'long' | 'short'>('long')
  const [selectedTier, setSelectedTier] = useState<TierName>('standard')
  const [fixedPrice, setFixedPrice] = useState('₹60,000.00')
  const [fixedTimeline, setFixedTimeline] = useState('25')
  const [fixedTimelineUnit, setFixedTimelineUnit] = useState('Days')
  const [customPrice, setCustomPrice] = useState('₹60,000.00')
  const [customTimelineMin, setCustomTimelineMin] = useState('2')
  const [customTimelineMax, setCustomTimelineMax] = useState('5')
  const [customTimelineUnit, setCustomTimelineUnit] = useState('Months')
  const [tiers, setTiers] = useState<ServiceTierForm[]>(DEFAULT_SERVICE_TIERS)
  const [pricingRecommendation, setPricingRecommendation] =
    useState<PricingRecommendationResult | null>(null)
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false)

  const allowedPricingTypes = useMemo(() => {
    const allowed: Array<'fixed' | 'custom' | 'tiered'> = []
    if (allowSinglePriceListing) allowed.push('fixed')
    if (allowCustomPriceListing) allowed.push('custom')
    if (allowTierPriceListing) allowed.push('tiered')
    return allowed
  }, [allowSinglePriceListing, allowCustomPriceListing, allowTierPriceListing])

  const pricingType = allowedPricingTypes.includes(pricingTypePreference)
    ? pricingTypePreference
    : (allowedPricingTypes[0] ?? 'fixed')

  const maxDiscountPct = maxListingDiscountPercent || 50
  const selectedDiscountPct = Number.parseInt(selectedDiscountPreference.replace('%', ''), 10) || 0
  const selectedDiscount =
    selectedDiscountPct > maxDiscountPct
      ? `${Math.min(10, maxDiscountPct)}%`
      : selectedDiscountPreference

  const activeCategoryName = useMemo(() => {
    return categories.find((c) => c._id === selectedCategoryId)?.name || ''
  }, [categories, selectedCategoryId])

  useEffect(() => {
    let cancelled = false

    const rawPrice =
      pricingType === 'fixed'
        ? fixedPrice
        : pricingType === 'custom'
          ? customPrice
          : tiers.find((t) => t.name === selectedTier)?.price || '0'

    const numericPrice = parsePrice(rawPrice)
    const discountNum = Number.parseInt(selectedDiscount.replace('%', ''), 10) || 0

    const loadRecommendation = async () => {
      if (!displayAiPriceRecommendation) {
        setPricingRecommendation(null)
        setIsRecommendationLoading(false)
        return
      }
      setIsRecommendationLoading(true)
      try {
        const res = await fetchPricingRecommendation({
          service_id: selectedCategoryId || undefined,
          service_name: serviceTitle || activeCategoryName || undefined,
          proposed_price: numericPrice > 0 ? numericPrice : undefined,
          requested_discount_pct: discountNum,
          scope: selectedTier,
        })
        if (!cancelled && res.success && res.data) {
          setPricingRecommendation(res.data)
        }
      } catch (err) {
        console.warn('Failed to fetch AI pricing recommendation:', err)
      } finally {
        if (!cancelled) {
          setIsRecommendationLoading(false)
        }
      }
    }

    void loadRecommendation()

    return () => {
      cancelled = true
    }
  }, [
    serviceTitle,
    selectedCategoryId,
    activeCategoryName,
    pricingType,
    fixedPrice,
    customPrice,
    tiers,
    selectedTier,
    selectedDiscount,
    displayAiPriceRecommendation,
  ])

  const updateTier = (name: TierName, field: keyof ServiceTierForm, value: string) => {
    setTiers((current) =>
      current.map((tier) => (tier.name === name ? { ...tier, [field]: value } : tier)),
    )
  }

  const buildServiceTiers = () =>
    tiers
      .filter((tier) => tier.price.trim() !== '')
      .map((tier) => ({
        name: tier.name,
        description: tier.description.trim(),
        price: parsePrice(tier.price),
        timelineValue: Number.parseInt(tier.timelineValue, 10) || 0,
        timelineUnit: normalizeTimelineUnit(tier.timelineUnit),
      }))
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const MAX_IMAGES = 5

  if (isEditMode && !hasPrefill && consultationEditResponse?.data) {
    const consultation = consultationEditResponse.data
    setListingId(consultation._id)
    setSelectedType('consultation')
    setConsultationTitle(consultation.title || '')
    setTopics(consultation.topics || [])
    setSessionOutline(consultation.sessionOutline || '')
    setWhoItsFor(consultation.whoItsFor || '')
    setLanguages((consultation.languages || []).join(', '))
    setHasPreSessionRequirement(Boolean(consultation.hasPreSessionRequirement))
    setPreSessionRequirement(consultation.preSessionRequirement || '')
    setHasPostSessionMessage(Boolean(consultation.hasPostSessionMessage))
    setPostSessionMessage(consultation.postSessionMessage || '')
    setHasFollowUp(Boolean(consultation.hasFollowUp))
    setFollowUpDays(consultation.followUpDays != null ? String(consultation.followUpDays) : '7')

    const mode = consultation.mode
    if (mode === 'audio' || mode === 'video' || mode === 'chat') {
      setConsultationMode(mode)
    }

    const primaryPricing = consultation.pricingOptions?.[0]
    if (primaryPricing) {
      setConsultationDuration(primaryPricing.durationMinutes || 30)
      const pricingType = primaryPricing.pricingType === 'free' ? 'free' : 'paid'
      setConsultationPricingType(pricingType)
      setConsultationPrice(
        pricingType === 'paid' && primaryPricing.price != null ? String(primaryPricing.price) : '',
      )
    }

    setHasPrefill(true)
  }

  const handleFilesAdded = useCallback(
    (files: FileList | null) => {
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
    },
    [uploadedImages.length],
  )

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
    if (isEditMode && currentStep <= 2) {
      navigate(partnerId ? `/experts/management/profile/${partnerId}` : '/services/management')
      return
    }
    if (currentStep > 1) setCurrentStep(currentStep - 1)
    else navigateBackOrFallback(navigate, '/services/management')
  }

  const toggleSubCategory = (subCategoryId: string) => {
    setSelectedSubCategoryIds((current) =>
      current.includes(subCategoryId)
        ? current.filter((id) => id !== subCategoryId)
        : [...current, subCategoryId],
    )
  }

  const addTopicById = (topicId: string) => {
    if (!topicId) return
    const topic = topicOptions.find((option) => option._id === topicId)
    if (!topic) return
    if (topics.some((selected) => selected._id === topic._id)) return
    setTopics((current) => [...current, topic])
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
        tiers: buildServiceTiers(),
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
          if (!allowNewServiceListings) {
            toast.error('Creating new service listings is disabled by admin settings.')
            return
          }
          if (!serviceTitle.trim()) {
            toast.error('Service title is required.')
            return
          }
          if (!selectedCategoryId) {
            toast.error('Service category is required.')
            return
          }

          // Do not stamp pricingType here — step 3 sets it via /pricing so a
          // default "fixed" cannot stick on a listing the user configures as tiered.
          const response = await createServiceMutation.mutateAsync({
            partnerId,
            title: serviceTitle.trim(),
            category: selectedCategoryId,
            subCategory: selectedSubCategoryIds,
            description: description.trim() || undefined,
            deliverables: deliverables.trim() || undefined,
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
          if (pricingType === 'tiered') {
            const builtTiers = buildServiceTiers()
            if (builtTiers.length === 0) {
              toast.error('Add at least one tier with a price.')
              return
            }
            const invalidTier = builtTiers.find(
              (tier) => !tier.description || tier.price <= 0 || tier.timelineValue <= 0,
            )
            if (invalidTier) {
              toast.error(
                `Complete the ${invalidTier.name} tier: description, price, and timeline.`,
              )
              return
            }
          }

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

          if (!listingId && !allowNewConsultationListings) {
            toast.error('Creating new consultation listings is disabled by admin settings.')
            return
          }

          if (hasFollowUp) {
            const days = Number.parseInt(followUpDays, 10) || 0
            if (days > maxConsultationFollowUpDays) {
              toast.error(`Follow-up period cannot exceed ${maxConsultationFollowUpDays} day(s).`)
              return
            }
          }

          const response = listingId
            ? await updateConsultationBasicMutation.mutateAsync({
                id: listingId,
                payload: {
                  title: consultationTitle.trim(),
                  topics,
                  sessionOutline: sessionOutline.trim(),
                  whoItsFor: whoItsFor.trim(),
                },
              })
            : await createConsultationMutation.mutateAsync({
                partnerId,
                title: consultationTitle.trim(),
                topics,
                sessionOutline: sessionOutline.trim(),
                whoItsFor: whoItsFor.trim(),
              })

          if (!listingId) {
            setListingId(response.data?._id || null)
          }
          toast.success(
            listingId
              ? 'Consultation details updated successfully'
              : 'Consultation created successfully',
          )
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
          toast.success(
            isEditMode
              ? 'Consultation updated successfully'
              : 'Consultation published successfully',
          )
          navigate(
            isEditMode && partnerId
              ? `/experts/management/profile/${partnerId}`
              : '/services/management',
          )
        }
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save listing'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeSteps = selectedType === 'consultation' ? consultationSteps : serviceSteps

  const consultationInputClass = 'ui-input h-9'
  const consultationTextareaClass = 'ui-textarea min-h-[92px]'

  const renderConsultationStep = () => {
    if (currentStep === 2) {
      return (
        <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface mx-auto w-full max-w-[1140px] rounded-lg border border-white/5 p-5 duration-300">
          <div className="mb-6">
            <h2 className="mb-1 text-[13px] font-bold text-white">About Consultation</h2>
            <p className="text-body-sm text-muted font-medium">
              Provide details about your Consultation
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-body-sm font-bold tracking-tight text-white">
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
              <label className="text-body-sm font-bold tracking-tight text-white">Add Topics</label>
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => addTopicById(e.target.value)}
                  disabled={isTopicsLoading}
                  className={cn(consultationInputClass, 'appearance-none pr-8 disabled:opacity-50')}
                >
                  <option value="" disabled>
                    {isTopicsLoading
                      ? 'Loading topics...'
                      : topicOptions.length === 0
                        ? 'No topics available'
                        : 'Select a topic'}
                  </option>
                  {topicOptions
                    .filter((option) => !topics.some((selected) => selected._id === option._id))
                    .map((option) => (
                      <option key={option._id} value={option._id}>
                        {option.name}
                      </option>
                    ))}
                </select>
              </div>
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {topics.map((topic) => (
                    <span
                      key={topic._id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-black px-2.5 py-1 text-[10px] font-semibold text-white"
                    >
                      {topic.name}
                      <button
                        type="button"
                        onClick={() => removeTopic(topic._id)}
                        aria-label={`Remove ${topic.name}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2.5">
                <label className="text-body-sm font-bold tracking-tight text-white">
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
                <label className="text-body-sm font-bold tracking-tight text-white">
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
        <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface mx-auto w-full max-w-[1140px] rounded-lg border border-white/5 p-5 duration-300">
          <div className="mb-6">
            <h2 className="mb-1 text-[13px] font-bold text-white">Additional</h2>
            <p className="text-body-sm text-muted font-medium">
              Provide details about your Consultation
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-body-sm font-bold tracking-tight text-white">Languages</label>
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
                    <p className="text-body-sm font-bold text-white">Pre-Requirement Session</p>
                    <p className="text-muted mt-1 text-[10px]">
                      Mention any prerequisites that are essential.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasPreSessionRequirement((current) => !current)}
                    className={cn(
                      'relative h-4 w-8 rounded-full transition-colors',
                      hasPreSessionRequirement ? 'bg-white' : 'bg-brand-muted',
                    )}
                    aria-label="Toggle pre-requirement session"
                  >
                    <span
                      className={cn(
                        'bg-brand-surface absolute top-0.5 size-3 rounded-full transition-all',
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
                    <label className="text-body-sm font-bold tracking-tight text-white">
                      Follow up Window
                    </label>
                    <button
                      type="button"
                      onClick={() => setHasFollowUp((current) => !current)}
                      className={cn(
                        'relative h-4 w-8 rounded-full transition-colors',
                        hasFollowUp ? 'bg-white' : 'bg-brand-muted',
                      )}
                      aria-label="Toggle follow up"
                    >
                      <span
                        className={cn(
                          'bg-brand-surface absolute top-0.5 size-3 rounded-full transition-all',
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
                        className="text-body-sm h-9 w-20 rounded-md border border-white/5 bg-black px-3 text-white outline-none"
                      />
                      <span className="text-body-sm text-muted flex h-9 items-center">Days</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-sm font-bold text-white">Post-Session Requirement</p>
                    <p className="text-muted mt-1 text-[10px]">
                      Customise message to your clients.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasPostSessionMessage((current) => !current)}
                    className={cn(
                      'relative h-4 w-8 rounded-full transition-colors',
                      hasPostSessionMessage ? 'bg-white' : 'bg-brand-muted',
                    )}
                    aria-label="Toggle post-session requirement"
                  >
                    <span
                      className={cn(
                        'bg-brand-surface absolute top-0.5 size-3 rounded-full transition-all',
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
        <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface mx-auto w-full max-w-[1140px] rounded-lg border border-white/5 p-5 duration-300">
          <div className="mb-6">
            <h2 className="mb-1 text-[13px] font-bold text-white">Pricing &amp; Duration</h2>
            <p className="text-body-sm text-muted font-medium">
              Provide details about your Consultation
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2.5">
              <label className="text-body-sm font-bold text-white">Mode Of Consultation</label>
              <div className="relative">
                <select
                  value={consultationMode}
                  onChange={(e) =>
                    setConsultationMode(e.target.value as 'audio' | 'video' | 'chat')
                  }
                  className="text-body-sm h-9 w-full appearance-none rounded-md border border-white/5 bg-black px-3 pr-8 text-white outline-none"
                >
                  {CONSULTATION_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-body-sm font-bold text-white">Duration</label>
              <div className="relative">
                <select
                  value={consultationDuration}
                  onChange={(e) => setConsultationDuration(Number(e.target.value))}
                  className="text-body-sm h-9 w-full appearance-none rounded-md border border-white/5 bg-black px-3 pr-8 text-white outline-none"
                >
                  {DURATION_OPTIONS.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} mins
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-body-sm font-bold text-white">Pricing Option</label>
              <div className="overflow-hidden rounded-md border border-white/5 bg-black">
                {(['paid', 'free'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setConsultationPricingType(option)}
                    className="text-body-sm flex h-8 w-full items-center justify-between px-3 font-bold text-white capitalize"
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
              <label className="text-body-sm font-bold text-white">Consultation Fees</label>
              <input
                type="text"
                placeholder="₹0.00"
                value={consultationPrice}
                onChange={(e) => setConsultationPrice(e.target.value)}
                disabled={consultationPricingType === 'free'}
                className={cn(
                  consultationInputClass,
                  consultationPricingType === 'free' && 'opacity-50',
                )}
              />
            </div>
          </div>
        </div>
      )
    }

    const reviewLanguages = languages
      .split(',')
      .map((lang) => lang.trim())
      .filter(Boolean)

    const reviewPriceLabel =
      consultationPricingType === 'free'
        ? 'Free'
        : consultationPrice.trim()
          ? consultationPrice.trim().startsWith('₹')
            ? consultationPrice.trim()
            : `₹${consultationPrice.trim()}`
          : '—'

    return (
      <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface mx-auto w-full max-w-[1140px] rounded-lg border border-white/5 p-7 duration-300">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-[1fr_0.9fr]">
          <div className="border-brand-accent border-l-4 pl-4">
            <h2 className="text-h3 font-bold text-white">
              {consultationTitle.trim() || 'Untitled Consultation'}
            </h2>
            {topics.length > 0 && (
              <p className="text-body-sm text-muted mt-1">
                {topics.map((topic) => topic.name).join(', ')}
              </p>
            )}

            <div className="mt-6 space-y-5">
              <div>
                <h3 className="text-body-sm mb-2 font-bold text-white">Session outline</h3>
                <p className="text-body-sm text-muted leading-relaxed whitespace-pre-line">
                  {sessionOutline.trim() || '—'}
                </p>
              </div>
              {hasPreSessionRequirement && preSessionRequirement.trim() && (
                <div>
                  <h3 className="text-body-sm mb-2 font-bold text-white">
                    Pre-Session Requirement
                  </h3>
                  <p className="text-body-sm text-muted whitespace-pre-line">
                    {preSessionRequirement.trim()}
                  </p>
                </div>
              )}
              {hasPostSessionMessage && postSessionMessage.trim() && (
                <div>
                  <h3 className="text-body-sm mb-2 font-bold text-white">
                    Post-Session Requirement
                  </h3>
                  <p className="text-body-sm text-muted whitespace-pre-line">
                    {postSessionMessage.trim()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-body-sm mb-2 font-bold text-white">Who is it for?</h3>
                <p className="text-body-sm text-muted whitespace-pre-line">
                  {whoItsFor.trim() || '—'}
                </p>
              </div>

              <div>
                <h3 className="text-body-sm mb-3 font-bold text-white">Additional Information</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex h-10 min-w-12 items-center justify-center gap-2 rounded-md bg-black px-3">
                      <Phone className="size-4 text-white" />
                      <span className="text-body-sm font-bold text-white capitalize">
                        {consultationMode}
                      </span>
                    </div>
                    <span className="text-body-sm text-muted text-center">Mode</span>
                  </div>

                  {reviewLanguages.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="flex h-10 min-w-12 items-center justify-center gap-2 rounded-md bg-black px-3">
                        <MessageCircle className="size-4 text-white" />
                        <span className="text-body-sm font-bold text-white">
                          {reviewLanguages.join(', ')}
                        </span>
                      </div>
                      <span className="text-body-sm text-muted text-center">Languages</span>
                    </div>
                  )}

                  {hasFollowUp && (
                    <div className="flex flex-col gap-2">
                      <div className="flex h-10 min-w-12 items-center justify-center gap-2 rounded-md bg-black px-3">
                        <Languages className="size-4 text-white" />
                        <span className="text-body-sm font-bold text-white">
                          {followUpDays} days
                        </span>
                      </div>
                      <span className="text-body-sm text-muted text-center">Follow Ups</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-body-sm mb-3 font-bold text-white">Duration &amp; Pricing</h3>
                <span className="text-body-sm inline-flex rounded-md border border-white/40 px-4 py-2 font-bold text-white">
                  {consultationDuration}mins ({reviewPriceLabel})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const breadcrumbs = useMemo(
    () => [
      { label: 'Expert management' },
      { label: 'Manage Experts' },
      { label: expertName },
      { label: isEditMode ? 'Edit Consultation' : 'Create Listing', isActive: true },
    ],
    [expertName, isEditMode],
  )

  const primaryActionLabel =
    currentStep === 1 ? (
      'Next'
    ) : currentStep === 5 ? (
      selectedType === 'consultation' ? (
        isEditMode ? (
          'Save Changes'
        ) : (
          'Publish Consultation'
        )
      ) : (
        <span className="flex items-center gap-2">
          Publish service
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      )
    ) : (
      'Save & Continue'
    )

  const primaryActionClassName = currentStep === 5 ? 'ui-cta-positive' : 'ui-cta-primary'

  return (
    <CreateListingWizard
      title={isEditMode ? 'Edit Consultation' : 'Create Service Listing'}
      breadcrumbs={breadcrumbs}
      steps={activeSteps}
      currentStep={currentStep}
      onBack={handleBack}
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
        disabled:
          (currentStep === 1 && !selectedType) ||
          isSubmitting ||
          (isEditMode && isConsultationEditLoading),
        className: primaryActionClassName,
      }}
    >
      {currentStep === 1 ? (
        <div className="bg-brand-surface mx-auto w-full max-w-[1140px] rounded-lg border border-white/5 p-6 shadow-xl">
          <div className="mb-8">
            <h2 className="mb-2 text-[15px] font-bold text-white">Choose Service Type</h2>
            <p className="text-body-sm text-muted leading-relaxed font-medium">
              Select what kind of offering you're listing. This decision controls the rest of the
              form.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <button
              onClick={() => setSelectedType('service')}
              className={cn(
                'group relative flex flex-col items-center gap-4 overflow-hidden rounded-lg border p-7 text-center transition-all duration-300',
                selectedType === 'service'
                  ? 'bg-brand-accent border-brand-accent text-brand-text-dark shadow-lg'
                  : 'text-muted border-white/5 bg-black hover:border-white/10',
              )}
            >
              <div
                className={cn(
                  'flex size-11 items-center justify-center rounded-full shadow-sm transition-all duration-300',
                  selectedType === 'service'
                    ? 'bg-black text-white'
                    : 'bg-brand-surface text-white',
                )}
              >
                <Briefcase className="size-5" />
              </div>
              <div className="space-y-2">
                <h3
                  className={cn(
                    'text-[13px] font-bold tracking-tight',
                    selectedType === 'service' ? 'text-black' : 'text-white',
                  )}
                >
                  Service
                </h3>
                <p
                  className={cn(
                    'text-body-sm max-w-[260px] leading-relaxed font-semibold',
                    selectedType === 'service' ? 'text-black/80' : 'text-muted',
                  )}
                >
                  Best for clearly defined offerings with deliverables, pricing, and timelines
                </p>
              </div>
            </button>

            <button
              onClick={() => setSelectedType('consultation')}
              className={cn(
                'group relative flex flex-col items-center gap-4 overflow-hidden rounded-lg border p-7 text-center transition-all duration-300',
                selectedType === 'consultation'
                  ? 'border-white bg-white text-black shadow-lg'
                  : 'text-muted border-white/5 bg-black hover:border-white/10',
              )}
            >
              <div
                className={cn(
                  'flex size-11 items-center justify-center rounded-full shadow-sm transition-all duration-300',
                  selectedType === 'consultation'
                    ? 'bg-black text-white'
                    : 'bg-brand-surface text-white',
                )}
              >
                <MessageCircle className="size-5" />
              </div>
              <div className="space-y-2">
                <h3
                  className={cn(
                    'text-[13px] font-bold tracking-tight',
                    selectedType === 'consultation' ? 'text-black' : 'text-white',
                  )}
                >
                  Consultation
                </h3>
                <p
                  className={cn(
                    'text-body-sm max-w-[260px] leading-relaxed font-medium',
                    selectedType === 'consultation' ? 'text-black' : 'text-muted',
                  )}
                >
                  Best for time-based or advisory sessions without fixed deliverables
                </p>
              </div>
            </button>
          </div>
        </div>
      ) : selectedType === 'consultation' ? (
        renderConsultationStep()
      ) : currentStep === 2 ? (
        <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface mx-auto w-full max-w-[1140px] rounded-lg border border-white/5 p-6 duration-300">
          <div className="mb-8">
            <h2 className="mb-1 text-[15px] font-bold text-white">About Service</h2>
            <p className="text-body-sm text-muted font-medium">
              Provide details about your service offering
            </p>
          </div>

          <div className="space-y-6">
            {!partnerId && (
              <p className="text-body-sm rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-300">
                Add <code className="text-amber-200">?partnerId=&lt;id&gt;</code> to the URL before
                creating a listing.
              </p>
            )}

            <div className="space-y-2.5">
              <label className="text-body-sm font-bold tracking-tight text-white">
                Service title <RequiredMark />
              </label>
              <input
                type="text"
                placeholder="e.g NDA Review & Legal Advisory"
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                className="focus:border-brand-accent/50 text-body-sm placeholder:text-muted h-10 w-full rounded-lg border border-white/5 bg-black px-3 text-white transition-colors outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2.5">
                <label className="text-body-sm font-bold tracking-tight text-white">
                  Service Category <RequiredMark />
                </label>
                <div className="group relative">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value)
                      setSelectedSubCategoryIds([])
                    }}
                    disabled={isCategoriesLoading}
                    className="focus:border-brand-accent/50 text-body-sm h-10 w-full cursor-pointer appearance-none rounded-lg border border-white/5 bg-black px-3 pr-10 text-white transition-colors outline-none disabled:opacity-50"
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
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-body-sm font-bold tracking-tight text-white">
                  Service sub-category
                </label>
                <div className="min-h-10 rounded-lg border border-white/5 bg-black px-3 py-2">
                  {!selectedCategoryId ? (
                    <p className="text-body-sm text-muted">Select a category first</p>
                  ) : isSubcategoriesLoading ? (
                    <p className="text-body-sm text-muted">Loading subcategories...</p>
                  ) : subcategories.length === 0 ? (
                    <p className="text-body-sm text-muted">No subcategories available</p>
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
                              ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                              : 'text-muted border-white/10 hover:border-white/30',
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
              <label className="text-body-sm font-bold tracking-tight text-white">
                Description
              </label>
              <textarea
                placeholder="Describe your service offering..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="focus:border-brand-accent/50 text-body-sm placeholder:text-muted min-h-[72px] w-full resize-none rounded-lg border border-white/5 bg-black p-3 leading-relaxed text-white transition-colors outline-none"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-body-sm font-bold tracking-tight text-white">
                Describe Deliverables
              </label>
              <textarea
                placeholder="Describe what you will deliver to your client. Be specific about outputs, formats, and any revisions included..."
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                className="focus:border-brand-accent/50 text-body-sm placeholder:text-muted min-h-[88px] w-full resize-none rounded-lg border border-white/5 bg-black p-3 leading-relaxed text-white transition-colors outline-none"
              />
            </div>
          </div>
        </div>
      ) : currentStep === 3 ? (
        <div className="animate-in fade-in slide-in-from-right-4 mx-auto w-full max-w-[1140px] space-y-5 duration-300">
          <div className="bg-brand-surface space-y-5 rounded-lg border border-white/5 p-5">
            <div>
              <h2 className="mb-1 text-[13px] font-bold text-white">Pricing Options</h2>
              <p className="text-body-sm text-muted font-medium">
                Select one pricing model. Each model has its own fields.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {allowSinglePriceListing && (
                <button
                  onClick={() => setPricingType('fixed')}
                  className={cn(
                    'flex items-start gap-3 rounded-md border p-4 text-left transition-all duration-300',
                    pricingType === 'fixed'
                      ? 'border-white/70 bg-black shadow-[0_0_15px_rgba(251,192,120,0.05)]'
                      : 'border-white/40 bg-black hover:border-white/70',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border',
                      pricingType === 'fixed' ? 'border-white' : 'border-white/70',
                    )}
                  >
                    {pricingType === 'fixed' && <div className="size-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h3 className="text-body-sm mb-1 font-bold text-white">Fixed Pricing</h3>
                    <p className="text-muted text-[10px] leading-snug">
                      Best for clearly defined scope, deliverables, and deadlines
                    </p>
                  </div>
                </button>
              )}

              {allowCustomPriceListing && (
                <button
                  onClick={() => setPricingType('custom')}
                  className={cn(
                    'flex items-start gap-3 rounded-md border p-4 text-left transition-all duration-300',
                    pricingType === 'custom'
                      ? 'border-white/70 bg-black shadow-[0_0_15px_rgba(251,192,120,0.05)]'
                      : 'border-white/40 bg-black hover:border-white/70',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border',
                      pricingType === 'custom' ? 'border-white' : 'border-white/70',
                    )}
                  >
                    {pricingType === 'custom' && <div className="size-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h3 className="text-body-sm mb-1 font-bold text-white">Custom Pricing</h3>
                    <p className="text-muted text-[10px] leading-snug">
                      Best for flexible scope, evolving requirements, variable timelines
                    </p>
                  </div>
                </button>
              )}

              {allowTierPriceListing && (
                <button
                  onClick={() => setPricingType('tiered')}
                  className={cn(
                    'flex items-start gap-3 rounded-md border p-4 text-left transition-all duration-300 md:col-span-1',
                    pricingType === 'tiered'
                      ? 'border-white/70 bg-black shadow-[0_0_15px_rgba(251,192,120,0.05)]'
                      : 'border-white/40 bg-black hover:border-white/70',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border',
                      pricingType === 'tiered' ? 'border-white' : 'border-white/70',
                    )}
                  >
                    {pricingType === 'tiered' && <div className="size-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h3 className="text-body-sm mb-1 font-bold text-white">Tiered Pricing</h3>
                    <p className="text-muted text-[10px] leading-snug">
                      Best for multiple service levels with increasing value
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div>
            {pricingType === 'fixed' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 bg-brand-surface space-y-5 rounded-lg border border-white/5 p-5 duration-500">
                <h2 className="text-[13px] font-bold text-white">Fixed Pricing Details</h2>

                <div className="flex flex-col items-start gap-5 md:flex-row">
                  <div className="w-full flex-1 space-y-5">
                    <div className="space-y-2.5">
                      <label className="text-body-sm font-bold tracking-tight text-white">
                        Price <RequiredMark />
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Price"
                        value={fixedPrice}
                        onChange={(e) => setFixedPrice(e.target.value)}
                        className="focus:border-brand-accent/50 text-body-sm placeholder:text-muted h-9 w-full rounded-lg border border-white/5 bg-black px-3 text-white transition-colors outline-none"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-body-sm font-bold tracking-tight text-white">
                        Set Timelines <RequiredMark />
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={fixedTimeline}
                          onChange={(e) => setFixedTimeline(e.target.value)}
                          className="focus:border-brand-accent/50 text-body-sm h-9 w-full rounded-lg border border-white/5 bg-black px-3 text-white transition-colors outline-none"
                        />
                        <div className="group relative w-20 shrink-0">
                          <select
                            value={fixedTimelineUnit}
                            onChange={(e) => setFixedTimelineUnit(e.target.value)}
                            className="focus:border-brand-accent/50 text-body-sm h-9 w-full cursor-pointer appearance-none rounded-lg border border-white/5 bg-black px-3 pr-8 text-white transition-colors outline-none"
                          >
                            <option>Days</option>
                            <option>Weeks</option>
                            <option>Months</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-body-sm font-bold tracking-tight text-white">
                          Discount (%)
                        </label>
                        <Info className="text-muted size-3 cursor-help" />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {['00%', '10%', '15%', '20%', '30%', '40%', '50%']
                          .filter((discount) => {
                            const pct = Number.parseInt(discount, 10) || 0
                            return pct <= (maxListingDiscountPercent || 50)
                          })
                          .map((discount) => (
                            <button
                              key={discount}
                              onClick={() => setSelectedDiscount(discount)}
                              className={cn(
                                'text-body-sm rounded-md px-4 py-2 font-bold transition-all duration-200',
                                selectedDiscount === discount
                                  ? 'bg-white text-black shadow-lg'
                                  : 'bg-brand-surface text-muted border border-white/5 hover:border-white/10',
                              )}
                            >
                              {discount}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>

                  {displayAiPriceRecommendation && (
                    <div className="w-full md:w-[280px]">
                      <div className="border-brand-positive/15 bg-brand-positive/20 flex flex-col gap-2 rounded-lg border p-4">
                        <div className="flex items-start gap-2.5">
                          <div className="bg-brand-positive/40 flex size-6 shrink-0 items-center justify-center rounded-full">
                            {isRecommendationLoading ? (
                              <Loader2 className="size-3.5 animate-spin text-emerald-200" />
                            ) : (
                              <Sparkles className="size-3.5 text-emerald-200" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] leading-relaxed font-semibold text-white">
                              {pricingRecommendation?.short_badge_text ||
                                (isRecommendationLoading
                                  ? 'Fetching market rate recommendation…'
                                  : 'AI price recommendation will appear here.')}
                            </p>
                            {pricingRecommendation?.recommendation && (
                              <p className="mt-2 border-t border-emerald-500/20 pt-2 text-[10px] leading-normal font-normal text-emerald-200/90">
                                {pricingRecommendation.recommendation}
                              </p>
                            )}
                          </div>
                        </div>
                        {pricingRecommendation?.breakdown && (
                          <div className="mt-2 space-y-1 border-t border-emerald-500/20 pt-2 text-[10px] text-emerald-100/70">
                            <div className="flex justify-between">
                              <span>
                                Platform Fee ({pricingRecommendation.breakdown.platform_fee_pct}%):
                              </span>
                              <span>
                                ₹
                                {pricingRecommendation.breakdown.platform_fee.toLocaleString(
                                  'en-IN',
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>GST ({pricingRecommendation.breakdown.gst_pct}%):</span>
                              <span>
                                ₹{pricingRecommendation.breakdown.gst.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between pt-1 font-bold text-white">
                              <span>Estimated Earnings:</span>
                              <span>
                                ₹
                                {pricingRecommendation.breakdown.estimated_earnings.toLocaleString(
                                  'en-IN',
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {pricingType === 'custom' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 bg-brand-surface space-y-5 rounded-lg border border-white/5 p-5 duration-500">
                <h2 className="text-[13px] font-bold text-white">Custom Pricing Details</h2>

                <div className="flex flex-col items-start gap-5 md:flex-row">
                  <div className="w-full flex-1 space-y-5">
                    <div className="space-y-2.5">
                      <label className="text-body-sm font-bold tracking-tight text-white">
                        Set Price <RequiredMark />
                      </label>
                      <input
                        type="text"
                        placeholder="Enter price"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="focus:border-brand-accent/50 text-body-sm placeholder:text-muted h-9 w-full rounded-lg border border-white/5 bg-black px-3 text-white transition-colors outline-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-body-sm font-bold tracking-tight text-white">
                        Times lines <RequiredMark />
                      </label>
                      <div className="flex gap-5">
                        <button
                          onClick={() => setTimelineType('long')}
                          className="group flex items-center gap-2"
                        >
                          <div
                            className={cn(
                              'flex size-3.5 items-center justify-center rounded-full border transition-all',
                              timelineType === 'long' ? 'border-white' : 'border-white/70',
                            )}
                          >
                            {timelineType === 'long' && (
                              <div className="size-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span
                            className={cn(
                              'text-body-sm font-medium transition-colors',
                              timelineType === 'long' ? 'text-white' : 'text-muted',
                            )}
                          >
                            Long term
                          </span>
                        </button>
                        <button
                          onClick={() => setTimelineType('short')}
                          className="group flex items-center gap-2"
                        >
                          <div
                            className={cn(
                              'flex size-3.5 items-center justify-center rounded-full border transition-all',
                              timelineType === 'short' ? 'border-white' : 'border-white/70',
                            )}
                          >
                            {timelineType === 'short' && (
                              <div className="size-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span
                            className={cn(
                              'text-body-sm font-medium transition-colors',
                              timelineType === 'short' ? 'text-white' : 'text-muted',
                            )}
                          >
                            Short term
                          </span>
                        </button>
                      </div>
                      <p className="text-muted text-[10px]">
                        Best for services with flexible scope, evolving requirements, and variable
                        timelines.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-body-sm font-bold tracking-tight text-white">
                        Set Timelines <RequiredMark />
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={customTimelineMin}
                          onChange={(e) => setCustomTimelineMin(e.target.value)}
                          className="focus:border-brand-accent/50 text-body-sm h-9 w-24 rounded-lg border border-white/5 bg-black px-3 text-center text-white transition-colors outline-none"
                        />
                        <span className="text-body-sm text-muted font-medium">To</span>
                        <input
                          type="text"
                          value={customTimelineMax}
                          onChange={(e) => setCustomTimelineMax(e.target.value)}
                          className="focus:border-brand-accent/50 text-body-sm h-9 w-24 rounded-lg border border-white/5 bg-black px-3 text-center text-white transition-colors outline-none"
                        />
                        <div className="group relative w-20 shrink-0">
                          <select
                            value={customTimelineUnit}
                            onChange={(e) => setCustomTimelineUnit(e.target.value)}
                            className="focus:border-brand-accent/50 text-body-sm h-9 w-full cursor-pointer appearance-none rounded-lg border border-white/5 bg-black px-3 pr-8 text-white transition-colors outline-none"
                          >
                            <option value="Days">Days</option>
                            <option value="Weeks">Weeks</option>
                            <option value="Months">Months</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {displayAiPriceRecommendation && (
                    <div className="w-full md:w-[280px]">
                      <div className="border-brand-positive/15 bg-brand-positive/20 flex flex-col gap-2 rounded-lg border p-4">
                        <div className="flex items-start gap-2.5">
                          <div className="bg-brand-positive/40 flex size-6 shrink-0 items-center justify-center rounded-full">
                            {isRecommendationLoading ? (
                              <Loader2 className="size-3.5 animate-spin text-emerald-200" />
                            ) : (
                              <Sparkles className="size-3.5 text-emerald-200" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] leading-relaxed font-semibold text-white">
                              {pricingRecommendation?.short_badge_text ||
                                (isRecommendationLoading
                                  ? 'Fetching market rate recommendation…'
                                  : 'AI price recommendation will appear here.')}
                            </p>
                            {pricingRecommendation?.recommendation && (
                              <p className="mt-2 border-t border-emerald-500/20 pt-2 text-[10px] leading-normal font-normal text-emerald-200/90">
                                {pricingRecommendation.recommendation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {pricingType === 'tiered' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 bg-brand-surface space-y-5 rounded-lg border border-white/5 p-5 duration-500">
                <div>
                  <h2 className="text-[13px] font-bold text-white">Tiered Pricing Details</h2>
                  <p className="text-body-sm text-muted mt-1 font-medium">
                    Fill the tiers you want to offer. Leave a tier&apos;s price empty to skip it.
                  </p>
                </div>

                <div className="space-y-4">
                  {tiers.map((tier) => (
                    <div
                      key={tier.name}
                      className="space-y-4 rounded-lg border border-white/5 bg-black p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-body-sm font-bold text-white capitalize">
                          {tier.name}
                        </h3>
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-body-sm font-bold tracking-tight text-white">
                          Description <RequiredMark />
                        </label>
                        <textarea
                          placeholder={`Describe what the ${tier.name} tier includes...`}
                          value={tier.description}
                          onChange={(e) => updateTier(tier.name, 'description', e.target.value)}
                          className="focus:border-brand-accent/50 bg-brand-surface text-body-sm placeholder:text-muted min-h-[64px] w-full resize-none rounded-lg border border-white/5 p-3 leading-relaxed text-white transition-colors outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2.5">
                          <label className="text-body-sm font-bold tracking-tight text-white">
                            Price <RequiredMark />
                          </label>
                          <input
                            type="text"
                            placeholder="₹0.00"
                            value={tier.price}
                            onChange={(e) => updateTier(tier.name, 'price', e.target.value)}
                            className="focus:border-brand-accent/50 bg-brand-surface text-body-sm placeholder:text-muted h-9 w-full rounded-lg border border-white/5 px-3 text-white transition-colors outline-none"
                          />
                        </div>

                        <div className="space-y-2.5">
                          <label className="text-body-sm font-bold tracking-tight text-white">
                            Set Timelines <RequiredMark />
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              placeholder="0"
                              value={tier.timelineValue}
                              onChange={(e) =>
                                updateTier(tier.name, 'timelineValue', e.target.value)
                              }
                              className="focus:border-brand-accent/50 bg-brand-surface text-body-sm h-9 w-full rounded-lg border border-white/5 px-3 text-center text-white transition-colors outline-none"
                            />
                            <div className="group relative w-20 shrink-0">
                              <select
                                value={tier.timelineUnit}
                                onChange={(e) =>
                                  updateTier(tier.name, 'timelineUnit', e.target.value)
                                }
                                className="focus:border-brand-accent/50 bg-brand-surface text-body-sm h-9 w-full cursor-pointer appearance-none rounded-lg border border-white/5 px-3 pr-8 text-white transition-colors outline-none"
                              >
                                <option>Days</option>
                                <option>Weeks</option>
                                <option>Months</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : currentStep === 4 ? (
        <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface mx-auto w-full max-w-[1140px] space-y-5 rounded-lg border border-white/5 p-5 duration-300">
          <div>
            <h2 className="mb-1 text-[13px] font-bold text-white">Gallery</h2>
            <p className="text-body-sm text-muted font-medium">
              Upload visual assets to support your service (optional)
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-body-sm font-bold text-white">
              Maximum {MAX_IMAGES} images. Allowed formats: JPG, PNG, WebP
            </p>

            <div
              onClick={() => uploadedImages.length < MAX_IMAGES && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed py-8 transition-all duration-300 select-none',
                isDragging
                  ? 'border-brand-accent/60 bg-brand-accent/5'
                  : uploadedImages.length >= MAX_IMAGES
                    ? 'cursor-not-allowed border-white/5 bg-black/30 opacity-50'
                    : 'hover:border-brand-accent/40 hover:bg-brand-accent/5 border-white/40 bg-black',
              )}
            >
              <div className="bg-brand-surface flex size-9 items-center justify-center rounded-full">
                <Upload className="size-4 text-white" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-semibold text-white">
                  {uploadedImages.length >= MAX_IMAGES
                    ? 'Maximum images reached'
                    : 'Click to upload Images'}
                </p>
                {uploadedImages.length < MAX_IMAGES && (
                  <p className="text-muted mt-1 text-[10px]">Or drag &amp; drop</p>
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
                <p className="text-body-sm font-semibold text-white">
                  Uploaded Images ({uploadedImages.length}/{MAX_IMAGES})
                </p>
                <div className="flex flex-wrap gap-3">
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="group relative">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="h-[90px] w-[90px] rounded-md border border-white/5 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(img.id)}
                        className="bg-brand-danger hover:bg-brand-danger absolute top-1.5 left-1.5 rounded-full px-2 py-0.5 text-[8px] font-bold text-white shadow-lg transition-colors"
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
        <div className="animate-in fade-in slide-in-from-right-4 bg-brand-surface mx-auto w-full max-w-[1140px] space-y-5 rounded-lg border border-white/5 p-6 duration-300">
          <div>
            <h2 className="mb-1 text-[13px] font-bold text-white">Review &amp; Publish</h2>
            <p className="text-body-sm text-muted font-medium">
              Review your service listing details before publishing
            </p>
          </div>

          <div className="flex flex-col items-start gap-7 md:flex-row">
            <div className="flex w-full shrink-0 flex-col gap-5 md:w-[360px]">
              <div className="relative h-[210px] w-full overflow-hidden rounded-lg border border-white/5">
                <img
                  src={
                    uploadedImages.length > 0
                      ? uploadedImages[0].url
                      : 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1000'
                  }
                  alt="cover"
                  className="h-full w-full object-cover"
                />
                <div className="text-body-sm absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md border border-white/10 bg-black/70 px-2.5 py-1 font-bold text-white shadow-md backdrop-blur-sm">
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>1/{uploadedImages.length || 12}</span>
                </div>
              </div>

              {pricingType === 'tiered' &&
                (() => {
                  const filledTiers = tiers.filter((tier) => tier.price.trim() !== '')
                  if (filledTiers.length === 0) {
                    return (
                      <div className="text-body-sm text-muted rounded-lg border border-white/5 bg-black p-4">
                        No tiers added yet.
                      </div>
                    )
                  }
                  const current =
                    filledTiers.find((tier) => tier.name === selectedTier) || filledTiers[0]
                  const priceLabel = current.price.trim().startsWith('₹')
                    ? current.price.trim()
                    : `₹${current.price.trim()}`
                  return (
                    <div className="space-y-4">
                      <div className="flex w-full justify-between rounded-full border border-white/5 bg-black p-1">
                        {filledTiers.map((tier) => (
                          <button
                            key={tier.name}
                            onClick={() => setSelectedTier(tier.name)}
                            className={cn(
                              'text-body-sm flex-1 rounded-full px-5 py-2 text-center font-bold capitalize transition-all duration-300',
                              current.name === tier.name
                                ? 'bg-white font-bold text-black shadow-lg'
                                : 'text-muted hover:text-brand-text bg-transparent',
                            )}
                          >
                            {tier.name}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <p className="text-body-sm font-medium whitespace-pre-line text-white">
                          {current.description.trim() || 'No description provided.'}
                        </p>
                      </div>

                      <div className="flex gap-4 pt-1">
                        <div className="flex flex-col gap-1.5">
                          <div className="bg-brand-surface flex min-w-[92px] items-center justify-center rounded-md border border-white/15 px-4 py-2">
                            <span className="text-body-sm font-bold text-white">{priceLabel}</span>
                          </div>
                          <span className="text-body-sm text-muted text-center font-medium">
                            Pricing
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="bg-brand-surface flex min-w-[92px] items-center justify-center rounded-md border border-white/15 px-4 py-2">
                            <span className="text-body-sm font-bold text-white">
                              {current.timelineValue || '0'} {current.timelineUnit}
                            </span>
                          </div>
                          <span className="text-body-sm text-muted text-center font-medium">
                            Timelines
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
            </div>

            <div className="flex flex-1 flex-col justify-between self-stretch">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-1 text-[21px] font-bold tracking-tight text-white">
                    {serviceTitle.trim() || 'Untitled Service'}
                  </h3>
                  <span className="text-body-sm text-muted font-medium">
                    {categories.find((category) => category._id === selectedCategoryId)?.name ||
                      'Uncategorized'}
                  </span>
                </div>

                <p className="text-[13px] leading-relaxed font-medium whitespace-pre-line text-white">
                  {description.trim() || 'No description provided.'}
                </p>

                {deliverables.trim() && (
                  <div>
                    <h4 className="text-body-sm mb-1 font-bold text-white">Deliverables</h4>
                    <p className="text-body-sm text-muted leading-relaxed whitespace-pre-line">
                      {deliverables.trim()}
                    </p>
                  </div>
                )}

                {selectedSubCategoryIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {subcategories
                      .filter((subCategory) => selectedSubCategoryIds.includes(subCategory._id))
                      .map((subCategory) => (
                        <span
                          key={subCategory._id}
                          className="bg-brand-surface text-body-sm rounded-md border border-white/20 px-3 py-1.5 font-bold text-white"
                        >
                          {subCategory.name}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {pricingType === 'fixed' && (
                <div className="mt-auto flex flex-wrap gap-4 pt-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="bg-brand-surface flex min-w-[92px] items-center justify-center rounded-md border border-white/15 px-4 py-2">
                      <span className="text-body-sm font-bold text-white">{fixedPrice}</span>
                    </div>
                    <span className="text-body-sm text-muted text-center font-medium">Pricing</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="bg-brand-surface flex min-w-[92px] items-center justify-center rounded-md border border-white/15 px-4 py-2">
                      <span className="text-body-sm font-bold text-white">
                        {selectedDiscount} Off
                      </span>
                    </div>
                    <span className="text-body-sm text-muted text-center font-medium">
                      Discounts
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="bg-brand-surface flex min-w-[92px] items-center justify-center rounded-md border border-white/15 px-4 py-2">
                      <span className="text-body-sm font-bold text-white">
                        {fixedTimeline} {fixedTimelineUnit}
                      </span>
                    </div>
                    <span className="text-body-sm text-muted text-center font-medium">
                      Timelines
                    </span>
                  </div>
                </div>
              )}

              {pricingType === 'custom' && (
                <div className="mt-auto flex flex-wrap gap-4 pt-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="bg-brand-surface flex min-w-[92px] items-center justify-center rounded-md border border-white/15 px-4 py-2">
                      <span className="text-body-sm font-bold text-white">{customPrice}</span>
                    </div>
                    <span className="text-body-sm text-muted text-center font-medium">
                      Starting From
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="bg-brand-surface flex min-w-[92px] items-center justify-center rounded-md border border-white/15 px-4 py-2">
                      <span className="text-body-sm font-bold text-white">
                        {timelineType === 'long' ? 'Long term' : 'Short term'} ({customTimelineMin}-
                        {customTimelineMax} {customTimelineUnit})
                      </span>
                    </div>
                    <span className="text-body-sm text-muted text-center font-medium">
                      Timelines
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-muted flex h-full items-center justify-center italic">
          Step {currentStep} coming soon...
        </div>
      )}
    </CreateListingWizard>
  )
}
