import { Pressable, StyleSheet, Text, View } from 'react-native'
import { AuthPageLayout } from '../components/AuthPageLayout'
import { authLayoutColors } from '../theme'
import { strings } from '../strings'
import { AuthScreen, type AuthScreenProps } from './AuthScreen'

export type AuthPageProps = AuthScreenProps & {
  onSwitchMode?: () => void
}

export function AuthPage({ mode, onSwitchMode, ...authProps }: AuthPageProps) {
  const isLogin = mode === 'login'

  const footer = onSwitchMode ? (
    <View style={styles.footerRow}>
      <Text style={styles.footerMuted}>
        {isLogin ? strings.auth.noAccount : strings.auth.hasAccount}{' '}
      </Text>
      <Pressable onPress={onSwitchMode} accessibilityRole="link">
        <Text style={styles.footerLink}>
          {isLogin ? strings.auth.toRegister : strings.auth.toLogin}
        </Text>
      </Pressable>
    </View>
  ) : null

  return (
    <AuthPageLayout
      title={isLogin ? strings.auth.loginTitle : strings.auth.registerTitle}
      subtitle={isLogin ? strings.auth.loginSubtitle : strings.auth.registerSubtitle}
      footer={footer}
    >
      <AuthScreen
        mode={mode}
        theme="light"
        hideTitle
        hideModeSwitch
        embedded
        {...authProps}
      />
    </AuthPageLayout>
  )
}

const styles = StyleSheet.create({
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footerMuted: {
    fontSize: 14,
    color: authLayoutColors.muted,
  },
  footerLink: {
    fontSize: 14,
    color: authLayoutColors.accent,
    fontWeight: '500',
  },
})
