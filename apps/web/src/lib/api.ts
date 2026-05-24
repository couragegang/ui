/**
 * Web-обёртка над общим BFF API. Новый код — импортируйте `bffApi` из `../platform/bff`.
 */
import { ApiError } from '@couragegang/api-client'
import type {
  AuthTokens,
  BffMe,
  ChatResponse,
  ChatMessage,
  Conversation,
  IamMeResponse,
  McpCatalogItem,
  McpInstallRequest,
  McpInstallation,
  McpInstallationDetail,
  McpInstallationUpdate,
  NotionResourceItem,
  Organization,
  OrganizationGroup,
  OrganizationInvite,
  OrganizationInviteCreated,
  PendingApproval,
  Workspace,
} from '@couragegang/shared/types'
import { bffApi } from '../platform/bff'
import { authStorage } from '../platform/storage'

export { ApiError }
export type {
  AuthTokens,
  BffMe,
  ChatMessage,
  ChatResponse,
  Conversation,
  McpCatalogItem,
  McpInstallRequest,
  McpInstallation,
  McpInstallationDetail,
  McpInstallationUpdate,
  PendingApproval,
  Workspace,
}

export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '/api'

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return bffApi.http.request(path, init)
}

export async function authLogin(email: string, password: string): Promise<AuthTokens> {
  const data = (await bffApi.authLogin(email, password)) as AuthTokens
  authStorage.setTokens(data.accessToken, data.refreshToken)
  return data
}

export async function authRegister(payload: {
  email: string
  password: string
  displayName: string
  organizationName?: string
}): Promise<AuthTokens> {
  const data = (await bffApi.authRegister(payload)) as AuthTokens
  authStorage.setTokens(data.accessToken, data.refreshToken)
  return data
}

export async function authLogout(): Promise<void> {
  const refreshToken = authStorage.getRefreshToken()
  try {
    if (refreshToken) await bffApi.authLogout(refreshToken)
  } finally {
    authStorage.clearAuth()
  }
}

export async function fetchMe(): Promise<BffMe> {
  return bffApi.me() as Promise<BffMe>
}

export async function fetchWorkspaces(
  orgId: string,
  groupId?: string,
): Promise<{ items: Workspace[] }> {
  return bffApi.workspaces(orgId, groupId) as Promise<{ items: Workspace[] }>
}

export async function fetchIamMe(): Promise<IamMeResponse> {
  const session = (await bffApi.me()) as BffMe
  return {
    user: session.user ?? { id: session.userId ?? '' },
    organizations: session.organizations ?? [],
  }
}

export async function patchIamMe(body: { displayName?: string; locale?: string }) {
  return bffApi.patchMe(body)
}

export async function fetchOrganization(orgId: string): Promise<Organization> {
  return bffApi.getOrganization(orgId) as Promise<Organization>
}

export async function patchOrganization(orgId: string, body: { name?: string }) {
  return bffApi.patchOrganization(orgId, body) as Promise<Organization>
}

export async function fetchGroups(orgId: string): Promise<{ items: OrganizationGroup[] }> {
  return bffApi.listGroups(orgId) as Promise<{ items: OrganizationGroup[] }>
}

export async function fetchMyGroups(orgId: string): Promise<{ items: OrganizationGroup[] }> {
  return bffApi.myGroups(orgId) as Promise<{ items: OrganizationGroup[] }>
}

export async function createOrganization(body: { name: string; slug: string; planTier?: string }) {
  return bffApi.createOrganization(body) as Promise<Organization>
}

export async function createGroup(orgId: string, body: { name: string; slug: string }) {
  return bffApi.createGroup(orgId, body) as Promise<OrganizationGroup>
}

export async function createWorkspace(
  orgId: string,
  body: { name: string; slug: string; groupId: string },
) {
  return bffApi.createWorkspace(orgId, body) as Promise<Workspace>
}

export async function patchWorkspace(workspaceId: string, body: { name?: string; status?: string }) {
  return bffApi.patchWorkspace(workspaceId, body) as Promise<Workspace>
}

