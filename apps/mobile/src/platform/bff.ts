import { createBffApiFromStorage } from '@couragegang/shared/auth'
import { authStorage } from './storage'

const baseUrl = process.env.EXPO_PUBLIC_API_BASE ?? 'https://ai-test.valoriel.ru/api'

export const bffApi = createBffApiFromStorage({
  baseUrl,
  storage: authStorage,
})
