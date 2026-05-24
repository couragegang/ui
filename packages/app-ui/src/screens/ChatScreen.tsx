import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { colors, spacing } from '@couragegang/design-system/tokens'
import { useChat } from '@couragegang/shared/hooks'

import { ChatEmptyWelcome } from '../components/ChatEmptyWelcome'
import { ChatInput } from '../components/ChatInput'
import { ChatMessageList } from '../components/ChatMessageList'
import { ErrorBanner } from '../components/ErrorBanner'
import { useChatDrawerRegistration } from '../context/ChatDrawerContext'
import { useAuth } from '../context/AuthProvider'
import type { ChatDrawerBridgeState } from '../chat-drawer-bridge'
import { strings } from '../strings'
import type { ChatScreenProps } from './ChatScreen.types'

export type { ChatScreenProps } from './ChatScreen.types'

export function ChatScreen({
  api,
  chatStorage,
  keyboardOpen = false,
  onDrawerState,
}: ChatScreenProps) {
  const { me, workspaceId } = useAuth()
  const listRef = useRef<ScrollView>(null)
  const {
    threads,
    activeId,
    messages,
    input,
    setInput,
    loading,
    hitlBusy,
    error,
    showArchived,
    onSelectThread,
    onToggleArchived,
    onNewChat,
    onSend,
    onHitlDecision,
    onArchiveThread,
    onDeleteThread,
  } = useChat({
    api,
    workspaceId,
    userId: me?.userId,
    chatStorage,
    strings: {
      hitlRejected: strings.chat.hitlRejected,
      toolDoneEmpty: strings.chat.toolDoneEmpty,
    },
  })

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true })
    })
  }, [])

  useEffect(() => {
    if (keyboardOpen && messages.length > 0) {
      scrollToEnd()
    }
  }, [keyboardOpen, messages.length, scrollToEnd])

  const onDeleteThreadConfirm = useCallback(
    (id: string) => {
      Alert.alert(strings.chat.delete, strings.chat.deleteConfirm, [
        { text: strings.common.cancel, style: 'cancel' },
        { text: strings.chat.delete, style: 'destructive', onPress: () => void onDeleteThread(id) },
      ])
    },
    [onDeleteThread],
  )

  const drawerBridge = useMemo<ChatDrawerBridgeState | null>(() => {
    if (!workspaceId) return null
    return {
      conversations: threads,
      activeId,
      showArchived,
      onToggleArchived,
      onSelect: onSelectThread,
      onNew: onNewChat,
      onArchive: (id) => void onArchiveThread(id),
      onDelete: onDeleteThreadConfirm,
    }
  }, [
    workspaceId,
    threads,
    activeId,
    showArchived,
    onToggleArchived,
    onSelectThread,
    onNewChat,
    onArchiveThread,
    onDeleteThreadConfirm,
  ])

  useChatDrawerRegistration(onDrawerState ? null : drawerBridge)

  useEffect(() => {
    onDrawerState?.(drawerBridge)
  }, [onDrawerState, drawerBridge])

  if (!workspaceId) {
    return (
      <View style={styles.root}>
        <View style={styles.setup}>
          <ChatEmptyWelcome title={strings.context.noWorkspace} />
          <Text variant="muted" style={styles.setupHint}>
            {strings.app.setupHint}
          </Text>
        </View>
      </View>
    )
  }

  const isEmptyView = messages.length === 0

  return (
    <View style={styles.root}>
      {isEmptyView ? (
        <View style={styles.emptyStage}>
          <View style={styles.emptyTop}>
            <ChatEmptyWelcome />
          </View>
          <View style={styles.emptyComposer}>
            <ChatInput
              value={input}
              onChangeText={setInput}
              onSend={() => void onSend()}
              onFocus={scrollToEnd}
              disabled={loading || hitlBusy}
            />
          </View>
          <ErrorBanner message={error} />
        </View>
      ) : (
        <>
          <ChatMessageList
            ref={listRef}
            messages={messages}
            loading={loading}
            hitlBusy={hitlBusy}
            onApprove={(i) => void onHitlDecision(i, 'approve')}
            onReject={(i) => void onHitlDecision(i, 'reject')}
          />
          <ErrorBanner message={error} />
          <ChatInput
            value={input}
            onChangeText={setInput}
            onSend={() => void onSend()}
            onFocus={scrollToEnd}
            disabled={loading || hitlBusy}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.chatMain },
  setup: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  setupHint: { textAlign: 'center', lineHeight: 21 },
  emptyStage: {
    flex: 1,
  },
  emptyTop: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyComposer: {
    paddingHorizontal: spacing.md,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
})
