import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

import { CHAT_LAST_ACTIVE_PREFIX, createChatStorage } from '@couragegang/shared/chat-storage'
import { createLocalStorageAdapter, type KeyValueStorage } from '@couragegang/shared'

const MANIFEST_KEY = 'cg.chat.lastActive'
const mem = new Map<string, string>()

/** SecureStore допускает только [a-zA-Z0-9._-] в ключах. */
function toSecureStoreKey(key: string): string {
  const sanitized = key.replace(/[^a-zA-Z0-9._-]/g, '_')
  if (!sanitized) {
    throw new Error('SecureStore key is empty after sanitization')
  }
  return sanitized
}

let manifest: Record<string, string> = {}

async function persistManifest(): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      toSecureStoreKey(MANIFEST_KEY),
      JSON.stringify(manifest),
    )
  } catch {
    // quota / device lock — не роняем UI
  }
}

const secureKv: KeyValueStorage = {
  getItem(key) {
    return mem.get(key) ?? null
  },
  setItem(key, value) {
    mem.set(key, value)
    if (key.startsWith(CHAT_LAST_ACTIVE_PREFIX)) {
      const workspaceId = key.slice(CHAT_LAST_ACTIVE_PREFIX.length)
      if (workspaceId) {
        manifest[workspaceId] = value
        void persistManifest()
      }
    }
  },
  removeItem(key) {
    mem.delete(key)
    if (key.startsWith(CHAT_LAST_ACTIVE_PREFIX)) {
      const workspaceId = key.slice(CHAT_LAST_ACTIVE_PREFIX.length)
      if (workspaceId) {
        delete manifest[workspaceId]
        void persistManifest()
      }
    }
  },
}

const kv: KeyValueStorage =
  Platform.OS === 'web' ? createLocalStorageAdapter() : secureKv

export const chatStorage = createChatStorage(kv)

/** Восстанавливает last-active чаты из SecureStore (один JSON-manifest). */
export async function hydrateChatStorage(): Promise<void> {
  if (Platform.OS === 'web') return
  try {
    const raw = await SecureStore.getItemAsync(toSecureStoreKey(MANIFEST_KEY))
    manifest = raw ? (JSON.parse(raw) as Record<string, string>) : {}
    for (const [workspaceId, conversationId] of Object.entries(manifest)) {
      mem.set(`${CHAT_LAST_ACTIVE_PREFIX}${workspaceId}`, conversationId)
    }
  } catch {
    manifest = {}
  }
}
