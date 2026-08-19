import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  deleteBackup,
  fetchBackupMetrics,
  fetchBackups,
  restoreBackup,
  runBackup,
} from '../api/backups-api'

export const backupKeys = {
  all: ['settings', 'backups'] as const,
  metrics: () => [...backupKeys.all, 'metrics'] as const,
  list: (params?: object) => [...backupKeys.all, 'list', params] as const,
}

export const useBackupMetrics = () =>
  useQuery({
    queryKey: backupKeys.metrics(),
    queryFn: fetchBackupMetrics,
  })

export const useBackups = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: backupKeys.list(params),
    queryFn: () => fetchBackups(params),
  })

export const useRunBackup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: runBackup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: backupKeys.all })
    },
  })
}

export const useRestoreBackup = () =>
  useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: string }) => restoreBackup(id, { mode }),
  })

export const useDeleteBackup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBackup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: backupKeys.all })
    },
  })
}
