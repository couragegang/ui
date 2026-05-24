import type { Conversation } from '@couragegang/shared/types'
import type { DrawerFocusSection } from '../AppNavDrawer'
import { ChatContextFooter } from './ChatContextFooter'
import { ChatThreadList } from './ChatThreadList'

type Props = {
  conversations: Conversation[]
  activeId: string | null
  showArchived: boolean
  onToggleArchived: () => void
  onSelect: (id: string) => void
  onNew: () => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onOpenMenu?: (section?: DrawerFocusSection) => void
}

export function ChatSidebar({
  conversations,
  activeId,
  showArchived,
  onToggleArchived,
  onSelect,
  onNew,
  onArchive,
  onDelete,
  onOpenMenu,
}: Props) {
  return (
    <aside className="chat-sidebar">
      <ChatThreadList
        conversations={conversations}
        activeId={activeId}
        showArchived={showArchived}
        onToggleArchived={onToggleArchived}
        onSelect={onSelect}
        onNew={onNew}
        onArchive={onArchive}
        onDelete={onDelete}
        variant="sidebar"
      />
      {onOpenMenu && (
        <footer className="chat-sidebar-foot">
          <ChatContextFooter variant="sidebar" onOpenMenu={onOpenMenu} />
        </footer>
      )}
    </aside>
  )
}
