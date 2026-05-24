import { useState, type ReactNode } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BffApi } from '@couragegang/api-client'
import type { ChatStorage } from '@couragegang/shared/chat-storage'
import { colors } from '@couragegang/design-system/tokens'

import { AppNavDrawer } from '../components/AppNavDrawer'
import type { DrawerFocusSection } from '../components/ChatContextFooter'
import { ChatContextFooter, FOOTER_BAR_MIN_HEIGHT } from '../components/ChatContextFooter'
import { AppSecondaryPanel } from '../components/AppSecondaryPanel'
import { ChatDrawerProvider } from '../context/ChatDrawerContext'
import { useKeyboardInset } from '../hooks/useKeyboardInset'
import { ChatScreen } from '../screens/ChatScreen'
import {
  isSecondaryPath,
  secondaryPanelTitle,
} from './secondaryRoutes'

export type AppChromeProps = {
  api: BffApi
  chatStorage: ChatStorage
  pathname: string
  children: ReactNode
  onNavigate: (path: string) => void
  onLogout: () => void
}

export function AppChrome(props: AppChromeProps) {
  return (
    <ChatDrawerProvider>
      <AppChromeInner {...props} />
    </ChatDrawerProvider>
  )
}

function AppChromeInner({
  api,
  chatStorage,
  pathname,
  children,
  onNavigate,
  onLogout,
}: AppChromeProps) {
  const insets = useSafeAreaInsets()
  const keyboardInset = useKeyboardInset()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerFocus, setDrawerFocus] = useState<DrawerFocusSection | null>(null)

  const showSecondary = isSecondaryPath(pathname)
  const footerHeight = FOOTER_BAR_MIN_HEIGHT + insets.bottom
  const keyboardOpen = keyboardInset > 0
  const bottomInset =
    keyboardOpen && Platform.OS === 'ios' ? keyboardInset : keyboardOpen ? 0 : footerHeight

  function openMenu(section?: DrawerFocusSection) {
    setDrawerFocus(section ?? null)
    setDrawerOpen(true)
  }

  function backToChat() {
    onNavigate('/chat')
  }

  return (
    <View style={styles.shell}>
      <View
        style={[
          styles.chatLayer,
          { paddingTop: insets.top, paddingBottom: bottomInset },
        ]}
      >
        <ChatScreen api={api} chatStorage={chatStorage} keyboardOpen={keyboardOpen} />
      </View>
      {!keyboardOpen && (
        <View style={styles.footer}>
          <ChatContextFooter onOpenMenu={openMenu} />
        </View>
      )}
      <AppNavDrawer
        open={drawerOpen}
        focusSection={drawerFocus}
        onClose={() => {
          setDrawerOpen(false)
          setDrawerFocus(null)
        }}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      {showSecondary ? (
        <AppSecondaryPanel title={secondaryPanelTitle(pathname)} onBack={backToChat}>
          {children}
        </AppSecondaryPanel>
      ) : (
        children
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.chatMain,
  },
  chatLayer: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 90,
  },
})
