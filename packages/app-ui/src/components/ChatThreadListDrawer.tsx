import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, fontSize, radius, spacing } from '@couragegang/design-system/tokens'
import type { Conversation } from '@couragegang/shared/types'

import { strings } from '../strings'

export type ChatThreadListDrawerProps = {
  conversations: Conversation[]
  activeId: string | null
  showArchived: boolean
  onToggleArchived: () => void
  onSelect: (id: string) => void
  onNew: () => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onAfterSelect?: () => void
  onAfterNew?: () => void
}

export function ChatThreadListDrawer({
  conversations,
  activeId,
  showArchived,
  onToggleArchived,
  onSelect,
  onNew,
  onArchive,
  onDelete,
  onAfterSelect,
  onAfterNew,
}: ChatThreadListDrawerProps) {
  function confirmDelete(id: string) {
    Alert.alert(strings.chat.delete, strings.chat.deleteConfirm, [
      { text: strings.common.cancel, style: 'cancel' },
      { text: strings.chat.delete, style: 'destructive', onPress: () => onDelete(id) },
    ])
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.newBtn}
        onPress={() => {
          onNew()
          onAfterNew?.()
        }}
      >
        <Text style={styles.newBtnText}>+ {strings.chat.newChat}</Text>
      </Pressable>
      <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
        {conversations.map((c) => {
          const active = c.id === activeId
          return (
            <View key={c.id} style={[styles.item, active && styles.itemActive]}>
              <Pressable
                style={styles.threadBtn}
                onPress={() => {
                  onSelect(c.id)
                  onAfterSelect?.()
                }}
              >
                <Text style={[styles.threadTitle, active && styles.threadTitleActive]} numberOfLines={1}>
                  {c.title ?? strings.chat.untitled}
                </Text>
                {c.status === 'archived' && (
                  <Text style={styles.badge}>{strings.chat.archivedBadge}</Text>
                )}
              </Pressable>
              <View style={styles.actions}>
                {c.status !== 'archived' && (
                  <Pressable onPress={() => onArchive(c.id)} hitSlop={8}>
                    <Text style={styles.actionText}>{strings.chat.archive}</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => confirmDelete(c.id)} hitSlop={8}>
                  <Text style={[styles.actionText, styles.actionDanger]}>{strings.chat.delete}</Text>
                </Pressable>
              </View>
            </View>
          )
        })}
        {conversations.length === 0 && (
          <Text variant="muted" style={styles.empty}>
            {strings.chat.noChats}
          </Text>
        )}
      </ScrollView>
      <View style={styles.archivedRow}>
        <Text variant="muted" style={styles.archivedLabel}>
          {strings.chat.showArchived}
        </Text>
        <Switch value={showArchived} onValueChange={onToggleArchived} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  newBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  newBtnText: { color: colors.primary, fontWeight: '600', fontSize: fontSize.md },
  list: { maxHeight: 320 },
  item: {
    borderRadius: radius.md,
    marginBottom: 2,
    overflow: 'hidden',
  },
  itemActive: {
    backgroundColor: colors.accentSoft,
  },
  threadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  threadTitle: { flex: 1, fontSize: fontSize.md, color: colors.text },
  threadTitleActive: { fontWeight: '600' },
  badge: { fontSize: 10, color: colors.textMuted },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  actionText: { fontSize: fontSize.sm, color: colors.primary },
  actionDanger: { color: colors.danger },
  empty: { padding: spacing.md },
  archivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  archivedLabel: { fontSize: fontSize.sm },
})
