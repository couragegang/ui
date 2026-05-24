import type { Workspace } from './types'

/**
 * Выбор workspace.
 * @param isFirstLogin — первый вход (нет сохранённого id): один ws → он, несколько → последний по createdAt.
 * Иначе — сохранённый id, если он ещё в списке; при невалидном — как при первом входе.
 */
export function pickDefaultWorkspaceId(
  list: Workspace[],
  storedId?: string | null,
  isFirstLogin = false,
): string | null {
  if (list.length === 0) return null

  if (!isFirstLogin && storedId && list.some((w) => w.id === storedId)) {
    return storedId
  }

  if (list.length === 1) return list[0].id
  return newestWorkspace(list)?.id ?? list[0].id
}

export function newestWorkspace(list: Workspace[]): Workspace | undefined {
  if (list.length === 0) return undefined
  return [...list].sort((a, b) => workspaceCreatedAt(b) - workspaceCreatedAt(a))[0]
}

function workspaceCreatedAt(w: Workspace): number {
  if (!w.createdAt) return 0
  const t = Date.parse(w.createdAt)
  return Number.isNaN(t) ? 0 : t
}
