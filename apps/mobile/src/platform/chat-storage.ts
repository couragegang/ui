import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

import { createChatStorage } from '@couragegang/shared/chat-storage'
import { createLocalStorageAdapter, type KeyValueStorage } from '@couragegang/shared'

const mem = new Map<string, string>()

const secureKv: KeyValueStorage = {
  getItem(key) {
    return mem.get(key) ?? null
  },
  setItem(key, value) {
    mem.set(key, value)
    void SecureStore.setItemAsync(key, value)
  },
  removeItem(key) {
    mem.delete(key)
    void SecureStore.deleteItemAsync(key)
  },
}

const kv: KeyValueStorage =
  Platform.OS === 'web' ? createLocalStorageAdapter() : secureKv

export const chatStorage = createChatStorage(kv)

export async function hydrateChatStorage(): Promise<void> {
  if (Platform.OS === 'web') return
  // SecureStore has no listKeys — chat ids restored on first set per workspace
}
