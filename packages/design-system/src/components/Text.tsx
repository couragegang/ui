import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native'
import { colors, fontSize } from '../tokens'

export type TextProps = RNTextProps & {
  variant?: 'body' | 'muted' | 'title'
}

export function Text({ variant = 'body', style, ...rest }: TextProps) {
  return (
    <RNText
      style={[styles.base, variant === 'muted' && styles.muted, variant === 'title' && styles.title, style]}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  muted: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
})
