import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ChatDrawerBridgeState } from '@couragegang/app-ui'

export type ChatDrawerRegistration = ChatDrawerBridgeState

type ChatDrawerContextValue = {
  registration: ChatDrawerRegistration | null
  setRegistration: (value: ChatDrawerRegistration | null) => void
}

const ChatDrawerContext = createContext<ChatDrawerContextValue | null>(null)

export function ChatDrawerProvider({ children }: { children: ReactNode }) {
  const [registration, setRegistration] = useState<ChatDrawerRegistration | null>(null)
  const value = useMemo(() => ({ registration, setRegistration }), [registration])
  return <ChatDrawerContext.Provider value={value}>{children}</ChatDrawerContext.Provider>
}

export function useChatDrawerRegistration(reg: ChatDrawerRegistration | null) {
  const ctx = useContext(ChatDrawerContext)
  if (!ctx) throw new Error('useChatDrawerRegistration outside ChatDrawerProvider')

  const { setRegistration } = ctx

  useEffect(() => {
    setRegistration(reg)
    return () => setRegistration(null)
  }, [setRegistration, reg])
}

export function useChatDrawer() {
  const ctx = useContext(ChatDrawerContext)
  if (!ctx) throw new Error('useChatDrawer outside ChatDrawerProvider')
  return ctx
}
