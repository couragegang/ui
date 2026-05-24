export type OidcProvider = 'google' | 'github'

/** Полный URL страницы SPA после успешного OIDC (query `redirect_after` для IAM). */
export function buildRedirectAfter(returnPath: string, origin: string): string {
  const path = returnPath.startsWith('/') ? returnPath : `/${returnPath}`
  const base = origin.replace(/\/$/, '')
  return `${base}${path}`
}

/** Origin приложения из API base (`https://host/api` → `https://host`). */
export function resolveAppOrigin(apiBaseUrl: string): string {
  const trimmed = apiBaseUrl.replace(/\/$/, '')
  if (trimmed.endsWith('/api')) return trimmed.slice(0, -4)
  return trimmed
}

export function buildOauthStartUrl(
  provider: OidcProvider,
  redirectAfter: string,
  apiBaseUrl = '/api',
): string {
  const base = apiBaseUrl.replace(/\/$/, '')
  const start = `${base}/auth/oidc/${provider}/start`
  return `${start}?redirect_after=${encodeURIComponent(redirectAfter)}`
}

export type OidcFragmentTokens = {
  accessToken: string
  refreshToken?: string
}

export function parseOidcFragment(hash: string): OidcFragmentTokens | null {
  if (!hash || hash === '#') return null
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(raw)
  const accessToken = params.get('access_token')
  if (!accessToken) return null
  const refreshToken = params.get('refresh_token')
  return { accessToken, refreshToken: refreshToken ?? undefined }
}
