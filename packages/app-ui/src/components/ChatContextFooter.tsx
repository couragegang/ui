import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, fontSize, radius, spacing } from '@couragegang/design-system/tokens'
import type { Workspace } from '@couragegang/shared/types'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'

export const FOOTER_BAR_MIN_HEIGHT = 52

export type DrawerFocusSection = 'chats' | 'tools' | 'context' | 'account'

type Props = {
  onOpenMenu: (section?: DrawerFocusSection) => void
}

function avatarInitials(displayName?: string | null, email?: string | null): string {
  const name = displayName?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  const mail = email?.trim()
  if (mail) return mail.slice(0, 2).toUpperCase()
  return '?'
}

function workspaceLabel(w: Workspace) {
  return w.name?.trim() || w.slug || w.id.slice(0, 8)
}

export function ChatContextFooter({ onOpenMenu }: Props) {
  const insets = useSafeAreaInsets()
  const {
    userDisplayName,
    userEmail,
    orgLabel,
    groupLabel,
    workspaces,
    workspaceId,
    me,
  } = useAuth()

  const initials = avatarInitials(userDisplayName, userEmail)
  const workspace = workspaces.find((w) => w.id === workspaceId)
  const wsLabel = workspace ? workspaceLabel(workspace) : null
  const contextLine = [orgLabel, groupLabel, wsLabel].filter(Boolean).join(' · ') || strings.app.contextUnset
  const displayName = userDisplayName?.trim() || userEmail || strings.app.guest
  const metaLine = me?.orgId ? contextLine : strings.context.noWorkspace

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      <Pressable
        style={styles.menuBtn}
        onPress={() => onOpenMenu('chats')}
        accessibilityRole="button"
        accessibilityLabel={strings.nav.menu}
      >
        <MenuIcon />
        <Text style={styles.menuLabel}>{strings.nav.menu}</Text>
      </Pressable>
      <Pressable
        style={styles.summary}
        onPress={() => onOpenMenu('context')}
        accessibilityRole="button"
        accessibilityLabel={strings.app.openContext}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {metaLine}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </View>
  )
}

function MenuIcon() {
  return (
    <View style={styles.menuIcon}>
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.chatSidebar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    minHeight: FOOTER_BAR_MIN_HEIGHT,
  },
  menuBtn: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
  },
  menuIcon: { gap: 3, width: 20 },
  menuLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.text,
  },
  menuLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
  },
  summary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: 6,
    marginHorizontal: 8,
    marginLeft: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  textCol: { flex: 1, minWidth: 0 },
  name: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted },
  chevron: { fontSize: 18, color: colors.textMuted, marginLeft: spacing.xs },
})
