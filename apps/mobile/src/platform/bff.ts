import Constants from 'expo-constants'
import { createBffApiFromStorage } from '@couragegang/shared/auth'
import { authStorage } from './storage'

function resolveApiBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const fromExtra = (Constants.expoConfig?.extra as { apiBase?: string } | undefined)?.apiBase?.replace(
    /\/$/,
    '',
  )
  if (fromExtra) return fromExtra
  return 'https://ai-test.valoriel.ru/api'
}

const baseUrl = resolveApiBase()

export const bffApi = createBffApiFromStorage({
  baseUrl,
  storage: authStorage,
})
