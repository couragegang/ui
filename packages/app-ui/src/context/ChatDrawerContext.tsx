import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import type { ChatDrawerBridgeState } from '../chat-drawer-bridge'

export type ChatDrawerRegistration = ChatDrawerBridgeState

type ChatDrawerContextValue = {
  registration: ChatDrawerRegistration | null
  setRegistration: (value: ChatDrawerRegistration | null) => void
}

const ChatDrawerContext = createContext<ChatDrawerContextValue | null>(null)

function sameRegistration(
  a: ChatDrawerRegistration | null,
  b: ChatDrawerRegistration | null,
): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.activeId === b.activeId &&
    a.showArchived === b.showArchived &&
    a.conversations === b.conversations
  )
}

export function ChatDrawerProvider({ children }: { children: ReactNode }) {
  const [registration, setRegistrationState] = useState<ChatDrawerRegistration | null>(null)
  const setRegistration = useCallback((value: ChatDrawerRegistration | null) => {
    setRegistrationState((prev) => (sameRegistration(prev, value) ? prev : value))
  }, [])
  const value = useMemo(() => ({ registration, setRegistration }), [registration, setRegistration])
  return <ChatDrawerContext.Provider value={value}>{children}</ChatDrawerContext.Provider>
}

export function useChatDrawerRegistration(reg: ChatDrawerRegistration | null) {
  const ctx = useContext(ChatDrawerContext)
  if (!ctx) throw new Error('useChatDrawerRegistration outside ChatDrawerProvider')

  const { setRegistration } = ctx
  const regRef = useRef(reg)
  regRef.current = reg

  const activeId = reg?.activeId ?? null
  const showArchived = reg?.showArchived ?? false
  const conversations = reg?.conversations

  useEffect(() => {
    setRegistration(regRef.current)
  }, [setRegistration, activeId, showArchived, conversations])

  useEffect(() => () => setRegistration(null), [setRegistration])
}

export function useChatDrawer() {
  const ctx = useContext(ChatDrawerContext)
  if (!ctx) throw new Error('useChatDrawer outside ChatDrawerProvider')
  return ctx
}
