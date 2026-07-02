import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRole,
  createSubAdmin,
  deleteRole,
  deleteSubAdmin,
  disableRole,
  fetchPermissionCatalog,
  fetchRbacMe,
  fetchRbacStats,
  fetchRole,
  fetchRoles,
  fetchSubAdmin,
  fetchSubAdminLogs,
  fetchSubAdmins,
  suspendSubAdmin,
  updateRole,
  updateSubAdmin,
} from '../api/rbac-api'
import type { CreateRolePayload, CreateSubAdminPayload } from '../types/rbac'

export const rbacKeys = {
  all: ['rbac'] as const,
  me: ['rbac', 'me'] as const,
  stats: ['rbac', 'stats'] as const,
  permissions: ['rbac', 'permissions'] as const,
  roles: (params?: object) => ['rbac', 'roles', params] as const,
  role: (id: string) => ['rbac', 'role', id] as const,
  subAdmins: (params?: object) => ['rbac', 'sub-admins', params] as const,
  subAdmin: (id: string) => ['rbac', 'sub-admin', id] as const,
  logs: (id: string, params?: object) => ['rbac', 'logs', id, params] as const,
}

export function useRbacMe() {
  return useQuery({
    queryKey: rbacKeys.me,
    queryFn: fetchRbacMe,
    retry: false,
  })
}

export function usePermissionCatalog() {
  return useQuery({
    queryKey: rbacKeys.permissions,
    queryFn: fetchPermissionCatalog,
  })
}

export function useRbacStats() {
  return useQuery({
    queryKey: rbacKeys.stats,
    queryFn: fetchRbacStats,
  })
}

export function useRoles(params?: { page?: number; limit?: number; search?: string }) {
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

export function useSubAdmins(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: rbacKeys.subAdmins(params),
    queryFn: () => fetchSubAdmins(params),
  })
}

export function useSubAdmin(id: string) {
  return useQuery({
    queryKey: rbacKeys.subAdmin(id),
    queryFn: () => fetchSubAdmin(id),
    enabled: Boolean(id),
  })
}

export function useSubAdminLogs(id: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: rbacKeys.logs(id, params),
    queryFn: () => fetchSubAdminLogs(id, params),
    enabled: Boolean(id),
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

export function useDeleteSubAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSubAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.all })
    },
  })
}
