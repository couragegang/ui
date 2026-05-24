import { createContext, useContext, type ReactNode } from 'react'
import { useAuthSession } from '@couragegang/shared/hooks'
import { bffApi } from '../platform/bff'
import { authStorage } from '../platform/storage'

const AuthContext = createContext<ReturnType<typeof useAuthSession> | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useAuthSession({ storage: authStorage, api: bffApi })
  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
