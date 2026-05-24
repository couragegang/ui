import { createBffApi, type BffApi } from '@couragegang/api-client'
import type { AuthStorage } from './storage'

export type CreateBffApiOptions = {
  baseUrl: string
  storage: AuthStorage
  fetchImpl?: typeof fetch
  /** По умолчанию очищает storage при невалидной сессии. */
  onAuthFailed?: () => void
}

export function createBffApiFromStorage({
  baseUrl,
  storage,
  fetchImpl,
  onAuthFailed,
}: CreateBffApiOptions): BffApi {
  return createBffApi({
    baseUrl,
    fetchImpl,
    getAccessToken: () => storage.getAccessToken(),
    getRefreshToken: () => storage.getRefreshToken(),
    getWorkspaceId: () => storage.getWorkspaceId(),
    onTokensRefreshed: ({ accessToken, refreshToken }) => {
      storage.setTokens(accessToken, refreshToken)
    },
    onAuthFailed: () => {
      if (onAuthFailed) {
        onAuthFailed()
        return
      }
      storage.clearAuth()
    },
  })
}
