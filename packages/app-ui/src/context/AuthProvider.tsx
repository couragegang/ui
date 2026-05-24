import { createContext, useContext, type ReactNode } from 'react'

import type { BffApi } from '@couragegang/api-client'
import type { AuthStorage } from '@couragegang/shared/auth'
import { useAuthSession } from '@couragegang/shared/hooks'

export type AuthContextValue = ReturnType<typeof useAuthSession>
export type { AuthSessionConfig } from '@couragegang/shared/hooks'

const AuthContext = createContext<AuthContextValue | null>(null)

export type AuthProviderProps = {
  storage: AuthStorage
  api: BffApi
  enabled?: boolean
  children: ReactNode
}

export function AuthProvider({ storage, api, enabled = true, children }: AuthProviderProps) {
  const value = useAuthSession({ storage, api, enabled })
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
