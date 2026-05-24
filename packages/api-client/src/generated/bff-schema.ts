/**
 * Сгенерировано: pnpm generate:api
 * Источник: services/api-contracts/bff/openapi.yaml
 */
export interface paths {
  '/api/me': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['BffMeResponse']
          }
        }
      }
    }
  }
  '/api/chat': {
    post: {
      requestBody?: {
        content: {
          'application/json': Record<string, unknown>
        }
      }
      responses: {
        200: {
          content: {
            'application/json': Record<string, unknown>
          }
        }
      }
    }
  }
  '/api/config/orgs/{orgId}/workspaces': {
    get: {
      parameters: {
        path: { orgId: string }
        query?: { group_id?: string }
      }
      responses: {
        200: {
          content: {
            'application/json': { items?: components['schemas']['Workspace'][] }
          }
        }
      }
    }
  }
}

export interface components {
  schemas: {
    BffMeResponse: {
      userId?: string
      orgId?: string
      groupId?: string
      workspaceId?: string
      permissions?: string[]
    }
    Workspace: {
      id: string
      name?: string
      orgId?: string
    }
  }
}