/** @deprecated Используйте switchOrganization из useAuth() */
export async function switchOrganization(orgId: string): Promise<AuthTokens> {
  const data = (await bffApi.switchOrg(orgId)) as AuthTokens
  authStorage.setTokens(data.accessToken, data.refreshToken)
  return data
}

export async function fetchInvites(orgId: string): Promise<{ items: OrganizationInvite[] }> {
  return bffApi.listInvites(orgId) as Promise<{ items: OrganizationInvite[] }>
}

export type CreateInvitePayload = {
  email: string
  roleKeys: string[]
  groupId?: string
  groupRoleKeys?: string[]
  ttlHours?: number
}

export async function createInvite(orgId: string, body: CreateInvitePayload) {
  return bffApi.createInvite(orgId, body as unknown as Record<string, unknown>) as Promise<OrganizationInviteCreated>
}

export async function revokeInvite(orgId: string, inviteId: string) {
  await bffApi.revokeInvite(orgId, inviteId)
}

export async function acceptInvite(orgId: string, token: string) {
  return bffApi.acceptInvite({ orgId, token })
}

export async function fetchCatalog(): Promise<{ items: McpCatalogItem[] }> {
  return bffApi.catalog() as Promise<{ items: McpCatalogItem[] }>
}

export async function fetchCatalogItem(connectorKey: string): Promise<McpCatalogItem> {
  return bffApi.catalogItem(connectorKey) as Promise<McpCatalogItem>
}

export async function fetchInstallations(
  workspaceId: string,
): Promise<{ items: McpInstallation[] }> {
  return bffApi.installations(workspaceId) as Promise<{ items: McpInstallation[] }>
}

export async function discoverNotionDatabases(workspaceId: string, integrationToken: string) {
  return bffApi.discoverNotion(workspaceId, integrationToken) as Promise<{
    items: NotionResourceItem[]
  }>
}

export type SendChatPayload = {
  message: string
  conversationId?: string
  toolName?: string
  connectorKey?: string
  approvedPendingApprovalId?: string
}

export async function sendChat(payload: SendChatPayload): Promise<ChatResponse> {
  return bffApi.chat(payload as Record<string, unknown>) as Promise<ChatResponse>
}

export async function fetchConversations(includeArchived = false) {
  return bffApi.conversations(includeArchived) as Promise<{ items: Conversation[] }>
}

export async function createConversation(title?: string) {
  return bffApi.createConversation(title) as Promise<Conversation>
}

export async function fetchConversationMessages(conversationId: string) {
  return bffApi.conversationMessages(conversationId) as Promise<{ items: ChatMessage[] }>
}

export async function archiveConversation(conversationId: string) {
  return bffApi.archiveConversation(conversationId) as Promise<Conversation>
}

export async function deleteConversation(conversationId: string) {
  await bffApi.deleteConversation(conversationId)
}

export async function approvePending(id: string, userId: string) {
  return bffApi.approvePending(id, userId)
}

export async function rejectPending(id: string, userId: string) {
  return bffApi.rejectPending(id, userId)
}

export async function installConnector(workspaceId: string, body: McpInstallRequest) {
  return bffApi.installMcp(workspaceId, body as unknown as Record<string, unknown>)
}

export async function fetchInstallation(workspaceId: string, installationId: string) {
  return bffApi.getInstallation(workspaceId, installationId) as Promise<McpInstallationDetail>
}

export async function updateInstallation(
  workspaceId: string,
  installationId: string,
  body: McpInstallationUpdate,
) {
  return bffApi.updateInstallation(
    workspaceId,
    installationId,
    body as unknown as Record<string, unknown>,
  ) as Promise<McpInstallation>
}

export async function deleteInstallation(workspaceId: string, installationId: string) {
  await bffApi.deleteInstallation(workspaceId, installationId)
}

export async function checkInstallationHealth(workspaceId: string, installationId: string) {
  return bffApi.healthInstallation(workspaceId, installationId) as Promise<{ ok: boolean; message?: string }>
}
