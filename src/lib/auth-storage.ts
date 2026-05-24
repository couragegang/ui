const ACCESS = 'cg.accessToken'
const REFRESH = 'cg.refreshToken'
const WORKSPACE = 'cg.workspaceId'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH)
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH, refreshToken)
}

export function clearAuth() {
  localStorage.removeItem(ACCESS)
  localStorage.removeItem(REFRESH)
  localStorage.removeItem(WORKSPACE)
}

export function getStoredWorkspaceId(): string | null {
  return localStorage.getItem(WORKSPACE)
}

export function setStoredWorkspaceId(id: string | null) {
  if (id) localStorage.setItem(WORKSPACE, id)
  else localStorage.removeItem(WORKSPACE)
}
