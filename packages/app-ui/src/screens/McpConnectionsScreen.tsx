import { useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'
import { McpInstallationEditSheet } from '../components/McpInstallationEditSheet'
import { Button, Text } from '@couragegang/design-system'
import { colors, radius, spacing, fontSize } from '@couragegang/design-system/tokens'
import type { BffApi } from '@couragegang/api-client'
import { ApiError } from '@couragegang/api-client'
import { useWorkspaceInstallations } from '@couragegang/shared/hooks'
import type { McpInstallation } from '@couragegang/shared/types'

import { ErrorBanner } from '../components/ErrorBanner'
import { Screen } from '../components/Screen'
import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'

export type McpConnectionsScreenProps = {
  api: BffApi
  onAddMore?: () => void
  /** Внутри AppSecondaryPanel — без дублирующего заголовка */
  hideHeader?: boolean
}

export function McpConnectionsScreen({ api, onAddMore, hideHeader }: McpConnectionsScreenProps) {
  const { workspaceId } = useAuth()
  const { items, loading, error, reload } = useWorkspaceInstallations(api, workspaceId)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState<McpInstallation | null>(null)

  if (!workspaceId) {
    return (
      <Screen>
        <Text variant="muted">{strings.context.noWorkspace}</Text>
      </Screen>
    )
  }

  async function onHealth(item: McpInstallation) {
    setBusyId(item.id)
    setMessage('')
    try {
      const res = (await api.healthInstallation(workspaceId!, item.id)) as {
        ok?: boolean
        message?: string
      }
      setMessage(
        res.ok ? strings.connections.healthOk : strings.connections.healthFail(res.message ?? ''),
      )
      await reload()
    } catch (e) {
      setMessage(String(e))
    } finally {
      setBusyId(null)
    }
  }

  function onDelete(item: McpInstallation) {
    Alert.alert(strings.connections.delete, strings.connections.deleteConfirm, [
      { text: strings.common.cancel, style: 'cancel' },
      {
        text: strings.connections.delete,
        style: 'destructive',
        onPress: () => void doDelete(item),
      },
    ])
  }

  async function doDelete(item: McpInstallation) {
    setMessage('')
    setBusyId(item.id)
    try {
      await api.deleteInstallation(workspaceId!, item.id)
      setMessage(strings.connections.deleted)
      await reload()
    } catch (e) {
      setMessage(e instanceof ApiError ? (e.body ?? e.message) : String(e))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Screen>
      {!hideHeader && (
        <View style={styles.head}>
          <Text variant="title" style={styles.flex}>
            {strings.connections.title}
          </Text>
          {onAddMore && (
            <Button title={strings.connections.addMore} variant="secondary" onPress={onAddMore} />
          )}
        </View>
      )}
      {hideHeader && onAddMore && (
        <Button title={strings.connections.addMore} variant="secondary" onPress={onAddMore} />
      )}
      <Button title={strings.common.refresh} variant="ghost" onPress={() => void reload()} loading={loading} />
      <ErrorBanner message={error} />
      {message ? <Text style={styles.ok}>{message}</Text> : null}
      {items.length === 0 && !loading && <Text variant="muted">{strings.connections.empty}</Text>}
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.displayLabel ?? item.connectorKey}</Text>
          <Text variant="muted">{item.connectorKey}</Text>
          <Text variant="muted">{item.status ?? 'active'}</Text>
          <View style={styles.actions}>
            <Pressable
              style={styles.actionBtn}
              disabled={busyId === item.id}
              onPress={() => setEditing(item)}
            >
              <Text style={styles.actionText}>{strings.connections.edit}</Text>
            </Pressable>
            <Pressable
              style={styles.actionBtn}
              disabled={busyId === item.id}
              onPress={() => void onHealth(item)}
            >
              <Text style={styles.actionText}>{strings.connections.health}</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.dangerBtn]}
              disabled={busyId === item.id}
              onPress={() => onDelete(item)}
            >
              <Text style={styles.actionText}>{strings.connections.delete}</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <McpInstallationEditSheet
        api={api}
        workspaceId={workspaceId}
        installation={editing}
        visible={!!editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          void reload()
        }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  ok: { color: colors.success },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  dangerBtn: { backgroundColor: colors.danger },
  actionText: { color: '#fff', fontSize: fontSize.sm, fontWeight: '600' },
})
