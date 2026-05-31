import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { NotionResourceItem } from '@couragegang/shared/types'
import { ApiError, discoverTrelloBoards } from '../../lib/api'

type Props = {
  workspaceId: string
  apiKey: string
  token: string
  value: string
  onChange: (boardName: string) => void
  disabled?: boolean
}

export function TrelloBoardPicker({ workspaceId, apiKey, token, value, onChange, disabled }: Props) {
  const { t } = useTranslation()
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
      void discoverTrelloBoards(workspaceId, key, tok)
        .then((res) => {
          if (cancelled) return
          const list = res.items ?? []
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onChange стабилен у родителя
  }, [workspaceId, apiKey, token, value])

  if (!apiKey.trim() || !token.trim()) {
    return null
  }

  return (
    <div className="trello-board-picker">
      <label>
        {t('mcp.trelloPickBoard')}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading || items.length === 0}
        >
          <option value="">
            {loading
              ? t('mcp.trelloLoadingBoards')
              : items.length === 0
                ? t('mcp.trelloNoBoards')
                : t('mcp.trelloSelectBoard')}
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
        <p className="muted">{t('mcp.trelloAutoIfEmpty')}</p>
      )}
    </div>
  )
}
