import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChatMessage, Conversation } from '@couragegang/shared/types'
import { useAuth } from '../context/AuthContext'
import {
  ApiError,
  approvePending,
  archiveConversation,
  deleteConversation,
  fetchConversationMessages,
  fetchConversations,
  rejectPending,
  sendChat,
} from '../lib/api'
import { ChatSidebar } from '../components/chat/ChatSidebar'
import { ChatMessageBubble } from '../components/chat/ChatMessageBubble'
import { ChatComposer } from '../components/chat/ChatComposer'
import { ChatEmptyWelcome } from '../components/chat/ChatEmptyWelcome'
import { ChatContextFooter } from '../components/chat/ChatContextFooter'
import { useChatDrawer } from '../context/ChatDrawerContext'
import type { DrawerFocusSection } from '../components/AppNavDrawer'
import {
  clearLastActiveChatId,
  resolveInitialChatId,
  setLastActiveChatId,
} from '../lib/chat-storage'

function mapApiMessage(m: ChatMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    status: m.status,
    pendingApprovalId: m.pendingApprovalId,
    toolName: m.toolName,
    connectorKey: m.connectorKey,
  }
}

type ChatPageProps = {
  onOpenMenu?: (section?: DrawerFocusSection) => void
}

export function ChatPage({ onOpenMenu }: ChatPageProps) {
  const { t } = useTranslation()
  const { me, workspaceId } = useAuth()
  const { setRegistration } = useChatDrawer()
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const [threads, setThreads] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hitlBusy, setHitlBusy] = useState(false)
  const [error, setError] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [draftNewChat, setDraftNewChat] = useState(false)
  const initialPickDone = useRef(false)

  useEffect(() => {
    initialPickDone.current = false
    setDraftNewChat(false)
    setActiveId(null)
    setMessages([])
  }, [workspaceId])

  const loadThreads = useCallback(async () => {
    if (!workspaceId) return
    const res = await fetchConversations(showArchived)
    const items = res.items ?? []
    setThreads(items)

    if (!initialPickDone.current) {
      initialPickDone.current = true
      if (!draftNewChat) {
        const initialId = resolveInitialChatId(workspaceId, items)
        if (initialId) setActiveId(initialId)
      }
      return
    }

    setActiveId((current) => {
      if (draftNewChat) return null
      if (current && items.some((c) => c.id === current)) return current
      return resolveInitialChatId(workspaceId, items)
    })
  }, [workspaceId, showArchived, draftNewChat])

  const loadMessages = useCallback(
    async (conversationId: string) => {
      const res = await fetchConversationMessages(conversationId)
      setMessages((res.items ?? []).map(mapApiMessage))
    },
    [],
  )

  useEffect(() => {
    if (!workspaceId) return
    void loadThreads().catch((e) => setError(String(e)))
  }, [workspaceId, loadThreads])

  useEffect(() => {
    if (!workspaceId || !activeId) return
    setLastActiveChatId(workspaceId, activeId)
  }, [workspaceId, activeId])

  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }
    void loadMessages(activeId).catch((e) => setError(String(e)))
  }, [activeId, loadMessages])

  const onSelectThread = useCallback((id: string) => {
    setDraftNewChat(false)
    setActiveId(id)
    setError('')
  }, [])

  const onToggleArchived = useCallback(() => {
    setShowArchived((v) => !v)
  }, [])

  const focusComposer = useCallback((delayMs = 0) => {
    const run = () => composerRef.current?.focus({ preventScroll: true })
    if (delayMs > 0) window.setTimeout(run, delayMs)
    else window.requestAnimationFrame(() => window.requestAnimationFrame(run))
  }, [])

  const onNewChat = useCallback(() => {
    setError('')
    setDraftNewChat(true)
    setActiveId(null)
    setMessages([])
    if (workspaceId) clearLastActiveChatId(workspaceId)
    focusComposer()
  }, [workspaceId, focusComposer])

  const onArchiveThread = useCallback(
    async (id: string) => {
      try {
        await archiveConversation(id)
        if (activeId === id) {
          setActiveId(null)
          clearLastActiveChatId(workspaceId)
        }
        await loadThreads()
      } catch (e) {
        setError(String(e))
      }
    },
    [activeId, workspaceId, loadThreads],
  )

  const onDeleteThread = useCallback(
    async (id: string) => {
      if (!window.confirm(t('chat.deleteConfirm'))) return
      try {
        await deleteConversation(id)
        if (activeId === id) {
          setActiveId(null)
          setMessages([])
          clearLastActiveChatId(workspaceId)
        }
        await loadThreads()
      } catch (e) {
        setError(String(e))
      }
    },
    [activeId, workspaceId, loadThreads, t],
  )

  useEffect(() => {
    if (!workspaceId) {
      setRegistration(null)
      return
    }
    setRegistration({
      conversations: threads,
      activeId,
      showArchived,
      onToggleArchived,
      onSelect: onSelectThread,
      onNew: onNewChat,
      focusComposer,
      onArchive: (id) => void onArchiveThread(id),
      onDelete: (id) => void onDeleteThread(id),
    })
    return () => setRegistration(null)
  }, [
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
    setRegistration,
  ])

  async function onSend(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || !workspaceId) return
    const userMsg = input.trim()
    setInput('')
    setError('')
    setMessages((m) => [...m, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      let conversationId = activeId ?? undefined
      const res = await sendChat({ message: userMsg, conversationId })
      if (res.conversationId) {
        conversationId = res.conversationId
        setDraftNewChat(false)
        setActiveId(res.conversationId)
      }
      if (res.conversationTitle) {
        await loadThreads()
      } else if (res.conversationId && res.conversationId !== activeId) {
        await loadThreads()
      }
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: res.reply ?? '',
          status: res.status,
          pendingApprovalId: res.pendingApprovalId,
          toolName: res.toolName,
          connectorKey: res.connectorKey,
        },
      ])
    } catch (err) {
      setError(err instanceof ApiError ? err.body ?? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function onHitlDecision(index: number, action: 'approve' | 'reject') {
    const msg = messages[index]
    if (!msg?.pendingApprovalId || !me?.userId || !activeId) return
    setHitlBusy(true)
    setError('')
    try {
      if (action === 'approve') {
        await approvePending(msg.pendingApprovalId, me.userId)
      } else {
        await rejectPending(msg.pendingApprovalId, me.userId)
      }
      setMessages((list) =>
        list.map((m, i) =>
          i === index ? { ...m, hitlResolved: action === 'approve' ? 'approved' : 'rejected' } : m,
        ),
      )
      if (action === 'reject') {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: t('chat.hitlRejected'), status: 'completed' },
        ])
        return
      }
      const priorUser = [...messages].slice(0, index).reverse().find((m) => m.role === 'user')
      const retryMessage = priorUser?.content ?? msg.content
      const toolName = msg.toolName ?? 'notion_write_page'
      const connectorKey = msg.connectorKey ?? 'notion'
      setLoading(true)
      const res = await sendChat({
        message: retryMessage,
        conversationId: activeId,
        toolName,
        connectorKey,
        approvedPendingApprovalId: msg.pendingApprovalId,
      })
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: res.reply ?? t('chat.toolDoneEmpty'),
          status: res.status,
          pendingApprovalId: res.pendingApprovalId,
          toolName,
          connectorKey,
        },
      ])
    } catch (err) {
      const errText = err instanceof ApiError ? err.body ?? err.message : String(err)
      setError(errText)
      setMessages((m) => [...m, { role: 'assistant', content: errText, status: 'error' }])
    } finally {
      setHitlBusy(false)
      setLoading(false)
    }
  }

  if (!workspaceId) {
    return (
      <>
        <div className="chat-page-shell chat-page-shell--setup">
          <div className="chat-setup">
            <ChatEmptyWelcome title={t('context.noWorkspace')} />
            <p className="muted chat-setup-hint">{t('app.setupHint')}</p>
          </div>
        </div>
        {onOpenMenu && <ChatContextFooter variant="mobile-bar" onOpenMenu={onOpenMenu} />}
      </>
    )
  }

  const isEmptyView = messages.length === 0

  return (
    <>
    <div className="chat-page-shell">
      <ChatSidebar
        conversations={threads}
        activeId={activeId}
        showArchived={showArchived}
        onToggleArchived={onToggleArchived}
        onSelect={onSelectThread}
        onNew={onNewChat}
        onArchive={onArchiveThread}
        onDelete={onDeleteThread}
        onOpenMenu={onOpenMenu}
      />
      <div className={`chat-main ${isEmptyView ? 'chat-main--empty' : 'chat-main--thread'}`}>
        {isEmptyView ? (
          <div className="chat-empty-stage">
            <ChatEmptyWelcome />
            <ChatComposer
              ref={composerRef}
              variant="centered"
              value={input}
              onChange={setInput}
              onSubmit={onSend}
              disabled={loading || hitlBusy}
            />
          </div>
        ) : (
          <>
            <div className="chat-log">
              {messages.map((m, i) => (
                <ChatMessageBubble
                  key={m.id ?? i}
                  message={m}
                  hitlBusy={hitlBusy}
                  onApprove={
                    m.status === 'awaiting_approval' ? () => void onHitlDecision(i, 'approve') : undefined
                  }
                  onReject={
                    m.status === 'awaiting_approval' ? () => void onHitlDecision(i, 'reject') : undefined
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
                      <span className="chat-typing-dots" aria-label={t('chat.thinking')}>
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
              <ChatComposer
                ref={composerRef}
                value={input}
                onChange={setInput}
                onSubmit={onSend}
                disabled={loading || hitlBusy}
              />
            </div>
          </>
        )}
        {isEmptyView && error && <p className="error chat-empty-error">{error}</p>}
      </div>
    </div>
    {onOpenMenu && <ChatContextFooter variant="mobile-bar" onOpenMenu={onOpenMenu} />}
    </>
  )
}
