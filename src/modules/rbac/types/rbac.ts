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
  phoneVerified?: boolean
  emergencyContact?: string
  emergencyContactName?: string
  dateOfBirth?: string | null
  bloodGroup?: string
  profileImageUrl?: string
  mfaEnabled: boolean
  mfaSecret?: string
  otpauthUrl?: string
  contactSetupCompleted?: boolean
  emailVerified?: boolean
  alternativeNumber?: string
  countryCode?: string
  address?: string
  district?: string
  state?: string
  pincode?: string
  kind?: string
  isSuperAdmin?: boolean
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

export type SuperAdminSelfProfile = {
  id: string
  firstName: string
  lastName: string
  fullname: string
  email: string
  emailVerified?: boolean
  phone?: string
  phoneVerified?: boolean
  alternativeNumber?: string
  countryCode?: string
  address?: string
  district?: string
  state?: string
  pincode?: string
  dateOfBirth?: string | null
  bloodGroup?: string
  emergencyContact?: string
  emergencyContactName?: string
  location?: string
  department?: string
  jobTitle?: string
  employmentType?: string
  workplaceFlexibility?: string
  profileImageUrl?: string
  employeeId?: string
  roleLabel: string
  status: string
  mfaEnabled: boolean
  createdAt?: string
  updatedAt?: string
  lastActionAt?: string
  kind: 'superadmin'
  isSuperAdmin: true
  contactSetupCompleted?: boolean
}

export type AdminLogSubject =
  | ({ type: 'subAdmin' } & SubAdmin)
  | ({ type: 'role' } & Role)
  | ({ type: 'superadmin' } & SuperAdminSelfProfile)

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

export type RbacMetricTrend = {
  change: string
  changeType: 'up' | 'down'
  changeNote: string
  percentage: number
}

export type RbacStats = {
  totalUsers: number
  totalActiveUsers: number
  currentlyOnlineUsers: number
  suspendedUsers: number
  totalRolesAvailable: number
  deletedRoles: number
  pendingInvitations: number
  invitationAcceptanceRate: number
  mfaAdoptionRate: number
  privilegedUsers: number
  activeRoleAssignments: number
  permissionChangesMtd: number
  invitesSent: number
  metricTrends?: Partial<Record<string, RbacMetricTrend | null>>
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
  email?: string
  kind: 'superadmin' | 'subadmin'
  isSuperAdmin: boolean
  permissions: string[]
  subAdminId?: string
  requiresContactSetup?: boolean
  contactSetupCompleted?: boolean
  mfaEnabled?: boolean
  mfaRequired?: boolean
  requiresMfaSetup?: boolean
  profile?: SuperAdminSelfProfile
}

export type ContactSetupProfileResponse = {
  profile: SubAdmin
  permissionCatalog: PermissionCatalog
  requiresContactSetup: boolean
}

export type CompleteContactSetupPayload = {
  firstName?: string
  lastName?: string
  phone: string
  alternativeNumber?: string
  countryCode?: string
  address?: string
  district?: string
  state?: string
  pincode?: string
  location?: string
  department?: string
  jobTitle?: string
  employmentType?: string
  workplaceFlexibility?: string
  emergencyContact?: string
  emergencyContactName?: string
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
