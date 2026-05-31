import { useCallback, useEffect, useRef, type FormEvent } from 'react'
import { useChat } from '@couragegang/shared/hooks'

import { ChatComposerWeb } from '../chat/web/ChatComposerWeb'
import { ChatEmptyWelcomeWeb } from '../chat/web/ChatEmptyWelcomeWeb'
import { ChatMessageBubbleWeb } from '../chat/web/ChatMessageBubbleWeb'
import { ChatThreadListWeb } from '../chat/web/ChatThreadListWeb'
import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'
import type { ChatScreenProps } from './ChatScreen.types'

export type { ChatScreenProps } from './ChatScreen.types'

export function ChatScreen({ api, chatStorage, onDrawerState, sidebarFooter }: ChatScreenProps) {
  const { me, workspaceId } = useAuth()
  const composerRef = useRef<HTMLTextAreaElement>(null)

  const {
    threads,
    activeId,
    messages,
    input,
    setInput,
    loading,
    hitlBusy,
    error,
    showArchived,
    onSelectThread,
    onToggleArchived,
    onNewChat: onNewChatBase,
    onSend: sendChat,
    onHitlDecision,
    onArchiveThread,
    onDeleteThread: onDeleteThreadBase,
  } = useChat({
    api,
    workspaceId,
    userId: me?.userId,
    chatStorage,
    strings: {
      hitlRejected: strings.chat.hitlRejected,
      toolDoneEmpty: strings.chat.toolDoneEmpty,
    },
  })

  const focusComposer = useCallback((delayMs = 0) => {
    const run = () => composerRef.current?.focus({ preventScroll: true })
    if (delayMs > 0) window.setTimeout(run, delayMs)
    else window.requestAnimationFrame(() => window.requestAnimationFrame(run))
  }, [])

  const onNewChat = useCallback(() => {
    onNewChatBase()
    focusComposer()
  }, [onNewChatBase, focusComposer])

  const onDeleteThread = useCallback(
    (id: string) => {
      if (!window.confirm(strings.chat.deleteConfirm)) return
      void onDeleteThreadBase(id)
    },
    [onDeleteThreadBase],
  )

  useEffect(() => {
    if (!onDrawerState) return
    if (!workspaceId) {
      onDrawerState(null)
      return
    }
    onDrawerState({
      conversations: threads,
      activeId,
      showArchived,
      onToggleArchived,
      onSelect: onSelectThread,
      onNew: onNewChat,
      focusComposer,
      onArchive: (id) => void onArchiveThread(id),
      onDelete: onDeleteThread,
    })
  }, [
    onDrawerState,
    workspaceId,
    threads,
    activeId,
    showArchived,
    onToggleArchived,
    onSelectThread,
    onNewChat,
    focusComposer,
    onArchiveThread,
    onDeleteThread,
  ])

  function onSubmitComposer(e: FormEvent) {
    e.preventDefault()
    void sendChat()
  }

  if (!workspaceId) {
    return (
      <div className="chat-page-shell chat-page-shell--setup">
        <div className="chat-setup">
          <ChatEmptyWelcomeWeb title={strings.context.noWorkspace} />
          <p className="muted chat-setup-hint">{strings.app.setupHint}</p>
        </div>
      </div>
    )
  }

  const isEmptyView = messages.length === 0

  return (
    <div className="chat-page-shell">
      <aside className="chat-sidebar">
        <ChatThreadListWeb
          conversations={threads}
          activeId={activeId}
          showArchived={showArchived}
          onToggleArchived={onToggleArchived}
          onSelect={onSelectThread}
          onNew={onNewChat}
          onArchive={(id) => void onArchiveThread(id)}
          onDelete={onDeleteThread}
        />
        {sidebarFooter && <footer className="chat-sidebar-foot">{sidebarFooter}</footer>}
      </aside>
      <div className={`chat-main ${isEmptyView ? 'chat-main--empty' : 'chat-main--thread'}`}>
        {isEmptyView ? (
          <div className="chat-empty-stage">
            <ChatEmptyWelcomeWeb />
            <ChatComposerWeb
              ref={composerRef}
              variant="centered"
              value={input}
              onChange={setInput}
              onSubmit={onSubmitComposer}
              disabled={loading || hitlBusy}
            />
          </div>
        ) : (
          <>
            <div className="chat-log">
              {messages.map((m, i) => (
                <ChatMessageBubbleWeb
                  key={m.id ?? i}
                  message={m}
                  hitlBusy={hitlBusy}
                  onApprove={
                    m.status === 'awaiting_approval' || m.status === 'awaiting_plan_approval'
                      ? () => void onHitlDecision(i, 'approve')
                      : undefined
                  }
                  onReject={
                    m.status === 'awaiting_approval' || m.status === 'awaiting_plan_approval'
                      ? () => void onHitlDecision(i, 'reject')
                      : undefined
                  }
                />
              ))}
              {loading && (
                <div className="chat-row chat-row--assistant chat-row--typing">
                  <div className="chat-row-inner">
                    <div className="chat-row-avatar" aria-hidden>
                      <span>AI</span>
                    </div>
                    <div className="chat-row-content">
                      <span className="chat-typing-dots" aria-label={strings.chat.thinking}>
                        <span />
                        <span />
                        <span />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="chat-dock">
              {error && <p className="error chat-dock-error">{error}</p>}
              <ChatComposerWeb
                ref={composerRef}
                value={input}
                onChange={setInput}
                onSubmit={onSubmitComposer}
                disabled={loading || hitlBusy}
              />
            </div>
          </>
        )}
        {isEmptyView && error && <p className="error chat-empty-error">{error}</p>}
      </div>
    </div>
  )
}
