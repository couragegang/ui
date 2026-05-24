import type { Conversation } from '@couragegang/shared/types'

/** Состояние чата для бокового меню web (AppNavDrawer). */
export type ChatDrawerBridgeState = {
  conversations: Conversation[]
  activeId: string | null
  showArchived: boolean
  onToggleArchived: () => void
  onSelect: (id: string) => void
  onNew: () => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  focusComposer?: (delayMs?: number) => void
}
