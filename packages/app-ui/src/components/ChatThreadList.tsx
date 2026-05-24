import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, radius, spacing, fontSize } from '@couragegang/design-system/tokens'

import type { Conversation } from '@couragegang/shared/types'

import { strings } from '../strings'

export type ChatThreadListProps = {
  threads: Conversation[]
  activeId: string | null
  showArchived: boolean
  onSelect: (id: string) => void
  onNew: () => void
  onToggleArchived: () => void
}

export function ChatThreadList({
  threads,
  activeId,
  showArchived,
  onSelect,
  onNew,
  onToggleArchived,
}: ChatThreadListProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Pressable style={styles.newBtn} onPress={onNew}>
          <Text style={styles.newBtnText}>+ {strings.chat.newChat}</Text>
        </Pressable>
        <Pressable onPress={onToggleArchived}>
          <Text variant="muted">{showArchived ? 'Активные' : strings.chat.archived}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {threads.map((t) => (
          <Pressable
            key={t.id}
            style={[styles.chip, t.id === activeId && styles.chipActive]}
            onPress={() => onSelect(t.id)}
          >
            <Text style={styles.chipTitle} numberOfLines={1}>
              {t.title ?? t.id.slice(0, 8)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  newBtn: {
    paddingVertical: spacing.xs,
  },
  newBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: 140,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceHover,
  },
  chipTitle: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
})
