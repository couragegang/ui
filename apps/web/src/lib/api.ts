/**
 * Web-обёртка над общим BFF API. Новый код — импортируйте `bffApi` из `../platform/bff`.
 */
import { ApiError } from '@couragegang/api-client'
import type {
  AuthTokens,
  BffMe,
  ChatResponse,
  KnowledgeHit,
  McpCatalogItem,
  McpInstallation,
  PendingApproval,
  Workspace,
} from '@couragegang/shared/types'
import { bffApi } from '../platform/bff'
import { authStorage } from '../platform/storage'

export { ApiError }
export type {
  AuthTokens,
  BffMe,
  ChatResponse,
  KnowledgeHit,
  McpCatalogItem,
  McpInstallation,
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

export async function fetchWorkspaces(orgId: string): Promise<{ items: Workspace[] }> {
  return bffApi.workspaces(orgId) as Promise<{ items: Workspace[] }>
}

export async function fetchCatalog(): Promise<{ items: McpCatalogItem[] }> {
  return bffApi.catalog() as Promise<{ items: McpCatalogItem[] }>
}

export async function fetchInstallations(
  workspaceId: string,
): Promise<{ items: McpInstallation[] }> {
  return bffApi.installations(workspaceId) as Promise<{ items: McpInstallation[] }>
}

export async function sendChat(
  message: string,
  extra?: Record<string, string>,
): Promise<ChatResponse> {
  return bffApi.chat({ message, ...extra }) as Promise<ChatResponse>
}

export async function fetchPendingApprovals(orgId: string, workspaceId: string) {
  const q = new URLSearchParams({ workspace_id: workspaceId })
  return bffApi.http.parseJson<{ items: PendingApproval[] }>(
    await bffApi.http.request(`/policy/orgs/${orgId}/pending-approvals?${q}`),
  )
}

export async function approvePending(id: string, userId: string) {
  return bffApi.http.parseJson(
    await bffApi.http.request(`/policy/pending-approvals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decidedByUserId: userId }),
    }),
  )
}

export async function rejectPending(id: string, userId: string) {
  return bffApi.http.parseJson(
    await bffApi.http.request(`/policy/pending-approvals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ decidedByUserId: userId }),
    }),
  )
}

export async function knowledgeSearch(orgId: string, workspaceId: string, query: string) {
  return bffApi.http.parseJson<{ items: KnowledgeHit[] }>(
    await bffApi.http.request('/knowledge/search', {
      method: 'POST',
      body: JSON.stringify({ orgId, workspaceId, query }),
    }),
  )
}

export async function fetchKnowledgeConnectors() {
  return bffApi.http.parseJson<{ items: { connectorKey: string; displayName?: string }[] }>(
    await bffApi.http.request('/knowledge/connectors'),
  )
}

export async function installConnector(
  workspaceId: string,
  body: { connectorKey: string; displayLabel: string; form: Record<string, string> },
) {
  return bffApi.http.parseJson(
    await bffApi.http.request(`/mcp/workspaces/${workspaceId}/installations`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  )
}
