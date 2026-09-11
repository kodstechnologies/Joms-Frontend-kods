export type PermissionRisk = 'low' | 'medium' | 'high' | 'very_high'

export type PermissionLevelOption = {
  value: string
  label: string
}

export type PermissionItem = {
  key: string
  label: string
  risk: PermissionRisk
}

export type PermissionModule = {
  label: string
  permissions: PermissionItem[]
  levels?: PermissionLevelOption[]
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
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  lastActionAt?: string
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
  phone?: string
  emergencyContact?: string
  emergencyContactName?: string
  dateOfBirth?: string | null
  bloodGroup?: string
  profileImageUrl?: string
  mfaEnabled: boolean
  mfaSecret?: string
  otpauthUrl?: string
  contactSetupCompleted?: boolean
  roleIds: string[]
  roles: SubAdminRole[]
  scopes: string[]
  permissions: string[]
  authAdminId?: string
  status: 'active' | 'suspended' | 'disabled'
  lastActionAt?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  tempPassword?: string
  notificationSent?: boolean
}

export type AdminLogSubject = ({ type: 'subAdmin' } & SubAdmin) | ({ type: 'role' } & Role)

export type AuditLog = {
  id: string
  _id?: string
  action: string
  username: string
  module: string
  status: 'success' | 'failed' | string
  ipAddress: string
  adminNote: string
  performedBy: string
  flagged?: boolean
  rolledBack?: boolean
  canRollback?: boolean
  previousRole?: string
  changedTo?: string
  subAdminId?: string | null
  metadata?: Record<string, unknown>
  createdAt: string
}

export type RbacStats = {
  totalUsers: number
  totalActiveUsers: number
  currentlyOnlineUsers: number
  suspendedUsers: number
  totalRolesAvailable: number
  invitesSent: number
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
  password?: string
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

export type UpdateSubAdminPasswordPayload = {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}

export type AdminProfile = {
  id: string
  name: string
  kind: 'superadmin' | 'subadmin'
  isSuperAdmin: boolean
  permissions: string[]
  subAdminId?: string
  requiresContactSetup?: boolean
  contactSetupCompleted?: boolean
}

export type ContactSetupProfileResponse = {
  profile: SubAdmin
  permissionCatalog: PermissionCatalog
  requiresContactSetup: boolean
}

export type CompleteContactSetupPayload = {
  phone: string
  emergencyContact: string
  emergencyContactName: string
  dateOfBirth?: string
  bloodGroup?: string
  profileImageUrl?: string
  mfaCode?: string
}

export type SubAdminInvite = {
  id: string
  inviteId: string
  username: string
  roleId: string
  roleCode: string
  roleName: string
  email: string
  status: 'pending' | 'accepted' | 'revoked'
  timestamp?: string
  sentAt: string
  sentBy?: string
  acceptedAt?: string | null
  revokedAt?: string | null
  lastAction?: {
    type?: 'reinvite' | 'revoke'
    reasonIds?: string[]
    selectedReasons?: string[]
    reasonDetails?: string
    adminNotes?: string
    performedBy?: string
    performedAt?: string | null
  } | null
  createdAt?: string
  updatedAt?: string
}

export type InviteActionPayload = {
  reasonIds: string[]
  selectedReasons: string[]
  reasonDetails: string
  adminNotes: string
  confirmed: boolean
}
