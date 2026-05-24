import type { ReactNode } from 'react'
import type { BffApi } from '@couragegang/api-client'
import type { ChatStorage } from '@couragegang/shared/chat-storage'

import type { ChatDrawerBridgeState } from '../chat-drawer-bridge'

export type ChatScreenProps = {
  api: BffApi
  chatStorage: ChatStorage
  /** Native: кроватка поднимается над клавиатурой */
  keyboardOpen?: boolean
  /** Web: синхронизация тредов с AppNavDrawer */
  onDrawerState?: (state: ChatDrawerBridgeState | null) => void
  /** Web: футер сайдбара (ChatContextFooter) */
  sidebarFooter?: ReactNode
}
