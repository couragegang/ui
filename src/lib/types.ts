export type AuthTokens = {
  accessToken: string
  refreshToken?: string
  accessExpiresIn?: number
  tokenType?: string
}

export type BffMe = {
  authenticated: boolean
  userId: string
  orgId?: string
  groupId?: string
  workspaceId?: string
  permissions: string[]
}

export type Workspace = {
  id: string
  name: string
  groupId?: string
  orgId?: string
}

export type WorkspaceList = { items: Workspace[] }

export type McpCatalogItem = {
  connectorKey: string
  displayName: string
  description?: string
  connectionFormSchema?: unknown
}

export type McpInstallation = {
  id: string
  connectorKey: string
  displayLabel?: string
  status?: string
}

export type ChatResponse = {
  reply: string
  status: string
  pendingApprovalId?: string
}

export type PendingApproval = {
  id: string
  status: string
  toolName?: string
  workspaceId?: string
  createdAt?: string
}

export type KnowledgeHit = {
  title?: string
  snippet?: string
  externalUri?: string
  score?: number
}
