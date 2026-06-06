export type AuthTokens = {
  accessToken: string
  refreshToken?: string
}

export type BffMe = {
  authenticated?: boolean
  userId?: string
  orgId?: string
  groupId?: string
  workspaceId?: string
  permissions?: string[]
  user?: IamUserPublic
  organizations?: IamMeOrgSummary[]
}

export type Workspace = {
  id: string
  name?: string
  orgId?: string
  groupId?: string
  slug?: string
  status?: string
  createdAt?: string
}

export type IamUserPublic = {
  id: string
  email?: string
  emailVerified?: boolean
  displayName?: string
  locale?: string
  status?: string
}

export type IamMeOrgSummary = {
  orgId: string
  slug?: string
  name?: string
  roles?: string[]
}

export type IamMeResponse = {
  user: IamUserPublic
  organizations: IamMeOrgSummary[]
}

export type Organization = {
  id: string
  name: string
  slug: string
  planTier?: string | null
  defaultGroupId?: string
  createdAt?: string
}

export type OrganizationGroup = {
  id: string
  orgId: string
  name: string
  slug: string
  isDefault?: boolean
  status?: string
  createdAt?: string
}

export type OrganizationInvite = {
  id: string
  email: string
  groupId?: string | null
  roleKeys?: string[]
  groupRoleKeys?: string[]
  expiresAt?: string
  createdAt?: string
  acceptedAt?: string | null
}

export type OrganizationInviteCreated = OrganizationInvite & {
  acceptUrlHint?: string | null
}

export type LocalizedLabel = string | { ru?: string; en?: string }

export type ConnectionFormField = {
  key: string
  type?: string
  label?: LocalizedLabel
  required?: boolean
  sensitive?: boolean
  widget?: 'text' | 'password' | 'textarea' | string
  storage?: 'secret' | 'config'
  placeholder?: LocalizedLabel
}

export type ConnectionFormSchema = {
  schema_version?: number
  title?: LocalizedLabel
  fields?: ConnectionFormField[]
}

export type PolicyRuleTemplate = {
  effect: string
  resource_pattern: string
  priority?: number
}

export type PolicyTemplatePack = {
  rules?: PolicyRuleTemplate[]
}

export type McpCatalogItem = {
  connectorKey: string
  displayName?: string
  description?: string
  connectionFormSchema?: ConnectionFormSchema
  policyPackVersion?: string
  policyTemplatePack?: PolicyTemplatePack
}

export type McpInstallRequest = {
  connectorKey: string
  displayLabel?: string
  form: Record<string, string | number | boolean>
  policyPack?: PolicyTemplatePack
}

export type McpInstallation = {
  id: string
  workspaceId?: string
  connectorKey: string
  displayLabel?: string
  status?: string
}

export type McpInstallationDetail = {
  installation: McpInstallation
  connectionFormSchema?: ConnectionFormSchema
  config?: Record<string, string | number | boolean>
  secretsConfigured?: boolean
}

export type McpInstallationUpdate = {
  displayLabel?: string
  form?: Record<string, string>
}

export type NotionResourceItem = {
  id: string
  title: string
  url?: string
  kind?: string
}

export type Conversation = {
  id: string
  workspaceId?: string
  title?: string
  status?: 'active' | 'archived' | string
  createdAt?: string
  updatedAt?: string
}

export type ChatMessage = {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  status?: string
  pendingApprovalId?: string
  toolName?: string
  connectorKey?: string
  hitlResolved?: 'approved' | 'rejected'
  createdAt?: string
}

export type ChatResponse = {
  reply?: string
  status?: string
  conversationId?: string
  pendingApprovalId?: string
  conversationTitle?: string
  toolName?: string
  connectorKey?: string
}

export type PendingApproval = {
  id: string
  status?: string
  toolName?: string
  createdAt?: string
}

export type KnowledgeHit = {
  title?: string
  snippet?: string
  sourceId?: string
  externalUri?: string
}
