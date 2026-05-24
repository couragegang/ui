const STORAGE_PREFIX = 'chat:lastActive:'

function storageKey(workspaceId: string): string {
  return `${STORAGE_PREFIX}${workspaceId}`
}

export function getLastActiveChatId(workspaceId: string): string | null {
  try {
    return localStorage.getItem(storageKey(workspaceId))
  } catch {
    return null
  }
}

export function setLastActiveChatId(workspaceId: string, conversationId: string): void {
  try {
    localStorage.setItem(storageKey(workspaceId), conversationId)
  } catch {
    // ignore quota / private mode
  }
}

export function clearLastActiveChatId(workspaceId: string): void {
  try {
    localStorage.removeItem(storageKey(workspaceId))
  } catch {
    // ignore
  }
}

/** Последний открытый чат из localStorage, иначе самый новый по createdAt (fallback: updatedAt). */
export function resolveInitialChatId(
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
