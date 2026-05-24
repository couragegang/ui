import { Redirect, Slot, usePathname, useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { useAuth } from '@couragegang/app-ui'
import { ToolsOnboardingScreen } from '@couragegang/app-ui/screens'
import { AppChrome, isOnboardingPath, ToolsOnboardingRedirect } from '@couragegang/app-ui/shell'
import { colors } from '@couragegang/design-system/tokens'

import { isToolsOnboardingSkipped, skipToolsOnboarding } from '../../src/lib/tools-onboarding'
import { bffApi } from '../../src/platform/bff'
import { chatStorage } from '../../src/platform/chat-storage'

export default function AppLayout() {
  const auth = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const onboarding = isOnboardingPath(pathname)

  if (auth.loading) {
    return (
      <View style={styles.loading}>
        <Text>{'Загрузка…'}</Text>
      </View>
    )
  }

  if (!auth.me) {
    return <Redirect href="/login" />
  }

  function navigate(path: string) {
    if (path === '/chat' || path.endsWith('/chat')) {
      router.replace('/chat')
      return
    }
    if (path.includes('onboarding')) {
      router.replace(path as never)
      return
    }
    router.push(path as never)
  }

  return (
    <View style={styles.root}>
      <ToolsOnboardingRedirect
        api={bffApi}
        pathname={pathname}
        onNavigate={navigate}
        isOnboardingSkipped={isToolsOnboardingSkipped}
      />

      <AppChrome
        api={bffApi}
        chatStorage={chatStorage}
        pathname={pathname}
        onNavigate={navigate}
        onLogout={() => router.replace('/login')}
      >
        <Slot />
      </AppChrome>

      {onboarding && (
        <View style={styles.onboardingOverlay}>
          <ToolsOnboardingScreen
            api={bffApi}
            onFinish={() => router.replace('/chat')}
            onSkip={() => {
              void (async () => {
                if (auth.workspaceId) await skipToolsOnboarding(auth.workspaceId)
                router.replace('/chat')
              })()
            }}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  onboardingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    zIndex: 300,
    elevation: 301,
  },
})
