import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  authLogin,
  authLogout,
  authRegister,
  fetchMe,
  fetchWorkspaces,
} from '../lib/api'
import { getAccessToken, getStoredWorkspaceId, setStoredWorkspaceId } from '../lib/auth-storage'
import type { BffMe, Workspace } from '../lib/types'

type AuthState = {
  loading: boolean
  me: BffMe | null
  workspaces: Workspace[]
  workspaceId: string | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: {
    email: string
    password: string
    displayName: string
    organizationName?: string
  }) => Promise<void>
  logout: () => Promise<void>
  setWorkspaceId: (id: string) => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

async function loadSession(): Promise<{
  me: BffMe | null
  workspaces: Workspace[]
  workspaceId: string | null
}> {
  if (!getAccessToken()) return { me: null, workspaces: [], workspaceId: null }
  const me = await fetchMe()
  let workspaces: Workspace[] = []
  let workspaceId = getStoredWorkspaceId() ?? me.workspaceId ?? null
  if (me.orgId) {
    const list = await fetchWorkspaces(me.orgId)
    workspaces = list.items ?? []
    if (!workspaceId && workspaces[0]) workspaceId = workspaces[0].id
  }
  if (workspaceId) setStoredWorkspaceId(workspaceId)
  return { me, workspaces, workspaceId }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<BffMe | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const s = await loadSession()
      setMe(s.me)
      setWorkspaces(s.workspaces)
      setWorkspaceIdState(s.workspaceId)
    } catch {
      setMe(null)
      setWorkspaces([])
      setWorkspaceIdState(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(
    async (email: string, password: string) => {
      await authLogin(email, password)
      await refresh()
    },
    [refresh],
  )

  const register = useCallback(
    async (payload: {
      email: string
      password: string
      displayName: string
      organizationName?: string
    }) => {
      await authRegister(payload)
      await refresh()
    },
    [refresh],
  )

  const logout = useCallback(async () => {
    await authLogout()
    setMe(null)
    setWorkspaces([])
    setWorkspaceIdState(null)
  }, [])

  const setWorkspaceId = useCallback((id: string) => {
    setStoredWorkspaceId(id)
    setWorkspaceIdState(id)
  }, [])

  const value = useMemo(
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
    [loading, me, workspaces, workspaceId, login, register, logout, setWorkspaceId, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
