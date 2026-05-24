import { useEffect, useState } from 'react'
import type { BffApi } from '@couragegang/api-client'
import { ApiError } from '@couragegang/api-client'
import type { NotionResourceItem } from '@couragegang/shared/types'

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
    const timer = window.setTimeout(() => {
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
      window.clearTimeout(timer)
    }
  }, [api, workspaceId, integrationToken, value, onChange])

  if (!integrationToken.trim()) return null

  return (
    <div className="notion-target-picker">
      <label>
        {strings.mcp.notionPickDatabase}
        <select
          className="select"
          value={value}
          disabled={disabled || loading || items.length === 0}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">
            {loading
              ? strings.mcp.notionLoadingDatabases
              : items.length === 0
                ? strings.mcp.notionNoDatabases
                : strings.mcp.notionSelectDatabase}
          </option>
          {items.map((db) => (
            <option key={db.id} value={db.id}>
              {db.title ?? db.id.slice(0, 8)}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="error">{error}</p>}
      {!loading && items.length > 0 && (
        <p className="muted">{strings.mcp.notionAutoIfEmpty}</p>
      )}
    </div>
  )
}
