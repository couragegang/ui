import createClient from 'openapi-fetch'
import type { paths } from './generated/bff-schema'
import { ApiError, createHttpClient, type HttpClientConfig } from './http'

/** Typed client для путей из OpenAPI BFF (расширяйте spec в api-contracts). */
export function createBffOpenApiClient(config: HttpClientConfig) {
  const base = config.baseUrl.replace(/\/$/, '')
  const fetchImpl = config.fetchImpl ?? fetch
  return createClient<paths>({
    baseUrl: base,
    fetch: (input) => {
      const req = input instanceof Request ? input : new Request(input)
      const headers = new Headers(req.headers)
      const token = config.getAccessToken?.()
      if (token) headers.set('Authorization', `Bearer ${token}`)
      const ws = config.getWorkspaceId?.()
      if (ws) headers.set('X-Workspace-Id', ws)
      return fetchImpl(new Request(req, { headers }))
    },
  })
}

/**
 * Ручные методы BFF (пока не все paths в openapi.yaml).
 * После расширения spec — переносите на createBffOpenApiClient.
 */
export function createBffApi(config: HttpClientConfig) {
  const http = createHttpClient(config)

  return {
    http,
    me: async () => http.parseJson(await http.request('/me')),
    chat: async (body: Record<string, unknown>) =>
      http.parseJson(
        await http.request('/chat', { method: 'POST', body: JSON.stringify(body) }),
      ),
    workspaces: async (orgId: string) =>
      http.parseJson(await http.request(`/config/orgs/${orgId}/workspaces`)),
    authLogin: async (email: string, password: string) =>
      http.parseJson(
        await http.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }),
      ),
    authRegister: async (payload: Record<string, unknown>) =>
      http.parseJson(
        await http.request('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      ),
    authLogout: async (refreshToken?: string) =>
      http.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    catalog: async () => http.parseJson(await http.request('/mcp/catalog')),
    installations: async (workspaceId: string) =>
      http.parseJson(await http.request(`/mcp/workspaces/${workspaceId}/installations`)),
  }
}

export type BffApi = ReturnType<typeof createBffApi>
export { ApiError }
