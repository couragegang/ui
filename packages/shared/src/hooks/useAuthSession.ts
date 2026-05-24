import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ApiError, type BffApi } from '@couragegang/api-client'

import type { AuthStorage } from '../auth/storage'

import type { AuthTokens, BffMe, IamMeOrgSummary, OrganizationGroup, Workspace } from '../types'

import { pickDefaultGroupId } from '../group'

import { pickDefaultWorkspaceId } from '../workspace'



export type AuthSessionConfig = {

  storage: AuthStorage

  api: BffApi

  /** false — не дергать /me до готовности storage (mobile SecureStore) */

  enabled?: boolean

}



/** Схлопывает повторные refresh (React StrictMode, mount + register). */

const SESSION_CACHE_MS = 3000

let sessionCache: { accessToken: string; loadedAt: number; promise: Promise<void> } | null = null



function clearSessionCache() {

  sessionCache = null

}



async function applyProfile(

  profile: BffMe,

  storage: AuthStorage,

  api: BffApi,

): Promise<{
  groupList: OrganizationGroup[]
  gid: string | null
  list: Workspace[]
  ws: string | null
}> {

  let groupList: OrganizationGroup[] = []

  let gid = storage.getGroupId()

  let list: Workspace[] = []

  const storedWs = storage.getWorkspaceId()

  const isFirstWorkspacePick = storedWs == null



  if (profile.orgId) {

    try {

      const gRes = (await api.myGroups(profile.orgId)) as { items?: OrganizationGroup[] }

      groupList = gRes.items ?? []

      gid = pickDefaultGroupId(groupList, gid)

    } catch {

      groupList = []

      gid = null

    }



    const wsRes = (await api.workspaces(profile.orgId, gid ?? undefined)) as {

      items?: Workspace[]

    }

    list = wsRes.items ?? []

  } else {

    gid = null

  }



  const ws =

    profile.orgId && list.length > 0

      ? pickDefaultWorkspaceId(

          list,

          isFirstWorkspacePick ? profile.workspaceId ?? null : storedWs,

          isFirstWorkspacePick,

        )

      : null



  storage.setGroupId(gid)

  storage.setWorkspaceId(ws)

  return { groupList, gid, list, ws }

}



export function useAuthSession({ storage, api, enabled = true }: AuthSessionConfig) {

  const [loading, setLoading] = useState(true)

  const [me, setMe] = useState<BffMe | null>(null)

  const [organizations, setOrganizations] = useState<IamMeOrgSummary[]>([])

  const [groups, setGroups] = useState<OrganizationGroup[]>([])

  const [groupId, setGroupIdState] = useState<string | null>(null)

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])

  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null)

  const [userDisplayName, setUserDisplayName] = useState<string | null>(null)

  const [userEmail, setUserEmail] = useState<string | null>(null)

  const applyRef = useRef(applyProfile)



  applyRef.current = applyProfile



  const refresh = useCallback(async () => {

    const accessToken = storage.getAccessToken()

    if (!accessToken) {

      clearSessionCache()

      setMe(null)

      setOrganizations([])

      setGroups([])

      setGroupIdState(null)

      setWorkspaces([])

      setWorkspaceIdState(null)

      setUserDisplayName(null)

      setUserEmail(null)

      return

    }



    const now = Date.now()

    if (

      sessionCache &&

      sessionCache.accessToken === accessToken &&

      now - sessionCache.loadedAt < SESSION_CACHE_MS

    ) {

      return sessionCache.promise

    }



    const promise = (async () => {

      let profile = (await api.me()) as BffMe

      const orgList = profile.organizations ?? []



      if (!profile.orgId && orgList.length > 0) {

        const switched = (await api.switchOrg(orgList[0].orgId)) as AuthTokens

        storage.setTokens(switched.accessToken, switched.refreshToken)

        clearSessionCache()

        profile = (await api.me()) as BffMe

      }



      setMe(profile)

      setUserDisplayName(profile.user?.displayName ?? null)

      setUserEmail(profile.user?.email ?? null)

      setOrganizations(profile.organizations ?? orgList)



      const { groupList, gid, list, ws } = await applyRef.current(profile, storage, api)

      setGroups(groupList)

      setGroupIdState(gid)

      setWorkspaces(list)

      setWorkspaceIdState(ws)

    })()



    sessionCache = { accessToken, loadedAt: now, promise }

    await promise

  }, [api, storage])



  useEffect(() => {

    if (!enabled) {

      setLoading(true)

      return

    }

    let cancelled = false

    refresh()

      .catch((err) => {

        if (cancelled) return

        if (err instanceof ApiError && err.status === 401) {

          storage.clearAuth()

          setMe(null)

        }

      })

      .finally(() => {

        if (!cancelled) setLoading(false)

      })

    return () => {

      cancelled = true

    }

  }, [enabled, refresh, storage])



  const login = useCallback(

    async (email: string, password: string) => {

      const data = (await api.authLogin(email, password)) as AuthTokens

      clearSessionCache()

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

      clearSessionCache()

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

      clearSessionCache()

      storage.clearAuth()

      setMe(null)

      setOrganizations([])

      setGroups([])

      setGroupIdState(null)

      setWorkspaces([])

      setWorkspaceIdState(null)

      setUserDisplayName(null)

      setUserEmail(null)

    }

  }, [api, storage])



  const switchOrganization = useCallback(

    async (orgId: string) => {

      const data = (await api.switchOrg(orgId)) as AuthTokens

      clearSessionCache()

      storage.setTokens(data.accessToken, data.refreshToken)

      storage.setGroupId(null)

      storage.setWorkspaceId(null)

      await refresh()

    },

    [api, refresh, storage],

  )



  const setGroupId = useCallback(

    async (id: string) => {

      storage.setGroupId(id)

      storage.setWorkspaceId(null)

      setGroupIdState(id)

      const orgId = me?.orgId

      if (!orgId) return

      const wsRes = (await api.workspaces(orgId, id)) as { items?: Workspace[] }

      const list = wsRes.items ?? []

      const ws = pickDefaultWorkspaceId(list, null, true)

      storage.setWorkspaceId(ws)

      setWorkspaces(list)

      setWorkspaceIdState(ws)

    },

    [api, me?.orgId, storage],

  )



  const setWorkspaceId = useCallback(

    (id: string) => {

      storage.setWorkspaceId(id)

      setWorkspaceIdState(id)

    },

    [storage],

  )



  const orgLabel = useMemo(() => {

    const orgId = me?.orgId

    if (!orgId) return null

    return organizations.find((o) => o.orgId === orgId)?.name ?? orgId

  }, [me?.orgId, organizations])



  const groupLabel = useMemo(() => {

    if (!groupId) return null

    return groups.find((g) => g.id === groupId)?.name ?? groupId

  }, [groupId, groups])



  return useMemo(

    () => ({

      loading,

      me,

      organizations,

      orgLabel,

      groups,

      groupId,

      groupLabel,

      userDisplayName,

      userEmail,

      workspaces,

      workspaceId,

      login,

      register,

      logout,

      switchOrganization,

      setGroupId,

      setWorkspaceId,

      refresh: async () => {

        clearSessionCache()

        await refresh()

      },

    }),

    [

      loading,

      me,

      organizations,

      orgLabel,

      groups,

      groupId,

      groupLabel,

      userDisplayName,

      userEmail,

      workspaces,

      workspaceId,

      login,

      register,

      logout,

      switchOrganization,

      setGroupId,

      setWorkspaceId,

      refresh,

    ],

  )

}

