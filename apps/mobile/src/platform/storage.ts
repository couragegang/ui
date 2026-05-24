import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { createWebAuthStorage, type AuthStorage } from '@couragegang/shared/auth'

const ACCESS = 'cg.accessToken'
const REFRESH = 'cg.refreshToken'
const WORKSPACE = 'cg.workspaceId'
const GROUP = 'cg.groupId'

const cache = {
  access: null as string | null,
  refresh: null as string | null,
  workspace: null as string | null,
  group: null as string | null,
  hydrated: false,
}

const nativeAuthStorage: AuthStorage = {
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
    cache.group = null
    void SecureStore.deleteItemAsync(ACCESS)
    void SecureStore.deleteItemAsync(REFRESH)
    void SecureStore.deleteItemAsync(WORKSPACE)
    void SecureStore.deleteItemAsync(GROUP)
  },
  getWorkspaceId: () => cache.workspace,
  setWorkspaceId(id) {
    cache.workspace = id
    if (id) void SecureStore.setItemAsync(WORKSPACE, id)
    else void SecureStore.deleteItemAsync(WORKSPACE)
  },
  getGroupId: () => cache.group,
  setGroupId(id) {
    cache.group = id
    if (id) void SecureStore.setItemAsync(GROUP, id)
    else void SecureStore.deleteItemAsync(GROUP)
  },
}

/** Native: SecureStore; web (Expo): localStorage — SecureStore API недоступен в браузере. */
export const authStorage: AuthStorage =
  Platform.OS === 'web' ? createWebAuthStorage() : nativeAuthStorage

export async function hydrateAuthStorage(): Promise<void> {
  if (Platform.OS === 'web') return
  if (cache.hydrated) return
  cache.access = await SecureStore.getItemAsync(ACCESS)
  cache.refresh = await SecureStore.getItemAsync(REFRESH)
  cache.workspace = await SecureStore.getItemAsync(WORKSPACE)
  cache.group = await SecureStore.getItemAsync(GROUP)
  cache.hydrated = true
}
