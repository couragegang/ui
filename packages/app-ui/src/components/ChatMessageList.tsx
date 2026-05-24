import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, radius, spacing, fontSize } from '@couragegang/design-system/tokens'

import type { ChatMessage } from '@couragegang/shared/types'

import { strings } from '../strings'

const URL_RE = /https?:\/\/[^\s<>"']+/g

function linkifyContent(content: string) {
  const parts: { type: 'text' | 'url'; value: string }[] = []
  let last = 0
  for (const match of content.matchAll(URL_RE)) {
    const idx = match.index ?? 0
    if (idx > last) parts.push({ type: 'text', value: content.slice(last, idx) })
    parts.push({ type: 'url', value: match[0] })
    last = idx + match[0].length
  }
  if (last < content.length) parts.push({ type: 'text', value: content.slice(last) })
  return parts.length ? parts : [{ type: 'text' as const, value: content }]
}

export type ChatMessageListProps = {
  messages: ChatMessage[]
  loading: boolean
  hitlBusy: boolean
  onApprove?: (index: number) => void
  onReject?: (index: number) => void
}

export function ChatMessageList({ messages, loading, hitlBusy, onApprove, onReject }: ChatMessageListProps) {
  return (
    <ScrollView style={styles.log} contentContainerStyle={styles.logContent}>
      {messages.map((m, i) => (
        <View
          key={m.id ?? i}
          style={[styles.row, m.role === 'user' ? styles.rowUser : styles.rowAssistant]}
        >
          <Text style={styles.role}>{m.role === 'user' ? 'Вы' : 'AI'}</Text>
          <View style={styles.bubble}>
            {linkifyContent(m.content).map((p, j) =>
              p.type === 'url' ? (
                <Text
                  key={j}
                  style={styles.link}
                  onPress={() => void Linking.openURL(p.value)}
                >
                  {p.value}
                </Text>
              ) : (
                <Text key={j}>{p.value}</Text>
              ),
            )}
          </View>
          {m.status === 'awaiting_approval' && !m.hitlResolved && (
            <View style={styles.hitl}>
              <Pressable
                style={[styles.hitlBtn, styles.hitlApprove]}
                disabled={hitlBusy}
                onPress={() => onApprove?.(i)}
              >
                <Text style={styles.hitlBtnText}>{strings.chat.approve}</Text>
              </Pressable>
              <Pressable
                style={[styles.hitlBtn, styles.hitlReject]}
                disabled={hitlBusy}
                onPress={() => onReject?.(i)}
              >
                <Text style={styles.hitlBtnText}>{strings.chat.reject}</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}
      {loading && (
        <Text variant="muted" style={styles.typing}>
          {strings.chat.thinking}
        </Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  log: { flex: 1 },
  logContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  row: { gap: spacing.xs },
  rowUser: { alignItems: 'flex-end' },
  rowAssistant: { alignItems: 'flex-start' },
  role: { fontSize: fontSize.sm, color: colors.textMuted },
  bubble: {
    maxWidth: '90%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  link: { color: colors.primary, textDecorationLine: 'underline' },
  hitl: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  hitlBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  hitlApprove: { backgroundColor: colors.success },
  hitlReject: { backgroundColor: colors.danger },
  hitlBtnText: { color: '#fff', fontWeight: '600', fontSize: fontSize.sm },
  typing: { paddingHorizontal: spacing.md },
})
