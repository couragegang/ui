import { StyleSheet, View } from 'react-native'
import { Button, Text } from '@couragegang/design-system'
import { colors, fontSize, radius, spacing } from '@couragegang/design-system/tokens'
import type { ChatMessage } from '@couragegang/shared/types'
import { formatMessageTimestamp } from '@couragegang/shared/format-message-time'

import { strings } from '../strings'
import { ChatMessageContent } from './ChatMessageContent'

type Props = {
  message: ChatMessage
  onApprove?: () => void
  onReject?: () => void
  hitlBusy?: boolean
}

export function ChatMessageBubble({ message, onApprove, onReject, hitlBusy }: Props) {
  const isUser = message.role === 'user'
  const isPlanApproval = message.status === 'awaiting_plan_approval'
  const awaiting =
    message.role === 'assistant' &&
    (message.status === 'awaiting_approval' || isPlanApproval) &&
    message.pendingApprovalId &&
    !message.hitlResolved

  const isError = message.status === 'error'
  const showStatus =
    message.status &&
    message.status !== 'completed' &&
    message.status !== 'ok' &&
    !isError &&
    !message.hitlResolved

  const timeLabel = formatMessageTimestamp(message.createdAt)

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.rowInner, isUser && styles.rowInnerUser]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AI</Text>
          </View>
        )}
        <View style={[styles.content, isUser && styles.contentUser]}>
          {isUser ? (
            <View style={styles.userBubble}>
              <ChatMessageContent content={message.content} compact />
            </View>
          ) : (
            <View style={isError ? styles.errorBubble : undefined}>
              <ChatMessageContent content={message.content} />
            </View>
          )}

          {showStatus ? (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{message.status}</Text>
            </View>
          ) : null}

          {awaiting && (
            <View style={styles.hitl}>
              <Text variant="muted" style={styles.hitlPrompt}>
                {strings.chat.hitlPrompt}
              </Text>
              <View style={styles.hitlActions}>
                <Button
                  title={isPlanApproval ? strings.chat.approvePlan : strings.chat.approve}
                  disabled={hitlBusy}
                  onPress={onApprove}
                  style={styles.hitlBtn}
                />
                <Button
                  title={strings.chat.reject}
                  variant="secondary"
                  disabled={hitlBusy}
                  onPress={onReject}
                  style={styles.hitlBtn}
                />
              </View>
            </View>
          )}

          {message.hitlResolved === 'approved' && (
            <Text style={styles.hitlApproved}>{strings.chat.hitlApproved}</Text>
          )}
          {message.hitlResolved === 'rejected' && (
            <Text variant="muted" style={styles.hitlRejected}>
              {strings.chat.hitlRejected}
            </Text>
          )}
          {timeLabel ? (
            <Text variant="muted" style={[styles.messageTime, isUser && styles.messageTimeUser]}>
              {timeLabel}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
    paddingVertical: spacing.sm + 4,
  },
  rowUser: {},
  rowAssistant: {},
  rowInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 4,
    width: '100%',
  },
  rowInnerUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingTop: 4,
  },
  contentUser: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 1,
    maxWidth: '85%',
    paddingTop: 0,
  },
  userBubble: {
    backgroundColor: '#f4f4f5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
  },
  statusBadgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  hitl: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  hitlPrompt: {
    lineHeight: 20,
  },
  hitlActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hitlBtn: {
    minWidth: 120,
  },
  hitlApproved: {
    marginTop: spacing.sm,
    color: colors.success,
    fontSize: fontSize.sm,
  },
  hitlRejected: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
  },
  messageTime: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textMuted,
  },
  messageTimeUser: {
    alignSelf: 'flex-end',
  },
  errorBubble: {
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    paddingLeft: spacing.sm,
  },
})
