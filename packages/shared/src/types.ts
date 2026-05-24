export type AuthTokens = {
  accessToken: string
  refreshToken?: string
}

export type BffMe = {
  userId?: string
  orgId?: string
  groupId?: string
  workspaceId?: string
  permissions?: string[]
}

export type Workspace = {
  id: string
  name?: string
  orgId?: string
}

export type McpCatalogItem = {
  connectorKey: string
  displayName?: string
  description?: string
}

export type McpInstallation = {
  id: string
  connectorKey: string
  displayLabel?: string
  status?: string
}

export type ChatResponse = {
  reply?: string
  status?: string
  conversationId?: string
  pendingApprovalId?: string
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
