import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PermissionAccordions } from '../components/permission-accordions'
import {
  useCreateRole,
  usePermissionCatalog,
  useRole,
  useUpdateRole,
} from '../hooks/use-rbac'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

export function CreateRolePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const { data: catalogData } = usePermissionCatalog()
  const { data: roleData, isLoading } = useRole(id ?? '')
  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState<string[]>([])
  const [mfaRequired, setMfaRequired] = useState(true)

  useEffect(() => {
    if (roleData?.data) {
      setName(roleData.data.name)
      setDescription(roleData.data.description)
      setPermissions(roleData.data.permissions)
      setMfaRequired(roleData.data.mfaRequired)
    }
  }, [roleData])

  const catalog = catalogData?.data ?? {}

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error('Role name and description are required')
      return
    }

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({
          id,
          payload: { name, description, permissions, mfaRequired },
        })
        toast.success('Role updated')
      } else {
        await createMutation.mutateAsync({ name, description, permissions, mfaRequired })
        toast.success('Role created')
      }
      navigate('/settings/access')
    } catch {
      toast.error(isEdit ? 'Failed to update role' : 'Failed to create role')
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/settings/access')}
          className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Role' : 'Create New Role'}
          </h1>
          <p className="text-sm text-slate-400">Role based Access / {isEdit ? 'Edit Role' : 'Create New Role'}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#141414] p-5 md:p-6">
        <h2 className="text-lg font-semibold text-white">Role Details</h2>
        <p className="mt-1 text-sm text-slate-400">Provide basic information about this role.</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Role Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Venues Manager"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-slate-300">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this role is responsible for"
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/50"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#141414] p-5 md:p-6">
        <h2 className="text-lg font-semibold text-white">Assign Permissions</h2>
        <p className="mt-1 text-sm text-slate-400">
          Enable permissions for Venues and Services modules only.
        </p>

        <div className="mt-5">
          {Object.keys(catalog).length ? (
            <PermissionAccordions
              catalog={catalog}
              selected={permissions}
              onChange={setPermissions}
            />
          ) : (
            <p className="text-sm text-slate-400">Loading permission catalog…</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate('/settings/access')}>
          Previous
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Save className="size-4" />
          {isEdit ? 'Save Role' : 'Create New Role'}
        </Button>
      </div>
    </div>
  )
}
