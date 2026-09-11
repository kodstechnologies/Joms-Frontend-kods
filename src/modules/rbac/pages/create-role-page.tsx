import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PermissionAccordions } from '../components/permission-accordions'
import { RbacLoader } from '../components/rbac-loader'
import { useCreateRole, usePermissionCatalog, useRole, useUpdateRole } from '../hooks/use-rbac'
import { RequiredMark } from '@/shared/components/form/required-mark'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { getApiErrorMessage } from '@/shared/lib/api-error'
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
  const pageTitle = isEdit ? 'Edit Role' : 'Create New Role'
  const pageSubtitle = isEdit
    ? 'Role Based Access / Edit Role'
    : 'Role Based Access / Create New Role'

  const handleSubmit = async () => {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName || trimmedName.toLowerCase() === 'null') {
      toast.error('Role name is required')
      return
    }
    if (!trimmedDescription || trimmedDescription.toLowerCase() === 'null') {
      toast.error('Role description is required')
      return
    }
    if (!permissions.length) {
      toast.error('Select at least one permission for this role')
      return
    }

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({
          id,
          payload: {
            name: trimmedName,
            description: trimmedDescription,
            permissions,
            mfaRequired,
          },
        })
        toast.success('Role updated')
      } else {
        await createMutation.mutateAsync({
          name: trimmedName,
          description: trimmedDescription,
          permissions,
          mfaRequired,
        })
        toast.success('Role created')
      }
      navigate('/settings/access')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, isEdit ? 'Failed to update role' : 'Failed to create role'),
      )
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="create-role-page">
      <div className="create-role-header">
        <button
          type="button"
          onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
          className="create-role-back"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          <span>{pageTitle}</span>
        </button>
        <p className="create-role-breadcrumb">{pageSubtitle}</p>
      </div>

      <div className="create-role-card">
        <h2 className="create-role-card-title">Role Details</h2>
        <p className="create-role-card-subtitle">Provide basic information about this role.</p>

        <div className="create-role-details-grid">
          <div className="create-role-field">
            <label htmlFor="role-name" className="create-role-field-label">
              Role Name <RequiredMark />
            </label>
            <Input
              id="role-name"
              className="create-role-field-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Support Manager"
              disabled={isLoading}
            />
          </div>
          <div className="create-role-field create-role-field-span">
            <label htmlFor="role-description" className="create-role-field-label">
              Description <RequiredMark />
            </label>
            <textarea
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this role is responsible for"
              rows={3}
              disabled={isLoading}
              className="create-role-textarea"
            />
          </div>
        </div>
      </div>

      <div className="create-role-card">
        <h2 className="create-role-card-title">Assign Permissions</h2>
        <p className="create-role-card-subtitle">
          Enable or disable permissions for each module. These permissions define what actions this
          role can perform. At least one permission is required.
        </p>

        <div className="create-role-permissions-body">
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

      <div className="create-role-footer">
        <Button
          variant="secondary"
          className="create-role-footer-prev"
          onClick={() => navigateBackOrFallback(navigate, '/settings/access')}
        >
          Previous
        </Button>
        <Button
          className="create-role-footer-primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isEdit ? 'Save Role' : 'Create New Role'}
        </Button>
      </div>
    </div>
  )
}
