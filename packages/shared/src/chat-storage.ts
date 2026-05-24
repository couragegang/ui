import type { KeyValueStorage } from './kv-storage'

/** Префикс ключей last-active чата в KV (mobile manifest, web localStorage). */
export const CHAT_LAST_ACTIVE_PREFIX = 'chat:lastActive:'

const STORAGE_PREFIX = CHAT_LAST_ACTIVE_PREFIX

function storageKey(workspaceId: string): string {
  return `${STORAGE_PREFIX}${workspaceId}`
}

export function createChatStorage(kv: KeyValueStorage) {
  function getLastActiveChatId(workspaceId: string): string | null {
    try {
      return kv.getItem(storageKey(workspaceId))
    } catch {
      return null
    }
  }

  function setLastActiveChatId(workspaceId: string, conversationId: string): void {
    try {
      kv.setItem(storageKey(workspaceId), conversationId)
    } catch {
      // ignore quota / private mode
    }
  }

  function clearLastActiveChatId(workspaceId: string): void {
    try {
      kv.removeItem(storageKey(workspaceId))
    } catch {
      // ignore
    }
  }

  /** Без `this` — метод безопасен при деструктуризации импорта. */
  function resolveInitialChatId(
    workspaceId: string,
    conversations: { id: string; createdAt?: string; updatedAt?: string }[],
  ): string | null {
    if (conversations.length === 0) return null

    const stored = getLastActiveChatId(workspaceId)
    if (stored && conversations.some((c) => c.id === stored)) {
      return stored
    }

    const sorted = [...conversations].sort((a, b) => {
      const aTs = Date.parse(a.createdAt ?? a.updatedAt ?? '') || 0
      const bTs = Date.parse(b.createdAt ?? b.updatedAt ?? '') || 0
      return bTs - aTs
    })
    return sorted[0]?.id ?? null
  }

  return {
    getLastActiveChatId,
    setLastActiveChatId,
    clearLastActiveChatId,
    resolveInitialChatId,
  }
}

export type ChatStorage = ReturnType<typeof createChatStorage>
