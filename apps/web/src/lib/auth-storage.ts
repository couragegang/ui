/** @deprecated Используйте `../platform/storage` (authStorage). */
import { authStorage } from '../platform/storage'

export const getAccessToken = () => authStorage.getAccessToken()
export const getRefreshToken = () => authStorage.getRefreshToken()
export const setTokens = (access: string, refresh?: string) =>
  authStorage.setTokens(access, refresh)
export const clearAuth = () => authStorage.clearAuth()
export const getStoredWorkspaceId = () => authStorage.getWorkspaceId()
export const setStoredWorkspaceId = (id: string | null) => authStorage.setWorkspaceId(id)
