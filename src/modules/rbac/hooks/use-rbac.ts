import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  completeContactSetup,
  createRole,
  createSubAdmin,
  deleteRole,
  deleteSubAdmin,
  disableRole,
  enableRole,
  fetchContactSetupProfile,
  fetchPermissionCatalog,
  fetchRbacMe,
  fetchRbacStats,
  fetchRole,
  fetchRoleUsers,
  fetchRoles,
  fetchSubAdmin,
  fetchSubAdminLogs,
  fetchMySubAdminLogs,
  fetchRoleLogs,
  fetchAuditLog,
  flagAuditLog,
  rollbackAuditLog,
  fetchSubAdminInvites,
  fetchAllInvites,
  reinviteSubAdmin,
  revokeSubAdminInvite,
  fetchSubAdmins,
  suspendSubAdmin,
  reactivateSubAdmin,
  updateRole,
  updateSubAdmin,
  updateSubAdminPassword,
  updateMyPassword,
} from '../api/rbac-api'
import type {
  CompleteContactSetupPayload,
  CreateRolePayload,
  CreateSubAdminPayload,
  InviteActionPayload,
  UpdateSubAdminPasswordPayload,
  AdminProfile,
} from '../types/rbac'

export const rbacKeys = {
  all: ['rbac'] as const,
  me: ['rbac', 'me'] as const,
  contactSetup: ['rbac', 'contact-setup'] as const,
  stats: ['rbac', 'stats'] as const,
  permissions: ['rbac', 'permissions'] as const,
  roles: (params?: object) => ['rbac', 'roles', params] as const,
  role: (id: string) => ['rbac', 'role', id] as const,
  roleUsers: (id: string, params?: object) => ['rbac', 'role-users', id, params] as const,
  subAdmins: (params?: object) => ['rbac', 'sub-admins', params] as const,
  subAdmin: (id: string) => ['rbac', 'sub-admin', id] as const,
  logs: (id: string, params?: object) => ['rbac', 'logs', id, params] as const,
  myLogs: (params?: object) => ['rbac', 'my-logs', params] as const,
  roleLogs: (id: string, params?: object) => ['rbac', 'role-logs', id, params] as const,
  auditLog: (id: string) => ['rbac', 'audit-log', id] as const,
  invites: (id: string, params?: object) => ['rbac', 'invites', id, params] as const,
  allInvites: (params?: object) => ['rbac', 'all-invites', params] as const,
}

export function useRbacMe() {
  return useQuery<{ success: boolean; data: AdminProfile }>({
    queryKey: rbacKeys.me,
    queryFn: fetchRbacMe,
    retry: false,
  })
}

export function useContactSetupProfile(enabled = true) {
  return useQuery({
    queryKey: rbacKeys.contactSetup,
    queryFn: fetchContactSetupProfile,
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useCompleteContactSetup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CompleteContactSetupPayload) => completeContactSetup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.me })
      queryClient.invalidateQueries({ queryKey: rbacKeys.contactSetup })
      queryClient.invalidateQueries({ queryKey: rbacKeys.subAdmins() })
    },
  })
}

export function usePermissionCatalog(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: rbacKeys.permissions,
    queryFn: fetchPermissionCatalog,
    enabled: options?.enabled ?? true,
  })
}

export function useRbacStats() {
  return useQuery({
    queryKey: rbacKeys.stats,
    queryFn: fetchRbacStats,
  })
}

export const useRoles = (params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  mfaRequired?: string
  riskLevel?: string
  roleId?: string
  roleName?: string
  [key: string]: unknown
}) => {
  return useQuery({
    queryKey: rbacKeys.roles(params),
    queryFn: () => fetchRoles(params),
  })
}

export function useRole(id: string) {
  return useQuery({
    queryKey: rbacKeys.role(id),
    queryFn: () => fetchRole(id),
    enabled: Boolean(id),
  })
}

export function useRoleUsers(
  id: string,
  params?: {
    page?: number
    limit?: number
    search?: string
    roleId?: string
    status?: string
    mfaEnabled?: string
    role?: string
    adminCode?: string
    fullname?: string
    email?: string
    department?: string
    [key: string]: unknown
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: rbacKeys.roleUsers(id, params),
    queryFn: () => fetchRoleUsers(id, params),
    enabled: options?.enabled ?? Boolean(id),
  })
}

export const useSubAdmins = (
  params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    mfaEnabled?: string
    role?: string
    adminCode?: string
    fullname?: string
    email?: string
    department?: string
    [key: string]: unknown
  },
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: rbacKeys.subAdmins(params),
    queryFn: () => fetchSubAdmins(params),
    enabled: options?.enabled ?? true,
  })
}

export function useSubAdmin(id: string) {
  return useQuery({
    queryKey: rbacKeys.subAdmin(id),
    queryFn: () => fetchSubAdmin(id),
    enabled: Boolean(id),
  })
}

export function useSubAdminLogs(
  id: string,
  params?: Record<string, unknown>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: rbacKeys.logs(id, params),
    queryFn: () => fetchSubAdminLogs(id, params),
    enabled: options?.enabled ?? Boolean(id),
  })
}

export function useMySubAdminLogs(
  params?: Record<string, unknown>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: rbacKeys.myLogs(params),
    queryFn: () => fetchMySubAdminLogs(params),
    enabled: options?.enabled ?? true,
  })
}

export function useRoleLogs(
  id: string,
  params?: Record<string, unknown>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: rbacKeys.roleLogs(id, params),
    queryFn: () => fetchRoleLogs(id, params),
    enabled: options?.enabled ?? Boolean(id),
  })
}

export function useAuditLog(logId: string) {
  return useQuery({
    queryKey: rbacKeys.auditLog(logId),
    queryFn: () => fetchAuditLog(logId),
    enabled: Boolean(logId),
  })
}

export function useFlagAuditLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (logId: string) => flagAuditLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useRollbackAuditLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (logId: string) => rollbackAuditLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useAllInvites(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: rbacKeys.allInvites(params),
    queryFn: () => fetchAllInvites(params),
  })
}

export function useSubAdminInvites(id: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: rbacKeys.invites(id, params),
    queryFn: () => fetchSubAdminInvites(id, params),
    enabled: Boolean(id),
  })
}

export function useReinviteSubAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ inviteId, payload }: { inviteId: string; payload: InviteActionPayload }) =>
      reinviteSubAdmin(inviteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useRevokeSubAdminInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ inviteId, payload }: { inviteId: string; payload: InviteActionPayload }) =>
      revokeSubAdminInvite(inviteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateRolePayload> }) =>
      updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useDisableRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => disableRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useEnableRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => enableRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useCreateSubAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSubAdminPayload) => createSubAdmin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useUpdateSubAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateSubAdminPayload> }) =>
      updateSubAdmin(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useSuspendSubAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => suspendSubAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useReactivateSubAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reactivateSubAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useDeleteSubAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSubAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useUpdateSubAdminPassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubAdminPasswordPayload }) =>
      updateSubAdminPassword(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}

export function useUpdateMyPassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSubAdminPasswordPayload) => updateMyPassword(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.me })
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}
