import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native'
import { colors, spacing } from '@couragegang/design-system/tokens'

export type ScreenProps = {
  children: ReactNode
  scroll?: boolean
  padded?: boolean
  /** false — без flex:1 (вложенная форма, напр. auth-карточка на web) */
  fill?: boolean
  style?: ViewStyle
  backgroundColor?: string
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  fill = true,
  style,
  backgroundColor = colors.bg,
}: ScreenProps) {
  const rootStyle = [fill ? styles.rootFill : styles.rootAuto, { backgroundColor }]
  const content = (
    <View style={[padded && styles.padded, style]}>{children}</View>
  )
  if (!scroll) {
    return <View style={rootStyle}>{content}</View>
  }
  return (
    <ScrollView
      style={rootStyle}
      contentContainerStyle={[styles.scrollContent, !fill && styles.scrollAuto]}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  rootFill: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  rootAuto: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollAuto: {
    flexGrow: 0,
  },
  padded: {
    padding: spacing.lg,
    gap: spacing.md,
  },
})
