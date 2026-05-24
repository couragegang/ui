export class ApiError extends Error {
  readonly status: number
  readonly body?: string

  constructor(message: string, status: number, body?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export type TokenProvider = () => string | null | undefined
export type WorkspaceIdProvider = () => string | null | undefined

export type HttpClientConfig = {
  /** Базовый URL без завершающего слэша, напр. `/api` (web) или `https://api.example/v1/bff` */
  baseUrl: string
  getAccessToken?: TokenProvider
  getWorkspaceId?: WorkspaceIdProvider
  fetchImpl?: typeof fetch
}

export function createHttpClient(config: HttpClientConfig) {
  const base = config.baseUrl.replace(/\/$/, '')
  const fetchImpl = config.fetchImpl ?? fetch

  async function request(path: string, init?: RequestInit): Promise<Response> {
    const normalized = path.startsWith('/') ? path : `/${path}`
    const headers = new Headers(init?.headers)
    if (!headers.has('Content-Type') && init?.body) {
      headers.set('Content-Type', 'application/json')
    }
    const token = config.getAccessToken?.()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const ws = config.getWorkspaceId?.()
    if (ws) headers.set('X-Workspace-Id', ws)
    return fetchImpl(`${base}${normalized}`, { ...init, headers })
  }

  async function parseJson<T>(res: Response): Promise<T> {
    const text = await res.text()
    if (!res.ok) {
      throw new ApiError(text || res.statusText, res.status, text)
    }
    if (!text) return {} as T
    return JSON.parse(text) as T
  }

  return { request, parseJson }
}

export type HttpClient = ReturnType<typeof createHttpClient>
