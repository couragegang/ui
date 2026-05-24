import { Redirect } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors } from '@couragegang/design-system/tokens'
import { useAuth } from '@couragegang/app-ui'

export default function Index() {
  const auth = useAuth()

  if (auth.loading) {
    return (
      <View style={styles.center}>
        <Text>{'Загрузка…'}</Text>
      </View>
    )
  }

  if (!auth.me) {
    return <Redirect href="/login" />
  }

  return <Redirect href="/chat" />
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
})
