import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'

import {
  buildOauthStartUrl,
  buildRedirectAfter,
  resolveAppOrigin,
  type OidcProvider,
} from '../auth/oauth'
import { strings } from '../strings'

export type OAuthProviderButtonsProps = {
  mode?: 'login' | 'register'
  returnPath?: string
  apiBaseUrl?: string
  appOrigin?: string
}

export function OAuthProviderButtons({
  mode = 'login',
  returnPath = '/chat',
  apiBaseUrl = '/api',
  appOrigin,
}: OAuthProviderButtonsProps) {
  const origin = appOrigin ?? resolveAppOrigin(apiBaseUrl)
  const redirectAfter = buildRedirectAfter(returnPath, origin)

  const googleLabel = mode === 'register' ? strings.auth.signUpGoogle : strings.auth.continueGoogle
  const githubLabel = mode === 'register' ? strings.auth.signUpGithub : strings.auth.continueGithub

  function openProvider(provider: OidcProvider) {
    const url = buildOauthStartUrl(provider, redirectAfter, apiBaseUrl)
    void Linking.openURL(url)
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [styles.btn, styles.google, pressed && styles.pressed]}
        onPress={() => openProvider('google')}
        accessibilityRole="button"
      >
        <Text style={styles.btnText}>{googleLabel}</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.btn, styles.github, pressed && styles.pressed]}
        onPress={() => openProvider('github')}
        accessibilityRole="button"
      >
        <Text style={[styles.btnText, styles.githubText]}>{githubLabel}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  btn: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  google: {
    backgroundColor: '#fff',
    borderColor: '#dadce0',
  },
  github: {
    backgroundColor: '#24292f',
    borderColor: '#24292f',
  },
  btnText: { fontSize: 15, fontWeight: '600', color: '#1f1f1f' },
  githubText: { color: '#fff' },
  pressed: { opacity: 0.88 },
})
