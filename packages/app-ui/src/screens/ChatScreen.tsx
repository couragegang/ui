import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { useChat } from '@couragegang/shared/hooks'

import { ChatInput } from '../components/ChatInput'
import { ChatMessageList } from '../components/ChatMessageList'
import { ChatThreadList } from '../components/ChatThreadList'
import { ContextBar } from '../components/ContextBar'
import { ErrorBanner } from '../components/ErrorBanner'
import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'
import type { ChatScreenProps } from './ChatScreen.types'

export type { ChatScreenProps } from './ChatScreen.types'

export function ChatScreen({ api, chatStorage, onDrawerState }: ChatScreenProps) {
  const { me, workspaceId } = useAuth()
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
  })

  useEffect(() => {
    if (!onDrawerState) return
    if (!workspaceId) {
      onDrawerState(null)
      return
    }
    onDrawerState({
      conversations: threads,
      activeId,
      showArchived,
      onToggleArchived,
      onSelect: onSelectThread,
      onNew: onNewChat,
      onArchive: (id) => void onArchiveThread(id),
      onDelete: (id) => void onDeleteThread(id),
    })
  }, [
    onDrawerState,
    workspaceId,
    threads,
    activeId,
    showArchived,
    onToggleArchived,
    onSelectThread,
    onNewChat,
    onArchiveThread,
    onDeleteThread,
  ])

  if (!workspaceId) {
    return (
      <View style={styles.root}>
        <ContextBar />
        <View style={styles.center}>
          <Text variant="muted">{strings.context.noWorkspace}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <ContextBar />
      <ChatThreadList
        threads={threads}
        activeId={activeId}
        showArchived={showArchived}
        onSelect={onSelectThread}
        onNew={onNewChat}
        onToggleArchived={onToggleArchived}
      />
      {messages.length === 0 ? (
        <View style={styles.center}>
          <Text variant="title">{strings.chat.empty}</Text>
        </View>
      ) : (
        <ChatMessageList
          messages={messages}
          loading={loading}
          hitlBusy={hitlBusy}
          onApprove={(i) => void onHitlDecision(i, 'approve')}
          onReject={(i) => void onHitlDecision(i, 'reject')}
        />
      )}
      <ErrorBanner message={error} />
      <ChatInput
        value={input}
        onChangeText={setInput}
        onSend={() => void onSend()}
        disabled={loading || hitlBusy}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f1419' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
})
