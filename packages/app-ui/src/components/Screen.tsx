import type { ReactNode } from 'react'
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '@couragegang/design-system/tokens'

export type ScreenProps = {
  children: ReactNode
  scroll?: boolean
  padded?: boolean
  /** false — без flex:1 (вложенная форма, напр. auth-карточка на web) */
  fill?: boolean
  /** Отступы под notch / home indicator (native) */
  safeArea?: boolean
  /** Тап по фону скрывает клавиатуру (native) */
  keyboardDismiss?: boolean
  style?: ViewStyle
  backgroundColor?: string
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  fill = true,
  safeArea = false,
  keyboardDismiss = false,
  style,
  backgroundColor = colors.bg,
}: ScreenProps) {
  const rootStyle = [fill ? styles.rootFill : styles.rootAuto, { backgroundColor }]
  const contentStyle = [padded && styles.padded, style]

  const scrollChildren =
    keyboardDismiss && Platform.OS !== 'web' ? (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[fill && styles.scrollPressable, padded && styles.padded, style]}>{children}</View>
      </TouchableWithoutFeedback>
    ) : (
      <View style={[padded && styles.padded, style]}>{children}</View>
    )

  const body = scroll ? (
    <ScrollView
      style={fill ? styles.flex : undefined}
      contentContainerStyle={[
        styles.scrollContent,
        fill && styles.scrollFill,
        !fill && styles.scrollAuto,
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={keyboardDismiss ? 'interactive' : 'none'}
      showsVerticalScrollIndicator={false}
    >
      {scrollChildren}
    </ScrollView>
  ) : (
    <View style={contentStyle}>{children}</View>
  )

  const dismissWrap = body

  const frame = safeArea ? (
    <SafeAreaView style={rootStyle} edges={['top', 'bottom']}>
      {dismissWrap}
    </SafeAreaView>
  ) : (
    <View style={rootStyle}>{dismissWrap}</View>
  )

  return frame
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  scrollFill: {
    justifyContent: 'flex-start',
  },
  scrollAuto: {
    flexGrow: 0,
  },
  scrollPressable: {
    flexGrow: 1,
  },
  padded: {
    padding: spacing.lg,
    gap: spacing.md,
  },
})
