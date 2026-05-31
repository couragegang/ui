import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError, type BffApi } from '@couragegang/api-client'

import type { ChatStorage } from '../chat-storage'
import type { ChatMessage, ChatResponse, Conversation } from '../types'

export type UseChatConfig = {
  api: BffApi
  workspaceId: string | null
  userId: string | null | undefined
  chatStorage: ChatStorage
  strings?: {
    hitlRejected?: string
    toolDoneEmpty?: string
  }
}

function mapApiMessage(m: ChatMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    status: m.status,
    pendingApprovalId: m.pendingApprovalId,
    toolName: m.toolName,
    connectorKey: m.connectorKey,
    hitlResolved: m.hitlResolved,
  }
}

export function useChat({ api, workspaceId, userId, chatStorage, strings }: UseChatConfig) {
  const hitlRejected = strings?.hitlRejected ?? 'Действие отклонено.'
  const toolDoneEmpty = strings?.toolDoneEmpty ?? 'Готово.'

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
    const res = (await api.conversations(showArchived)) as { items?: Conversation[] }
    const items = res.items ?? []
    setThreads(items)

    if (!initialPickDone.current) {
      initialPickDone.current = true
      if (!draftNewChat) {
        const initialId = chatStorage.resolveInitialChatId(workspaceId, items)
        if (initialId) setActiveId(initialId)
      }
      return
    }

    setActiveId((current) => {
      if (draftNewChat) return null
      if (current && items.some((c) => c.id === current)) return current
      return chatStorage.resolveInitialChatId(workspaceId, items)
    })
  }, [api, workspaceId, showArchived, draftNewChat, chatStorage])

  const loadMessages = useCallback(
    async (conversationId: string) => {
      const res = (await api.conversationMessages(conversationId)) as { items?: ChatMessage[] }
      setMessages((res.items ?? []).map(mapApiMessage))
    },
    [api],
  )

  useEffect(() => {
    if (!workspaceId) return
    void loadThreads().catch((e) => setError(String(e)))
  }, [workspaceId, loadThreads])

  useEffect(() => {
    if (!workspaceId || !activeId) return
    chatStorage.setLastActiveChatId(workspaceId, activeId)
  }, [workspaceId, activeId, chatStorage])

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

  const onNewChat = useCallback(() => {
    setError('')
    setDraftNewChat(true)
    setActiveId(null)
    setMessages([])
    if (workspaceId) chatStorage.clearLastActiveChatId(workspaceId)
  }, [workspaceId, chatStorage])

  const onArchiveThread = useCallback(
    async (id: string) => {
      try {
        await api.archiveConversation(id)
        if (activeId === id) {
          setActiveId(null)
          if (workspaceId) chatStorage.clearLastActiveChatId(workspaceId)
        }
        await loadThreads()
      } catch (e) {
        setError(String(e))
      }
    },
    [api, activeId, workspaceId, loadThreads, chatStorage],
  )

  const onDeleteThread = useCallback(
    async (id: string) => {
      try {
        await api.deleteConversation(id)
        if (activeId === id) {
          setActiveId(null)
          setMessages([])
          if (workspaceId) chatStorage.clearLastActiveChatId(workspaceId)
        }
        await loadThreads()
      } catch (e) {
        setError(String(e))
      }
    },
    [api, activeId, workspaceId, loadThreads, chatStorage],
  )

  const onSend = useCallback(async () => {
    if (!input.trim() || !workspaceId) return
    const userMsg = input.trim()
    setInput('')
    setError('')
    setMessages((m) => [...m, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      let conversationId = activeId ?? undefined
      const res = (await api.chat({
        message: userMsg,
        conversationId,
      } as Record<string, unknown>)) as ChatResponse
      if (res.conversationId) {
        conversationId = res.conversationId
        setDraftNewChat(false)
        setActiveId(res.conversationId)
      }
      if (res.conversationTitle || (res.conversationId && res.conversationId !== activeId)) {
        await loadThreads()
      }
      if (res.status === 'error') {
        setError(res.reply ?? 'error')
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
      setError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setLoading(false)
    }
  }, [input, workspaceId, activeId, api, loadThreads])

  const onHitlDecision = useCallback(
    async (index: number, action: 'approve' | 'reject') => {
      const msg = messages[index]
      if (!msg?.pendingApprovalId || !userId || !activeId) return
      setHitlBusy(true)
      setError('')
      try {
        if (action === 'approve') {
          await api.approvePending(msg.pendingApprovalId, userId)
        } else {
          await api.rejectPending(msg.pendingApprovalId, userId)
        }
        setMessages((list) =>
          list.map((m, i) =>
            i === index ? { ...m, hitlResolved: action === 'approve' ? 'approved' : 'rejected' } : m,
          ),
        )
        if (action === 'reject') {
          setMessages((m) => [
            ...m,
            { role: 'assistant', content: hitlRejected, status: 'completed' },
          ])
          return
        }
        const priorUser = [...messages].slice(0, index).reverse().find((m) => m.role === 'user')
        const retryMessage = priorUser?.content ?? msg.content
        setLoading(true)
        const isPlanApproval = msg.status === 'awaiting_plan_approval'
        const res = (await api.chat({
          message: retryMessage,
          conversationId: activeId,
          ...(isPlanApproval
            ? {}
            : {
                toolName: msg.toolName ?? 'notion_write_page',
                connectorKey: msg.connectorKey ?? 'notion',
              }),
          approvedPendingApprovalId: msg.pendingApprovalId,
        } as Record<string, unknown>)) as ChatResponse
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content: res.reply ?? toolDoneEmpty,
            status: res.status,
            pendingApprovalId: res.pendingApprovalId,
            toolName: isPlanApproval ? res.toolName : (msg.toolName ?? res.toolName),
            connectorKey: isPlanApproval ? res.connectorKey : (msg.connectorKey ?? res.connectorKey),
          },
        ])
      } catch (err) {
        const errText = err instanceof ApiError ? (err.body ?? err.message) : String(err)
        setError(errText)
        setMessages((m) => [...m, { role: 'assistant', content: errText, status: 'error' }])
      } finally {
        setHitlBusy(false)
        setLoading(false)
      }
    },
    [messages, userId, activeId, api, hitlRejected, toolDoneEmpty],
  )

  return {
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
    onNewChat,
    onSend,
    onHitlDecision,
    onArchiveThread,
    onDeleteThread,
    reloadThreads: loadThreads,
  }
}
