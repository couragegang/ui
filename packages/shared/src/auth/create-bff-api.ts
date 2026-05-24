import { createBffApi, type BffApi } from '@couragegang/api-client'
import type { AuthStorage } from './storage'

export type CreateBffApiOptions = {
  baseUrl: string
  storage: AuthStorage
  fetchImpl?: typeof fetch
}

export function createBffApiFromStorage({
  baseUrl,
  storage,
  fetchImpl,
}: CreateBffApiOptions): BffApi {
  return createBffApi({
    baseUrl,
    fetchImpl,
    getAccessToken: () => storage.getAccessToken(),
    getWorkspaceId: () => storage.getWorkspaceId(),
  })
}
