import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '@couragegang/design-system'
import { spacing } from '@couragegang/design-system/tokens'
import type { BffApi } from '@couragegang/api-client'
import { ApiError } from '@couragegang/api-client'
import type { NotionResourceItem } from '@couragegang/shared/types'

import { SelectField } from './SelectField'
import { strings } from '../strings'

export type TrelloBoardPickerProps = {
  api: BffApi
  workspaceId: string
  apiKey: string
  token: string
  value: string
  onChange: (boardName: string) => void
  disabled?: boolean
}

export function TrelloBoardPicker({
  api,
  workspaceId,
  apiKey,
  token,
  value,
  onChange,
  disabled,
}: TrelloBoardPickerProps) {
  const [items, setItems] = useState<NotionResourceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const key = apiKey.trim()
    const tok = token.trim()
    if (!workspaceId || key.length < 8 || tok.length < 8) {
      setItems([])
      setError('')
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      setLoading(true)
      setError('')
      void api
        .discoverTrello(workspaceId, key, tok)
        .then((res) => {
          if (cancelled) return
          const list = ((res as { items?: NotionResourceItem[] }).items ?? []) as NotionResourceItem[]
          setItems(list)
          if (list.length === 1 && !value) {
            onChange(list[0].title ?? list[0].id)
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
  }, [api, workspaceId, apiKey, token, value, onChange])

  if (!apiKey.trim() || !token.trim()) return null

  const options = items.map((board) => ({
    id: board.title ?? board.id,
    label: board.title ?? board.id.slice(0, 8),
  }))

  return (
    <View style={styles.wrap}>
      <SelectField
        label={loading ? strings.mcp.trelloLoadingBoards : strings.mcp.trelloPickBoard}
        value={value}
        options={options}
        onChange={onChange}
        placeholder={
          items.length === 0 && !loading
            ? strings.mcp.trelloNoBoards
            : strings.mcp.trelloSelectBoard
        }
        disabled={disabled || loading}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && items.length > 0 ? (
        <Text variant="muted">{strings.mcp.trelloAutoIfEmpty}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  error: { color: '#ef4444', fontSize: 13 },
})
