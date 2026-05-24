import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { spacing } from '@couragegang/design-system/tokens'

import { Screen } from './Screen'
import { authLayoutColors } from '../theme'

export type AuthPageLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthPageLayout({ title, subtitle, children, footer }: AuthPageLayoutProps) {
  const body = (
    <Screen
      fill
      scroll
      safeArea
      keyboardDismiss
      padded={false}
      backgroundColor={authLayoutColors.pageBg}
    >
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>CG</Text>
            </View>
            <Text style={styles.product}>Courage Gang</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.body}>{children}</View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Screen>
  )

  if (Platform.OS === 'web') return body

  return (
    <KeyboardAvoidingView
      style={styles.nativeRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {body}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  nativeRoot: { flex: 1, backgroundColor: authLayoutColors.pageBg },
  center: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    backgroundColor: authLayoutColors.cardBg,
    borderWidth: 1,
    borderColor: authLayoutColors.border,
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 28,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: authLayoutColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  product: {
    fontSize: 15,
    fontWeight: '700',
    color: authLayoutColors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: authLayoutColors.text,
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: authLayoutColors.muted,
    marginBottom: 24,
  },
  body: {
    gap: spacing.md,
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: authLayoutColors.border,
    alignItems: 'center',
  },
})
