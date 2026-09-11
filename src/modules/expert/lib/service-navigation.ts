type ServiceViewTarget = {
  _id: string
  serviceType?: string
  partnerId?: string
  status?: string
}

export const isPendingListingReview = (status?: string, isConsultation = false) => {
  const normalized = (status || '').toLowerCase()
  if (isConsultation) return normalized === 'submitted'
  return normalized === 'in_review' || normalized === 'pending' || normalized === 'submitted'
}

export const isApprovedListingStatus = (status?: string) => {
  const normalized = (status || '').toLowerCase()
  return normalized === 'live' || normalized === 'approved'
}

export const getServiceManagementViewPath = (service: ServiceViewTarget) => {
  const params = new URLSearchParams()
  params.set('type', service.serviceType || 'Service')

  if (service.partnerId) {
    params.set('partnerId', service.partnerId)
  }

  return `/services/management/view/${service._id}?${params.toString()}`
}

const expertServiceBase = (expertId: string, serviceId: string) =>
  `/experts/management/profile/${expertId}/service/${serviceId}`

export const getExpertServiceDrilldownPath = (service: ServiceViewTarget, expertId: string) => {
  const isConsultation = (service.serviceType || '').toLowerCase().includes('consultation')

  if (isConsultation && expertId) {
    return consultationPerformancePath(expertId, service._id)
  }

  if (isConsultation || !expertId) {
    return getServiceManagementViewPath({ ...service, partnerId: service.partnerId || expertId })
  }

  return expertServiceBase(expertId, service._id)
}

export const serviceDetailPath = (expertId: string, serviceId: string) =>
  expertServiceBase(expertId, serviceId)

export const servicePerformancePath = (expertId: string, serviceId: string) =>
  `${expertServiceBase(expertId, serviceId)}/performance`

export const serviceOrderDetailPath = (
  expertId: string,
  serviceId: string,
  orderId: string,
  orderType: 'order' | 'proposal' = 'order',
) => `${expertServiceBase(expertId, serviceId)}/orders/${orderId}?type=${orderType}`

export const serviceOrderFilesPath = (
  expertId: string,
  serviceId: string,
  orderId: string,
  orderType: 'order' | 'proposal' = 'order',
) => `${expertServiceBase(expertId, serviceId)}/orders/${orderId}/files?type=${orderType}`

export const serviceOrderMessagesPath = (
  expertId: string,
  serviceId: string,
  orderId: string,
  orderType: 'order' | 'proposal' = 'order',
) => `${expertServiceBase(expertId, serviceId)}/orders/${orderId}/messages?type=${orderType}`

export const serviceOrderQuotationPath = (
  expertId: string,
  serviceId: string,
  orderId: string,
  quotationId: string,
) =>
  `${expertServiceBase(expertId, serviceId)}/orders/${orderId}/quotation?quotationId=${quotationId}`

export const serviceOrderProposalPath = (
  expertId: string,
  serviceId: string,
  orderId: string,
  proposalId: string,
) => `${expertServiceBase(expertId, serviceId)}/orders/${orderId}/proposal?proposalId=${proposalId}`

const expertConsultationBase = (expertId: string, consultationId: string) =>
  `/experts/management/profile/${expertId}/consultation/${consultationId}`

export const consultationDetailPath = (expertId: string, consultationId: string) =>
  expertConsultationBase(expertId, consultationId)

export const consultationPerformancePath = (expertId: string, consultationId: string) =>
  `${expertConsultationBase(expertId, consultationId)}/performance`

export const consultationBookingPath = (
  expertId: string,
  consultationId: string,
  bookingId: string,
) => `${expertConsultationBase(expertId, consultationId)}/bookings/${bookingId}`

export const consultationBookingFilesPath = (
  expertId: string,
  consultationId: string,
  bookingId: string,
) => `${expertConsultationBase(expertId, consultationId)}/bookings/${bookingId}/files`

export const consultationBookingMessagesPath = (
  expertId: string,
  consultationId: string,
  bookingId: string,
) => `${expertConsultationBase(expertId, consultationId)}/bookings/${bookingId}/messages`
