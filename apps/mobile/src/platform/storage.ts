import * as SecureStore from 'expo-secure-store'
import type { AuthStorage } from '@couragegang/shared/auth'

const ACCESS = 'cg.accessToken'
const REFRESH = 'cg.refreshToken'
const WORKSPACE = 'cg.workspaceId'

const cache = {
  access: null as string | null,
  refresh: null as string | null,
  workspace: null as string | null,
  hydrated: false,
}

export async function hydrateAuthStorage(): Promise<void> {
  if (cache.hydrated) return
  cache.access = await SecureStore.getItemAsync(ACCESS)
  cache.refresh = await SecureStore.getItemAsync(REFRESH)
  cache.workspace = await SecureStore.getItemAsync(WORKSPACE)
  cache.hydrated = true
}

export const authStorage: AuthStorage = {
  getAccessToken: () => cache.access,
  getRefreshToken: () => cache.refresh,
  setTokens(access, refresh) {
    cache.access = access
    if (refresh) cache.refresh = refresh
    void SecureStore.setItemAsync(ACCESS, access)
    if (refresh) void SecureStore.setItemAsync(REFRESH, refresh)
  },
  clearAuth() {
    cache.access = null
    cache.refresh = null
    cache.workspace = null
    void SecureStore.deleteItemAsync(ACCESS)
    void SecureStore.deleteItemAsync(REFRESH)
    void SecureStore.deleteItemAsync(WORKSPACE)
  },
  getWorkspaceId: () => cache.workspace,
  setWorkspaceId(id) {
    cache.workspace = id
    if (id) void SecureStore.setItemAsync(WORKSPACE, id)
    else void SecureStore.deleteItemAsync(WORKSPACE)
  },
}
