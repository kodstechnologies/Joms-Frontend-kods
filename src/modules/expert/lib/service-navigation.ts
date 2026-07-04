type ServiceViewTarget = {
  _id: string
  serviceType?: string
  partnerId?: string
}

export const getServiceManagementViewPath = (service: ServiceViewTarget) => {
  const params = new URLSearchParams()
  params.set('type', service.serviceType || 'Service')

  if (service.partnerId) {
    params.set('partnerId', service.partnerId)
  }

  return `/services/management/view/${service._id}?${params.toString()}`
}
