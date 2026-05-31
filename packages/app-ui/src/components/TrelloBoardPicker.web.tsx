import { useEffect, useState } from 'react'
import type { BffApi } from '@couragegang/api-client'
import { ApiError } from '@couragegang/api-client'
import type { NotionResourceItem } from '@couragegang/shared/types'

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
    const timer = window.setTimeout(() => {
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
      window.clearTimeout(timer)
    }
  }, [api, workspaceId, apiKey, token, value, onChange])

  if (!apiKey.trim() || !token.trim()) return null

  return (
    <div className="trello-board-picker">
      <label>
        {strings.mcp.trelloPickBoard}
        <select
          className="select"
          value={value}
          disabled={disabled || loading || items.length === 0}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">
            {loading
              ? strings.mcp.trelloLoadingBoards
              : items.length === 0
                ? strings.mcp.trelloNoBoards
                : strings.mcp.trelloSelectBoard}
          </option>
          {items.map((board) => {
            const name = board.title ?? board.id
            return (
              <option key={board.id} value={name}>
                {name}
              </option>
            )
          })}
        </select>
      </label>
      {error && <p className="error">{error}</p>}
      {!loading && items.length > 0 && (
        <p className="muted">{strings.mcp.trelloAutoIfEmpty}</p>
      )}
    </div>
  )
}
