import { useCallback, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { Button, Text } from '@couragegang/design-system'
import { spacing } from '@couragegang/design-system/tokens'
import { ApiError } from '@couragegang/api-client'

import { useOidcCallback } from '../auth/useOidcCallback'
import { ErrorBanner } from '../components/ErrorBanner'
import { OAuthProviderButtons } from '../components/OAuthProviderButtons'
import { Screen } from '../components/Screen'
import { TextField } from '../components/TextField'
import { useAuth } from '../context/AuthProvider'
import { themeColors, type UiTheme } from '../theme'
import { strings } from '../strings'

export type AuthScreenProps = {
  mode: 'login' | 'register'
  onSuccess?: () => void
  onSwitchMode?: () => void
  /** Путь после входа, напр. `/chat` — для OIDC `redirect_after` */
  returnPath?: string
  /** BFF API base, напр. `/api` или `https://ai-test.valoriel.ru/api` */
  apiBaseUrl?: string
  /** Origin SPA без `/api` (mobile); на web — `window.location.origin` */
  appOrigin?: string
  theme?: UiTheme
  hideTitle?: boolean
  /** Скрыть переключатель login/register (web — footer в AuthPageLayout) */
  hideModeSwitch?: boolean
  /** Скрыть OAuth (если секреты не настроены) */
  showOAuth?: boolean
}

function AuthDivider({ theme }: { theme: UiTheme }) {
  const pal = themeColors[theme]
  return (
    <View style={styles.dividerRow}>
      <View style={[styles.dividerLine, { backgroundColor: pal.border }]} />
      <Text variant="muted" style={{ color: pal.textMuted, paddingHorizontal: spacing.sm }}>
        {strings.auth.orDivider}
      </Text>
      <View style={[styles.dividerLine, { backgroundColor: pal.border }]} />
    </View>
  )
}

export function AuthScreen({
  mode,
  onSuccess,
  onSwitchMode,
  returnPath = '/chat',
  apiBaseUrl = '/api',
  appOrigin,
  theme = 'dark',
  hideTitle = false,
  hideModeSwitch = false,
  showOAuth = true,
}: AuthScreenProps) {
  const pal = themeColors[theme]
  const isLight = theme === 'light'
  const isLogin = mode === 'login'
  const { login, register, applyOAuthTokens } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleOAuthTokens = useCallback(
    (accessToken: string, refreshToken?: string) => {
      applyOAuthTokens(accessToken, refreshToken)
      onSuccess?.()
    },
    [applyOAuthTokens, onSuccess],
  )

  useOidcCallback({
    onTokens: handleOAuthTokens,
    enabled: Platform.OS === 'web',
  })

  async function onSubmit() {
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await login(email.trim(), password)
      } else {
        await register({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
          organizationName: organizationName.trim() || undefined,
        })
      }
      onSuccess?.()
    } catch (err) {
      setError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setLoading(false)
    }
  }

  const title = isLogin ? strings.auth.loginTitle : strings.auth.registerTitle
  const submitLabel = isLogin ? strings.auth.login : strings.auth.register

  return (
    <Screen fill={!isLight} padded={false} backgroundColor={pal.bg} scroll={false}>
      <View style={styles.form}>
        {!hideTitle && (
          <Text variant="title" style={{ color: pal.text }}>
            {title}
          </Text>
        )}

        {showOAuth && (
          <>
            <OAuthProviderButtons
              mode={mode}
              returnPath={returnPath}
              apiBaseUrl={apiBaseUrl}
              appOrigin={appOrigin}
            />
            <AuthDivider theme={theme} />
          </>
        )}

        {!isLogin && (
          <TextField
            label={strings.auth.displayName}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            theme={theme}
          />
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
        {!isLogin && (
          <TextField
            label={strings.auth.orgName}
            value={organizationName}
            onChangeText={setOrganizationName}
            autoCapitalize="words"
            theme={theme}
          />
        )}
        <ErrorBanner message={error} />
        <Button title={submitLabel} onPress={() => void onSubmit()} loading={loading} />

        {onSwitchMode && !hideModeSwitch && (
          <View style={styles.footer}>
            <Text variant="muted" style={{ color: pal.textMuted }}>
              {isLogin ? strings.auth.noAccount : strings.auth.hasAccount}{' '}
            </Text>
            <Text style={[styles.link, isLight && styles.linkLight]} onPress={onSwitchMode}>
              {isLogin ? strings.auth.toRegister : strings.auth.toLogin}
            </Text>
          </View>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xs },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  footer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
  link: { color: '#3b82f6' },
  linkLight: { color: '#4d6bfe' },
})
