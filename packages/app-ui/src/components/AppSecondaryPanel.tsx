import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, fontSize, spacing } from '@couragegang/design-system/tokens'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { strings } from '../strings'

type Props = {
  title: string
  onBack: () => void
  children: ReactNode
}

export function AppSecondaryPanel({ title, onBack, children }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.panel, { paddingTop: insets.top }]}>
      <View style={styles.head}>
        <Pressable style={styles.back} onPress={onBack} accessibilityRole="button">
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backLabel}>{strings.app.backToChat}</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 150,
    elevation: 151,
    backgroundColor: colors.surface,
  },
  head: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backChevron: { fontSize: 22, color: colors.primary, lineHeight: 24 },
  backLabel: { fontSize: fontSize.md, color: colors.primary, fontWeight: '500' },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    minWidth: 120,
  },
  body: {
    flex: 1,
    backgroundColor: colors.bg,
  },
})
