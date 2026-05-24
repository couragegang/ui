/** Платформо-независимое хранилище токенов (web: localStorage, mobile: SecureStore). */
export type AuthStorage = {
  getAccessToken(): string | null
  getRefreshToken(): string | null
  setTokens(accessToken: string, refreshToken?: string): void
  clearAuth(): void
  getWorkspaceId(): string | null
  setWorkspaceId(id: string | null): void
}

const ACCESS = 'cg.accessToken'
const REFRESH = 'cg.refreshToken'
const WORKSPACE = 'cg.workspaceId'

/** Web (localStorage) — подключайте в apps/web. */
export function createWebAuthStorage(storage: Storage = localStorage): AuthStorage {
  return {
    getAccessToken: () => storage.getItem(ACCESS),
    getRefreshToken: () => storage.getItem(REFRESH),
    setTokens(access, refresh) {
      storage.setItem(ACCESS, access)
      if (refresh) storage.setItem(REFRESH, refresh)
    },
    clearAuth() {
      storage.removeItem(ACCESS)
      storage.removeItem(REFRESH)
      storage.removeItem(WORKSPACE)
    },
    getWorkspaceId: () => storage.getItem(WORKSPACE),
    setWorkspaceId(id) {
      if (id) storage.setItem(WORKSPACE, id)
      else storage.removeItem(WORKSPACE)
    },
  }
}
