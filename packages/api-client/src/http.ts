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

export type AuthTokensPayload = {
  accessToken: string
  refreshToken?: string
}

export type HttpClientConfig = {
  /** Базовый URL без завершающего слэша, напр. `/api` (web) или `https://api.example/v1/bff` */
  baseUrl: string
  getAccessToken?: TokenProvider
  getRefreshToken?: TokenProvider
  getWorkspaceId?: WorkspaceIdProvider
  /** Вызывается после успешного POST /auth/refresh (ротация refresh). */
  onTokensRefreshed?: (tokens: AuthTokensPayload) => void
  /** Refresh не удался или нет refresh-токена — сессия недействительна. */
  onAuthFailed?: () => void
  fetchImpl?: typeof fetch
}

const AUTH_PATHS_NO_RETRY = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
])

function normalizePath(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return p.split('?')[0] ?? p
}

function isAuthPathWithoutRetry(path: string): boolean {
  const p = normalizePath(path)
  return AUTH_PATHS_NO_RETRY.has(p)
}

/** Один inflight refresh на все параллельные 401. */
let sharedRefreshPromise: Promise<boolean> | null = null

export function createHttpClient(config: HttpClientConfig) {
  const base = config.baseUrl.replace(/\/$/, '')
  const fetchImpl = config.fetchImpl ?? fetch

  async function refreshAccessToken(): Promise<boolean> {
    if (sharedRefreshPromise) return sharedRefreshPromise

    sharedRefreshPromise = (async () => {
      const refreshToken = config.getRefreshToken?.()
      if (!refreshToken) return false

      try {
        const res = await fetchImpl(`${base}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!res.ok) return false

        const text = await res.text()
        if (!text) return false

        const data = JSON.parse(text) as AuthTokensPayload
        if (!data.accessToken) return false

        config.onTokensRefreshed?.({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? refreshToken,
        })
        return true
      } catch {
        return false
      } finally {
        sharedRefreshPromise = null
      }
    })()

    return sharedRefreshPromise
  }

  async function request(path: string, init?: RequestInit, retried = false): Promise<Response> {
    const normalized = path.startsWith('/') ? path : `/${path}`
    const headers = new Headers(init?.headers)
    if (!headers.has('Content-Type') && init?.body) {
      headers.set('Content-Type', 'application/json')
    }
    const token = config.getAccessToken?.()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const ws = config.getWorkspaceId?.()
    if (ws) headers.set('X-Workspace-Id', ws)

    const res = await fetchImpl(`${base}${normalized}`, { ...init, headers })

    if (
      res.status === 401 &&
      !retried &&
      !isAuthPathWithoutRetry(normalized) &&
      config.getRefreshToken
    ) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        return request(path, init, true)
      }
      config.onAuthFailed?.()
    }

    return res
  }

  async function parseJson<T>(res: Response): Promise<T> {
    const text = await res.text()
    if (!res.ok) {
      throw new ApiError(text || res.statusText, res.status, text)
    }
    if (!text) return {} as T
    return JSON.parse(text) as T
  }

  return { request, parseJson, refreshAccessToken }
}

export type HttpClient = ReturnType<typeof createHttpClient>

function resolveApiPath(requestUrl: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '')
  try {
    const url = new URL(requestUrl)
    if (base.startsWith('http')) {
      const baseRef = new URL(base)
      if (url.origin === baseRef.origin && url.pathname.startsWith(baseRef.pathname)) {
        const rest = url.pathname.slice(baseRef.pathname.length)
        return rest.startsWith('/') ? rest : `/${rest}`
      }
    }
    if (url.pathname.startsWith(base)) {
      const rest = url.pathname.slice(base.length)
      return rest.startsWith('/') ? rest : `/${rest}`
    }
    return url.pathname
  } catch {
    if (requestUrl.startsWith(base)) {
      const rest = requestUrl.slice(base.length)
      return rest.startsWith('/') ? rest : `/${rest}`
    }
    return requestUrl.startsWith('/') ? requestUrl : `/${requestUrl}`
  }
}

/** Fetch-обёртка для openapi-fetch с тем же refresh-on-401. */
export function createAuthenticatedFetch(config: HttpClientConfig): typeof fetch {
  const http = createHttpClient(config)
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(input, init)
    const path = resolveApiPath(req.url, config.baseUrl)
    return http.request(path, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      signal: req.signal,
      credentials: req.credentials,
      cache: req.cache,
      redirect: req.redirect,
    })
  }
}
