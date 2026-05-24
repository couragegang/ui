import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BffApi } from '@couragegang/api-client'
import type { AuthStorage } from '../auth/storage'
import type { AuthTokens, BffMe, Workspace } from '../types'

export type AuthSessionConfig = {
  storage: AuthStorage
  api: BffApi
  /** false — не дергать /me до готовности storage (mobile SecureStore) */
  enabled?: boolean
}

export function useAuthSession({ storage, api, enabled = true }: AuthSessionConfig) {
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<BffMe | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!storage.getAccessToken()) {
      setMe(null)
      setWorkspaces([])
      setWorkspaceIdState(null)
      return
    }
    const profile = (await api.me()) as BffMe
    setMe(profile)
    let list: Workspace[] = []
    let ws = storage.getWorkspaceId() ?? profile.workspaceId ?? null
    if (profile.orgId) {
      const res = (await api.workspaces(profile.orgId)) as { items?: Workspace[] }
      list = res.items ?? []
      if (!ws && list[0]) ws = list[0].id
    }
    if (ws) storage.setWorkspaceId(ws)
    setWorkspaces(list)
    setWorkspaceIdState(ws)
  }, [api, storage])

  useEffect(() => {
    if (!enabled) {
      setLoading(true)
      return
    }
    refresh()
      .catch(() => {
        storage.clearAuth()
        setMe(null)
      })
      .finally(() => setLoading(false))
  }, [enabled, refresh, storage])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = (await api.authLogin(email, password)) as AuthTokens
      storage.setTokens(data.accessToken, data.refreshToken)
      await refresh()
    },
    [api, refresh, storage],
  )

  const register = useCallback(
    async (payload: {
      email: string
      password: string
      displayName: string
      organizationName?: string
    }) => {
      const data = (await api.authRegister(payload)) as AuthTokens
      storage.setTokens(data.accessToken, data.refreshToken)
      await refresh()
    },
    [api, refresh, storage],
  )

  const logout = useCallback(async () => {
    try {
      const rt = storage.getRefreshToken()
      if (rt) await api.authLogout(rt)
    } finally {
      storage.clearAuth()
      setMe(null)
      setWorkspaces([])
      setWorkspaceIdState(null)
    }
  }, [api, storage])

  const setWorkspaceId = useCallback(
    (id: string) => {
      storage.setWorkspaceId(id)
      setWorkspaceIdState(id)
    },
    [storage],
  )

  return useMemo(
    () => ({
      loading,
      me,
      workspaces,
      workspaceId,
      login,
      register,
      logout,
      setWorkspaceId,
      refresh,
    }),
    [
      loading,
      me,
      workspaces,
      workspaceId,
      login,
      register,
      logout,
      setWorkspaceId,
      refresh,
    ],
  )
}
