import { useTranslation } from 'react-i18next'
import type { Conversation } from '@couragegang/shared/types'

type Props = {
  conversations: Conversation[]
  activeId: string | null
  showArchived: boolean
  onToggleArchived: () => void
  onSelect: (id: string) => void
  onNew: () => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onAfterSelect?: () => void
  onAfterNew?: () => void
  variant?: 'sidebar' | 'drawer'
}

export function ChatThreadList({
  conversations,
  activeId,
  showArchived,
  onToggleArchived,
  onSelect,
  onNew,
  onArchive,
  onDelete,
  onAfterSelect,
  onAfterNew,
  variant = 'sidebar',
}: Props) {
  const { t } = useTranslation()
  const rootClass = variant === 'drawer' ? 'chat-thread-panel chat-thread-panel--drawer' : 'chat-thread-panel'

  function select(id: string) {
    onSelect(id)
    onAfterSelect?.()
  }

  function startNew() {
    onNew()
    onAfterNew?.()
  }

  return (
    <div className={rootClass}>
      <button type="button" className="chat-new-btn" onClick={startNew}>
        <PlusIcon />
        <span>{t('chat.newChat')}</span>
      </button>
      <ul className="chat-thread-list">
        {conversations.map((c) => {
          const isDrawer = variant === 'drawer'
          return (
            <li
              key={c.id}
              className={`chat-thread-item ${activeId === c.id ? 'active' : ''} ${isDrawer ? 'chat-thread-item--drawer' : ''}`}
            >
              <div className="chat-thread-row">
                <button type="button" className="chat-thread" onClick={() => select(c.id)}>
                  <ChatBubbleIcon />
                  <span className="chat-thread-title">{c.title ?? t('chat.untitled')}</span>
                  {c.status === 'archived' && (
                    <span className="chat-thread-badge">{t('chat.archived')}</span>
                  )}
                </button>
                <div
                  className={`chat-thread-actions ${isDrawer ? 'chat-thread-actions--touch' : ''}`}
                >
                  {c.status !== 'archived' && (
                    <button
                      type="button"
                      className="chat-thread-action"
                      title={t('chat.archive')}
                      aria-label={t('chat.archive')}
                      onClick={(e) => {
                        e.stopPropagation()
                        onArchive(c.id)
                      }}
                    >
                      {isDrawer ? <ArchiveIcon /> : t('chat.archive')}
                    </button>
                  )}
                  <button
                    type="button"
                    className="chat-thread-action chat-thread-action--danger"
                    title={t('chat.delete')}
                    aria-label={t('chat.delete')}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(c.id)
                    }}
                  >
                    {isDrawer ? <DeleteIcon /> : t('chat.delete')}
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {conversations.length === 0 && <p className="muted chat-sidebar-empty">{t('chat.noChats')}</p>}
      <label className="chat-archived-toggle">
        <input type="checkbox" checked={showArchived} onChange={onToggleArchived} />
        {t('chat.showArchived')}
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

function ArchiveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm3-3h10a1 1 0 011 1v1H6V5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
