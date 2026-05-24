import {
  clearAuth,
  getAccessToken,
  getStoredWorkspaceId,
  setTokens,
} from './auth-storage'
import type {
  AuthTokens,
  BffMe,
  ChatResponse,
  KnowledgeHit,
  McpCatalogItem,
  McpInstallation,
  PendingApproval,
  WorkspaceList,
} from './types'

export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api'

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}

export class ApiError extends Error {
  status: number
  body?: string

  constructor(message: string, status: number, body?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const ws = getStoredWorkspaceId()
  if (ws) headers.set('X-Workspace-Id', ws)

  return fetch(apiUrl(path), { ...init, headers })
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!res.ok) {
    throw new ApiError(text || res.statusText, res.status, text)
  }
  if (!text) return {} as T
  return JSON.parse(text) as T
}

export async function authLogin(email: string, password: string): Promise<AuthTokens> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJson<AuthTokens>(res)
  setTokens(data.accessToken, data.refreshToken)
  return data
}

export async function authRegister(payload: {
  email: string
  password: string
  displayName: string
  organizationName?: string
}): Promise<AuthTokens> {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const data = await parseJson<AuthTokens>(res)
  setTokens(data.accessToken, data.refreshToken)
  return data
}

export async function authLogout(): Promise<void> {
  const refreshToken = localStorage.getItem('cg.refreshToken')
  try {
    if (refreshToken) {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })
    }
  } finally {
    clearAuth()
  }
}

export async function fetchMe(): Promise<BffMe> {
  return parseJson(await apiFetch('/me'))
}

export async function fetchWorkspaces(orgId: string): Promise<WorkspaceList> {
  return parseJson(await apiFetch(`/config/orgs/${orgId}/workspaces`))
}

export async function fetchCatalog(): Promise<{ items: McpCatalogItem[] }> {
  return parseJson(await apiFetch('/mcp/catalog'))
}

export async function fetchInstallations(
  workspaceId: string,
): Promise<{ items: McpInstallation[] }> {
  return parseJson(await apiFetch(`/mcp/workspaces/${workspaceId}/installations`))
}

export async function installConnector(
  workspaceId: string,
  body: {
    connectorKey: string
    displayLabel: string
    form: Record<string, string>
  },
): Promise<McpInstallation> {
  return parseJson(
    await apiFetch(`/mcp/workspaces/${workspaceId}/installations`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  )
}

export async function sendChat(message: string, extra?: Record<string, string>): Promise<ChatResponse> {
  return parseJson(
    await apiFetch('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, ...extra }),
    }),
  )
}

export async function fetchPendingApprovals(orgId: string, workspaceId: string) {
  const q = new URLSearchParams({ workspace_id: workspaceId })
  return parseJson<{ items: PendingApproval[] }>(
    await apiFetch(`/policy/orgs/${orgId}/pending-approvals?${q}`),
  )
}

export async function approvePending(id: string, userId: string) {
  return parseJson(
    await apiFetch(`/policy/pending-approvals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decidedByUserId: userId }),
    }),
  )
}

export async function rejectPending(id: string, userId: string) {
  return parseJson(
    await apiFetch(`/policy/pending-approvals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ decidedByUserId: userId }),
    }),
  )
}

export async function knowledgeSearch(orgId: string, workspaceId: string, query: string) {
  return parseJson<{ items: KnowledgeHit[] }>(
    await apiFetch('/knowledge/search', {
      method: 'POST',
      body: JSON.stringify({ orgId, workspaceId, query }),
    }),
  )
}

export async function fetchKnowledgeConnectors() {
  return parseJson<{ items: { connectorKey: string; displayName?: string }[] }>(
    await apiFetch('/knowledge/connectors'),
  )
}
