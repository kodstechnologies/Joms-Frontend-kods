export type PermissionRisk = 'low' | 'medium' | 'high'

export type PermissionItem = {
  key: string
  label: string
  risk: PermissionRisk
}

export type PermissionModule = {
  label: string
  permissions: PermissionItem[]
}

export type PermissionCatalog = Record<string, PermissionModule>

export type Role = {
  id: string
  roleCode: string
  name: string
  description: string
  scopes: string[]
  permissions: string[]
  riskLevel: string
  mfaRequired: boolean
  status: 'active' | 'disabled'
  userCount: number
  createdAt?: string
  updatedAt?: string
}

export type SubAdminRole = Pick<Role, 'id' | 'roleCode' | 'name' | 'permissions' | 'scopes'>

export type SubAdmin = {
  id: string
  adminCode: string
  firstName: string
  lastName: string
  fullname: string
  email: string
  department: string
  jobTitle: string
  employeeId: string
  employmentType: string
  workplaceFlexibility: string
  location: string
  mfaEnabled: boolean
  roleIds: string[]
  roles: SubAdminRole[]
  scopes: string[]
  permissions: string[]
  authAdminId?: string
  status: 'active' | 'suspended' | 'disabled'
  lastActionAt?: string
  createdAt?: string
  updatedAt?: string
  tempPassword?: string
}

export type RbacStats = {
  totalUsers: number
  totalActiveUsers: number
  currentlyOnlineUsers: number
  suspendedUsers: number
  totalRolesAvailable: number
  invitesSent: number
}

export type AuditLog = {
  _id: string
  action: string
  username: string
  module: string
  status: string
  ipAddress: string
  adminNote: string
  performedBy: string
  createdAt: string
}

export type CreateRolePayload = {
  name: string
  description: string
  permissions: string[]
  mfaRequired?: boolean
}

export type CreateSubAdminPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  department?: string
  jobTitle?: string
  employeeId?: string
  employmentType?: string
  workplaceFlexibility?: string
  location?: string
  mfaEnabled?: boolean
  roleIds: string[]
  adminNote?: string
}

export type AdminProfile = {
  id: string
  name: string
  kind: 'superadmin' | 'subadmin'
  isSuperAdmin: boolean
  permissions: string[]
}
