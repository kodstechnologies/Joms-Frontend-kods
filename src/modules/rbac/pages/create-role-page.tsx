import { ArrowLeft, Save } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PermissionAccordions } from '../components/permission-accordions'
import { RbacLoader } from '../components/rbac-loader'
import { useCreateRole, usePermissionCatalog, useRole, useUpdateRole } from '../hooks/use-rbac'
import { RequiredMark } from '@/shared/components/form/required-mark'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { navigateBackOrFallback } from '@/shared/lib/navigation'

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
  const [hydratedRole, setHydratedRole] = useState(roleData?.data)

  if (roleData?.data && roleData.data !== hydratedRole) {
    setHydratedRole(roleData.data)
    setName(roleData.data.name)
    setDescription(roleData.data.description)
    setPermissions(roleData.data.permissions)
    setMfaRequired(roleData.data.mfaRequired)
  }

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
          onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
          className="rounded-brand-md text-brand-muted hover:text-brand-text border border-white/10 p-2 transition-colors hover:bg-white/5"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-brand-text text-2xl font-bold">
            {isEdit ? 'Edit Role' : 'Create New Role'}
          </h1>
          <p className="text-brand-muted text-sm">
            Role Based Access / {isEdit ? 'Edit Role' : 'Create New Role'}
          </p>
        </div>
      </div>

      <div className="rounded-brand-lg bg-brand-surface border border-white/10 p-5 md:p-6">
        <h2 className="text-brand-text text-lg font-semibold">Role Details</h2>
        <p className="text-brand-muted mt-1 text-sm">Provide basic information about this role.</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="role-name" className="text-brand-text text-sm font-medium">
              Role Name <RequiredMark />
            </label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Venues Manager"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="role-description" className="text-brand-text text-sm font-medium">
              Description <RequiredMark />
            </label>
            <textarea
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this role is responsible for"
              rows={3}
              className="rounded-brand-md bg-brand-bg text-brand-text placeholder:text-brand-muted focus:ring-brand-accent/40 w-full resize-none border border-white/10 px-4 py-3 text-sm outline-none focus:ring-2"
            />
          </div>
        </div>
      </div>

      <div className="rounded-brand-lg bg-brand-surface border border-white/10 p-5 md:p-6">
        <h2 className="text-brand-text text-lg font-semibold">Assign Permissions</h2>
        <p className="text-brand-muted mt-1 text-sm">
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
            <RbacLoader label="Loading permission catalog..." className="min-h-[140px]" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
        >
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
