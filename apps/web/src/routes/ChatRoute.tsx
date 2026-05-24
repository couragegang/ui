import { useCallback, useState } from 'react'
import type { ChatDrawerBridgeState } from '@couragegang/app-ui'
import { ChatScreen } from '@couragegang/app-ui/screens'

import { ChatContextFooter } from '../components/chat/ChatContextFooter'
import type { DrawerFocusSection } from '../components/AppNavDrawer'
import { RnHost } from '../components/RnHost'
import { useChatDrawerRegistration } from '../context/ChatDrawerContext'
import { chatStorage } from '../lib/chat-storage'
import { bffApi } from '../platform/bff'

type Props = {
  onOpenMenu?: (section?: DrawerFocusSection) => void
}

export function ChatRoute({ onOpenMenu }: Props) {
  const [drawerReg, setDrawerReg] = useState<ChatDrawerBridgeState | null>(null)
  useChatDrawerRegistration(drawerReg)

  const onDrawerState = useCallback((state: ChatDrawerBridgeState | null) => {
    setDrawerReg((prev) => {
      if (prev === state) return prev
      if (
        prev &&
        state &&
        prev.activeId === state.activeId &&
        prev.showArchived === state.showArchived &&
        prev.conversations === state.conversations
      ) {
        return prev
      }
      return state
    })
  }, [])

  return (
    <>
      <RnHost style={{ flex: 1, height: '100%', minHeight: 0 }}>
        <ChatScreen
          api={bffApi}
          chatStorage={chatStorage}
          onDrawerState={onDrawerState}
          sidebarFooter={
            onOpenMenu ? (
              <ChatContextFooter variant="sidebar" onOpenMenu={onOpenMenu} />
            ) : undefined
          }
        />
      </RnHost>
      {onOpenMenu && <ChatContextFooter variant="mobile-bar" onOpenMenu={onOpenMenu} />}
    </>
  )
}
