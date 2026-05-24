import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { spacing } from '@couragegang/design-system/tokens'
import type { BffApi } from '@couragegang/api-client'
import { ApiError } from '@couragegang/api-client'
import type { NotionResourceItem } from '@couragegang/shared/types'

import { SelectField } from './SelectField'
import { strings } from '../strings'

export type NotionTargetPickerProps = {
  api: BffApi
  workspaceId: string
  integrationToken: string
  value: string
  onChange: (databaseId: string) => void
  disabled?: boolean
}

export function NotionTargetPicker({
  api,
  workspaceId,
  integrationToken,
  value,
  onChange,
  disabled,
}: NotionTargetPickerProps) {
  const [items, setItems] = useState<NotionResourceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = integrationToken.trim()
    if (!workspaceId || token.length < 10) {
      setItems([])
      setError('')
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      setLoading(true)
      setError('')
      void api
        .discoverNotion(workspaceId, token)
        .then((res) => {
          if (cancelled) return
          const list = ((res as { items?: NotionResourceItem[] }).items ?? []) as NotionResourceItem[]
          setItems(list)
          if (list.length === 1 && !value) {
            onChange(list[0].id)
          }
        })
        .catch((e) => {
          if (!cancelled) {
            setItems([])
            setError(e instanceof ApiError ? (e.body ?? e.message) : String(e))
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [api, workspaceId, integrationToken, value, onChange])

  if (!integrationToken.trim()) return null

  const options = items.map((db) => ({
    id: db.id,
    label: db.title ?? db.id.slice(0, 8),
  }))

  return (
    <View style={styles.wrap}>
      <SelectField
        label={loading ? strings.mcp.notionLoadingDatabases : strings.mcp.notionPickDatabase}
        value={value}
        options={options}
        onChange={onChange}
        placeholder={
          items.length === 0 && !loading
            ? strings.mcp.notionNoDatabases
            : strings.mcp.notionSelectDatabase
        }
        disabled={disabled || loading}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && items.length > 0 ? (
        <Text variant="muted">{strings.mcp.notionAutoIfEmpty}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  error: { color: '#ef4444', fontSize: 13 },
})
