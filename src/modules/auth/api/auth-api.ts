import { apiClient } from '@/shared/lib/axios'

type LoginPayload = {
  email: string
  password: string
}

type LoginResponse = {
  accessToken: string
  user: {
    id: string
    email: string
    role: 'admin' | 'manager'
  }
}

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<LoginResponse>('/auth/login', payload)
  return response.data
}
