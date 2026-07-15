export interface CategoryFilter {
  serviceName: string
  category: string
  subCategory: string

  state: string
  city: string

  serviceType: string[]

  viewStatus: string[]

  approvalStatus: string[]

  type: string[]

  availability: string[]

  amenities: string[]

  expertsMin?: number
  expertsMax?: number

  revenueMin?: number
  revenueMax?: number

  createdFrom?: string
  createdTo?: string
}
