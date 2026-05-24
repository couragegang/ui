import type { Conversation } from '@couragegang/shared/types'

import { strings } from '../../strings'

type Props = {
  conversations: Conversation[]
  activeId: string | null
  showArchived: boolean
  onToggleArchived: () => void
  onSelect: (id: string) => void
  onNew: () => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
}

export function ChatThreadListWeb({
  conversations,
  activeId,
  showArchived,
  onToggleArchived,
  onSelect,
  onNew,
  onArchive,
  onDelete,
}: Props) {
  return (
    <div className="chat-thread-panel">
      <button type="button" className="chat-new-btn" onClick={onNew}>
        <PlusIcon />
        <span>{strings.chat.newChat}</span>
      </button>
      <ul className="chat-thread-list">
        {conversations.map((c) => (
          <li key={c.id} className={`chat-thread-item ${activeId === c.id ? 'active' : ''}`}>
            <div className="chat-thread-row">
              <button type="button" className="chat-thread" onClick={() => onSelect(c.id)}>
                <ChatBubbleIcon />
                <span className="chat-thread-title">{c.title ?? strings.chat.untitled}</span>
                {c.status === 'archived' && (
                  <span className="chat-thread-badge">{strings.chat.archivedBadge}</span>
                )}
              </button>
              <div className="chat-thread-actions">
                {c.status !== 'archived' && (
                  <button
                    type="button"
                    className="chat-thread-action"
                    title={strings.chat.archive}
                    aria-label={strings.chat.archive}
                    onClick={(e) => {
                      e.stopPropagation()
                      onArchive(c.id)
                    }}
                  >
                    {strings.chat.archive}
                  </button>
                )}
                <button
                  type="button"
                  className="chat-thread-action chat-thread-action--danger"
                  title={strings.chat.delete}
                  aria-label={strings.chat.delete}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(c.id)
                  }}
                >
                  {strings.chat.delete}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {conversations.length === 0 && (
        <p className="muted chat-sidebar-empty">{strings.chat.noChats}</p>
      )}
      <label className="chat-archived-toggle">
        <input type="checkbox" checked={showArchived} onChange={onToggleArchived} />
        {strings.chat.showArchived}
      </label>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChatBubbleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="chat-thread-icon">
      <path
        d="M8 10h8M8 14h5M6 4h12a2 2 0 012 2v9a2 2 0 01-2 2H9l-4 3V6a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
