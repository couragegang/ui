import { forwardRef } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { spacing } from '@couragegang/design-system/tokens'

import type { ChatMessage } from '@couragegang/shared/types'

import { ChatMessageBubble } from './ChatMessageBubble'
import { ChatTypingRow } from './ChatTypingRow'

export type ChatMessageListProps = {
  messages: ChatMessage[]
  loading: boolean
  hitlBusy: boolean
  onApprove?: (index: number) => void
  onReject?: (index: number) => void
}

export const ChatMessageList = forwardRef<ScrollView, ChatMessageListProps>(function ChatMessageList(
  { messages, loading, hitlBusy, onApprove, onReject },
  ref,
) {
  return (
    <ScrollView
      ref={ref}
      style={styles.log}
      contentContainerStyle={styles.logContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      {messages.map((m, i) => (
        <ChatMessageBubble
          key={m.id ?? i}
          message={m}
          hitlBusy={hitlBusy}
          onApprove={
            m.status === 'awaiting_approval' ? () => onApprove?.(i) : undefined
          }
          onReject={
            m.status === 'awaiting_approval' ? () => onReject?.(i) : undefined
          }
        />
      ))}
      {loading && <ChatTypingRow />}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  log: { flex: 1 },
  logContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
})
