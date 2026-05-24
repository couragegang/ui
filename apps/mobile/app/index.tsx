import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Button, Text } from '@couragegang/design-system'
import { useAuthSession } from '@couragegang/shared/hooks'
import { bffApi } from '../src/platform/bff'
import { authStorage, hydrateAuthStorage } from '../src/platform/storage'

export default function HomeScreen() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hydrateAuthStorage().finally(() => setReady(true))
  }, [])

  const session = useAuthSession({
    storage: authStorage,
    api: bffApi,
    enabled: ready,
  })

  if (!ready || session.loading) {
    return (
      <View style={styles.center}>
        <Text>Загрузка…</Text>
      </View>
    )
  }

  return (
    <View style={styles.center}>
      <Text variant="title">Couragegang Mobile</Text>
      <Text variant="muted" style={styles.gap}>
        {session.me?.userId ? `user: ${session.me.userId}` : 'Не авторизован'}
      </Text>
      {!session.me && (
        <Button
          title="Демо-логин (нужен BFF)"
          onPress={() => session.login('demo@example.com', 'password')}
        />
      )}
      {session.me && <Button title="Выйти" onPress={() => session.logout()} />}
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0f1419',
  },
  gap: { marginVertical: 16 },
})
