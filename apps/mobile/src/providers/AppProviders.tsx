import { useEffect, useState, type ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors } from '@couragegang/design-system/tokens'
import { AuthProvider } from '@couragegang/app-ui'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { bffApi } from '../platform/bff'
import { hydrateChatStorage } from '../platform/chat-storage'
import { authStorage, hydrateAuthStorage } from '../platform/storage'

export function AppProviders({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([hydrateAuthStorage(), hydrateChatStorage()]).finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <View style={styles.center}>
        <Text>Загрузка…</Text>
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <AuthProvider storage={authStorage} api={bffApi} enabled={ready}>
        {children}
      </AuthProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
})
