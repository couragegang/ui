import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text } from '@couragegang/design-system'
import { spacing } from '@couragegang/design-system/tokens'
import { ApiError } from '@couragegang/api-client'

import { ErrorBanner } from '../components/ErrorBanner'
import { Screen } from '../components/Screen'
import { TextField } from '../components/TextField'
import { useAuth } from '../context/AuthProvider'
import { themeColors, type UiTheme } from '../theme'
import { strings } from '../strings'

export type LoginScreenProps = {
  onSuccess?: () => void
  onGoRegister?: () => void
  /** light — форма внутри светлой карточки (web) */
  theme?: UiTheme
  /** Скрыть заголовок, если он уже есть снаружи (AuthPageLayout) */
  hideTitle?: boolean
}

export function LoginScreen({
  onSuccess,
  onGoRegister,
  theme = 'dark',
  hideTitle = false,
}: LoginScreenProps) {
  const pal = themeColors[theme]
  const isLight = theme === 'light'
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen fill={!isLight} padded={false} backgroundColor={pal.bg} scroll={false}>
      <View style={styles.form}>
      {!hideTitle && (
        <Text variant="title" style={{ color: pal.text }}>
          {strings.auth.loginTitle}
        </Text>
      )}
      <TextField
        label={strings.auth.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        theme={theme}
      />
      <TextField
        label={strings.auth.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        theme={theme}
      />
      <ErrorBanner message={error} />
      <Button title={strings.auth.login} onPress={() => void onSubmit()} loading={loading} />
      {onGoRegister && !hideTitle && (
        <View style={styles.footer}>
          <Text variant="muted" style={{ color: pal.textMuted }}>
            {strings.auth.noAccount}{' '}
          </Text>
          <Text style={[styles.link, isLight && styles.linkLight]} onPress={onGoRegister}>
            {strings.auth.toRegister}
          </Text>
        </View>
      )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  footer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
  link: { color: '#3b82f6' },
  linkLight: { color: '#4d6bfe' },
})
