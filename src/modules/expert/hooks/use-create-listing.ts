import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createConsultation,
  createService,
  fetchConsultationTopics,
  publishConsultation,
  publishService,
  updateConsultationAdditionalInfo,
  updateConsultationBasic,
  updateConsultationPricing,
  updateServiceGallery,
  updateServicePricing,
} from '../api/service-api'
import type {
  CreateConsultationPayload,
  CreateServicePayload,
  UpdateConsultationAdditionalInfoPayload,
  UpdateConsultationPricingPayload,
  UpdateServicePricingPayload,
} from '../type/service'

export const useCreateService = () =>
  useMutation({
    mutationFn: (payload: CreateServicePayload) => createService(payload),
  })

export const useUpdateServicePricing = () =>
  useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateServicePricingPayload }) =>
      updateServicePricing(id, payload),
  })

export const useUpdateServiceGallery = () =>
  useMutation({
    mutationFn: ({
      id,
      images,
      existingImageUrls,
    }: {
      id: string
      images: File[]
      existingImageUrls?: string[]
    }) => updateServiceGallery(id, images, existingImageUrls),
  })

export const usePublishService = () =>
  useMutation({
    mutationFn: (id: string) => publishService(id),
  })

export const useConsultationTopics = (params?: {
  search?: string
  page?: number
  limit?: number
}) =>
  useQuery({
    queryKey: ['consultation-topics', params],
    queryFn: () => fetchConsultationTopics(params),
  })

export const useCreateConsultation = () =>
  useMutation({
    mutationFn: (payload: CreateConsultationPayload) => createConsultation(payload),
  })

export const useUpdateConsultationBasic = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Omit<CreateConsultationPayload, 'partnerId'>
    }) => updateConsultationBasic(id, payload),
  })

export const useUpdateConsultationAdditionalInfo = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateConsultationAdditionalInfoPayload
    }) => updateConsultationAdditionalInfo(id, payload),
  })

export const useUpdateConsultationPricing = () =>
  useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateConsultationPricingPayload }) =>
      updateConsultationPricing(id, payload),
  })

export const usePublishConsultation = () =>
  useMutation({
    mutationFn: (id: string) => publishConsultation(id),
  })
