import createClient from 'openapi-fetch'

import type { paths } from './generated/bff-schema'

import {
  ApiError,
  createAuthenticatedFetch,
  createHttpClient,
  type AuthTokensPayload,
  type HttpClientConfig,
} from './http'



/** Typed client для путей из OpenAPI BFF (расширяйте spec в api-contracts). */

export function createBffOpenApiClient(config: HttpClientConfig) {
  const base = config.baseUrl.replace(/\/$/, '')
  const fetchImpl = createAuthenticatedFetch(config)

  return createClient<paths>({
    baseUrl: base,
    fetch: fetchImpl,
  })
}



/**

 * Ручные методы BFF. Все пути — только /api/* (прокси на BFF, без /iam/ в URL).

 */

export function createBffApi(config: HttpClientConfig) {

  const http = createHttpClient(config)



  return {

    http,

    /** Сессия: JWT-контекст + user + organizations (один запрос). */

    me: async () => http.parseJson(await http.request('/me')),

    patchMe: async (body: Record<string, unknown>) =>

      http.parseJson(

        await http.request('/me', { method: 'PATCH', body: JSON.stringify(body) }),

      ),

    workspaces: async (orgId: string, groupId?: string) => {

      const q = groupId ? `?group_id=${encodeURIComponent(groupId)}` : ''

      return http.parseJson(await http.request(`/config/orgs/${orgId}/workspaces${q}`))

    },

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

    authRefresh: async (refreshToken: string) =>
      http.parseJson<AuthTokensPayload>(
        await http.request('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        }),
      ),

    switchOrg: async (orgId: string) =>

      http.parseJson(

        await http.request('/auth/switch-org', {

          method: 'POST',

          body: JSON.stringify({ orgId }),

        }),

      ),

    createOrganization: async (body: Record<string, unknown>) =>

      http.parseJson(

        await http.request('/organizations', {

          method: 'POST',

          body: JSON.stringify(body),

        }),

      ),

    getOrganization: async (orgId: string) =>

      http.parseJson(await http.request(`/organizations/${orgId}`)),

    patchOrganization: async (orgId: string, body: Record<string, unknown>) =>

      http.parseJson(

        await http.request(`/organizations/${orgId}`, {

          method: 'PATCH',

          body: JSON.stringify(body),

        }),

      ),

    myGroups: async (orgId: string) =>

      http.parseJson(await http.request(`/organizations/${orgId}/my-groups`)),

    listGroups: async (orgId: string) =>

      http.parseJson(await http.request(`/organizations/${orgId}/groups`)),

    createGroup: async (orgId: string, body: Record<string, unknown>) =>

      http.parseJson(

        await http.request(`/organizations/${orgId}/groups`, {

          method: 'POST',

          body: JSON.stringify(body),

        }),

      ),

    listInvites: async (orgId: string) =>

      http.parseJson(await http.request(`/organizations/${orgId}/invites`)),

    createInvite: async (orgId: string, body: Record<string, unknown>) =>

      http.parseJson(

        await http.request(`/organizations/${orgId}/invites`, {

          method: 'POST',

          body: JSON.stringify(body),

        }),

      ),

    revokeInvite: async (orgId: string, inviteId: string) =>

      http.request(`/organizations/${orgId}/invites/${inviteId}`, { method: 'DELETE' }),

    acceptInvite: async (body: { orgId: string; token: string }) =>

      http.parseJson(

        await http.request('/invites/accept', {

          method: 'POST',

          body: JSON.stringify(body),

        }),

      ),

    chat: async (body: Record<string, unknown>) =>

      http.parseJson(

        await http.request('/chat', { method: 'POST', body: JSON.stringify(body) }),

      ),

    catalog: async () => http.parseJson(await http.request('/mcp/catalog')),

    catalogItem: async (connectorKey: string) =>

      http.parseJson(await http.request(`/mcp/catalog/${encodeURIComponent(connectorKey)}`)),

    installations: async (workspaceId: string) =>

      http.parseJson(await http.request(`/mcp/workspaces/${workspaceId}/installations`)),

    installMcp: async (workspaceId: string, body: Record<string, unknown>) =>

      http.parseJson(

        await http.request(`/mcp/workspaces/${workspaceId}/installations`, {

          method: 'POST',

          body: JSON.stringify(body),

        }),

      ),

    getInstallation: async (workspaceId: string, installationId: string) =>

      http.parseJson(

        await http.request(`/mcp/workspaces/${workspaceId}/installations/${installationId}`),

      ),

    updateInstallation: async (workspaceId: string, installationId: string, body: Record<string, unknown>) =>

      http.parseJson(

        await http.request(`/mcp/workspaces/${workspaceId}/installations/${installationId}`, {

          method: 'PATCH',

          body: JSON.stringify(body),

        }),

      ),

    deleteInstallation: async (workspaceId: string, installationId: string) =>

      http.request(`/mcp/workspaces/${workspaceId}/installations/${installationId}`, {

        method: 'DELETE',

      }),

    healthInstallation: async (workspaceId: string, installationId: string) =>

      http.parseJson(

        await http.request(`/mcp/workspaces/${workspaceId}/installations/${installationId}/health`, {

          method: 'POST',

          body: '{}',

        }),

      ),

    discoverNotion: async (workspaceId: string, integrationToken: string) =>

      http.parseJson(

        await http.request(`/mcp/workspaces/${workspaceId}/notion/discover`, {

          method: 'POST',

          body: JSON.stringify({ integrationToken }),

        }),

      ),

    discoverTrello: async (workspaceId: string, apiKey: string, token: string) =>

      http.parseJson(

        await http.request(`/mcp/workspaces/${workspaceId}/trello/discover`, {

          method: 'POST',

          body: JSON.stringify({ apiKey, token }),

        }),

      ),

    conversations: async (includeArchived = false) => {

      const q = includeArchived ? '?include_archived=true' : ''

      return http.parseJson(await http.request(`/conversations${q}`))

    },

    createConversation: async (title?: string) =>

      http.parseJson(

        await http.request('/conversations', {

          method: 'POST',

          body: JSON.stringify(title ? { title } : {}),

        }),

      ),

    conversationMessages: async (conversationId: string) =>

      http.parseJson(await http.request(`/conversations/${conversationId}/messages`)),

    archiveConversation: async (conversationId: string) =>

      http.parseJson(

        await http.request(`/conversations/${conversationId}`, {

          method: 'PATCH',

          body: JSON.stringify({ status: 'archived' }),

        }),

      ),

    deleteConversation: async (conversationId: string) =>

      http.request(`/conversations/${conversationId}`, { method: 'DELETE' }),

    createWorkspace: async (orgId: string, body: Record<string, unknown>) =>

      http.parseJson(

        await http.request(`/config/orgs/${orgId}/workspaces`, {

          method: 'POST',

          body: JSON.stringify(body),

        }),

      ),

    patchWorkspace: async (workspaceId: string, body: Record<string, unknown>) =>

      http.parseJson(

        await http.request(`/config/workspaces/${workspaceId}`, {

          method: 'PATCH',

          body: JSON.stringify(body),

        }),

      ),

    approvePending: async (id: string, decidedByUserId: string) =>
      http.parseJson(
        await http.request(`/policy/pending-approvals/${id}/approve`, {
          method: 'POST',
          body: JSON.stringify({ decidedByUserId }),
        }),
      ),

    rejectPending: async (id: string, decidedByUserId: string) =>
      http.parseJson(
        await http.request(`/policy/pending-approvals/${id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ decidedByUserId }),
        }),
      ),

    getPendingApproval: async (id: string) =>
      http.parseJson(
        await http.request(`/policy/pending-approvals/${id}`, {
          method: 'GET',
        }),
      ),

  }

}



export type BffApi = ReturnType<typeof createBffApi>

export { ApiError }


