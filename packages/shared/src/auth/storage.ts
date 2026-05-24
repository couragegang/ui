/** Платформо-независимое хранилище токенов (web: localStorage, mobile: SecureStore). */
export type AuthStorage = {
  getAccessToken(): string | null
  getRefreshToken(): string | null
  setTokens(accessToken: string, refreshToken?: string): void
  clearAuth(): void
  getWorkspaceId(): string | null
  setWorkspaceId(id: string | null): void
  getGroupId(): string | null
  setGroupId(id: string | null): void
}

const ACCESS = 'cg.accessToken'
const REFRESH = 'cg.refreshToken'
const WORKSPACE = 'cg.workspaceId'
const GROUP = 'cg.groupId'

/** In-memory + sync persist hooks (mobile SecureStore). */
export function createPersistedAuthStorage(persist: {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}): AuthStorage {
  const cache = {
    access: persist.get(ACCESS),
    refresh: persist.get(REFRESH),
    workspace: persist.get(WORKSPACE),
    group: persist.get(GROUP),
  }
  return {
    getAccessToken: () => cache.access,
    getRefreshToken: () => cache.refresh,
    setTokens(access, refresh) {
      cache.access = access
      if (refresh) cache.refresh = refresh
      persist.set(ACCESS, access)
      if (refresh) persist.set(REFRESH, refresh)
    },
    clearAuth() {
      cache.access = null
      cache.refresh = null
      cache.workspace = null
      cache.group = null
      persist.remove(ACCESS)
      persist.remove(REFRESH)
      persist.remove(WORKSPACE)
      persist.remove(GROUP)
    },
    getWorkspaceId: () => cache.workspace,
    setWorkspaceId(id) {
      cache.workspace = id
      if (id) persist.set(WORKSPACE, id)
      else persist.remove(WORKSPACE)
    },
    getGroupId: () => cache.group,
    setGroupId(id) {
      cache.group = id
      if (id) persist.set(GROUP, id)
      else persist.remove(GROUP)
    },
  }
}

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
      storage.removeItem(GROUP)
    },
    getWorkspaceId: () => storage.getItem(WORKSPACE),
    setWorkspaceId(id) {
      if (id) storage.setItem(WORKSPACE, id)
      else storage.removeItem(WORKSPACE)
    },
    getGroupId: () => storage.getItem(GROUP),
    setGroupId(id) {
      if (id) storage.setItem(GROUP, id)
      else storage.removeItem(GROUP)
    },
  }
}
