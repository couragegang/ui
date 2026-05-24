import { createBffApiFromStorage } from '@couragegang/shared/auth'
import { authStorage } from './storage'

const baseUrl =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '/api'

export const bffApi = createBffApiFromStorage({
  baseUrl,
  storage: authStorage,
})
