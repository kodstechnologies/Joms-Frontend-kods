import { adminApiClient } from '@/shared/lib/axios'
import type {
  AdminLogSubject,
  AdminProfile,
  AuditLog,
  CreateRolePayload,
  CreateSubAdminPayload,
  PermissionCatalog,
  RbacStats,
  Role,
  SubAdmin,
  SubAdminInvite,
} from '../types/rbac'

type ListParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export const fetchRbacMe = async () => {
  const response = await adminApiClient.get<{ success: boolean; data: AdminProfile }>(
    '/admin/rbac/me',
  )
  return response.data
}

export const fetchPermissionCatalog = async () => {
  const response = await adminApiClient.get<{ success: boolean; data: PermissionCatalog }>(
    '/admin/rbac/permissions',
  )
  return response.data
}

export const fetchRbacStats = async () => {
  const response = await adminApiClient.get<{ success: boolean; data: RbacStats }>(
    '/admin/rbac/stats',
  )
  return response.data
}

export const fetchRoles = async (params?: ListParams) => {
  const response = await adminApiClient.get<{
    success: boolean
    data: Role[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>('/admin/rbac/roles', { params })
  return response.data
}

export const fetchRole = async (id: string) => {
  const response = await adminApiClient.get<{ success: boolean; data: Role }>(
    `/admin/rbac/roles/${id}`,
  )
  return response.data
}

export const createRole = async (payload: CreateRolePayload) => {
  const response = await adminApiClient.post('/admin/rbac/roles', payload)
  return response.data
}

export const updateRole = async (id: string, payload: Partial<CreateRolePayload>) => {
  const response = await adminApiClient.patch(`/admin/rbac/roles/${id}`, payload)
  return response.data
}

export const disableRole = async (id: string) => {
  const response = await adminApiClient.patch(`/admin/rbac/roles/${id}/disable`)
  return response.data
}

export const deleteRole = async (id: string) => {
  const response = await adminApiClient.delete(`/admin/rbac/roles/${id}`)
  return response.data
}

export const fetchSubAdmins = async (params?: ListParams) => {
  const response = await adminApiClient.get<{
    success: boolean
    data: SubAdmin[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>('/admin/rbac/sub-admins', { params })
  return response.data
}

export const fetchSubAdmin = async (id: string) => {
  const response = await adminApiClient.get<{ success: boolean; data: SubAdmin }>(
    `/admin/rbac/sub-admins/${id}`,
  )
  return response.data
}

export const createSubAdmin = async (payload: CreateSubAdminPayload) => {
  const response = await adminApiClient.post<{ success: boolean; data: SubAdmin }>(
    '/admin/rbac/sub-admins',
    payload,
  )
  return response.data
}

export const updateSubAdmin = async (id: string, payload: Partial<CreateSubAdminPayload>) => {
  const response = await adminApiClient.patch(`/admin/rbac/sub-admins/${id}`, payload)
  return response.data
}

export const suspendSubAdmin = async (id: string) => {
  const response = await adminApiClient.patch(`/admin/rbac/sub-admins/${id}/suspend`)
  return response.data
}

export const deleteSubAdmin = async (id: string) => {
  const response = await adminApiClient.delete(`/admin/rbac/sub-admins/${id}`)
  return response.data
}

export const fetchSubAdminLogs = async (id: string, params?: ListParams) => {
  const response = await adminApiClient.get<{
    success: boolean
    data: { subject: AdminLogSubject; subAdmin: SubAdmin; logs: AuditLog[] }
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>(`/admin/rbac/sub-admins/${id}/logs`, { params })
  return response.data
}

export const fetchRoleLogs = async (id: string, params?: ListParams) => {
  const response = await adminApiClient.get<{
    success: boolean
    data: { subject: AdminLogSubject; role: Role; logs: AuditLog[] }
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>(`/admin/rbac/roles/${id}/logs`, { params })
  return response.data
}

export const fetchAuditLog = async (logId: string) => {
  const response = await adminApiClient.get<{ success: boolean; data: AuditLog }>(
    `/admin/rbac/logs/${logId}`,
  )
  return response.data
}

export const flagAuditLog = async (logId: string) => {
  const response = await adminApiClient.patch<{ success: boolean; data: AuditLog }>(
    `/admin/rbac/logs/${logId}/flag`,
  )
  return response.data
}

export const fetchSubAdminInvites = async (id: string, params?: ListParams) => {
  const response = await adminApiClient.get<{
    success: boolean
    data: { subAdmin: SubAdmin; invites: SubAdminInvite[] }
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>(`/admin/rbac/sub-admins/${id}/invites`, { params })
  return response.data
}

export const reinviteSubAdmin = async (inviteId: string) => {
  const response = await adminApiClient.post<{ success: boolean; data: SubAdminInvite }>(
    `/admin/rbac/invites/${inviteId}/reinvite`,
  )
  return response.data
}

export const revokeSubAdminInvite = async (inviteId: string) => {
  const response = await adminApiClient.patch<{ success: boolean; data: SubAdminInvite }>(
    `/admin/rbac/invites/${inviteId}/revoke`,
  )
  return response.data
}
