import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { NotionResourceItem } from '@couragegang/shared/types'
import { ApiError, discoverNotionDatabases } from '../../lib/api'

type Props = {
  workspaceId: string
  integrationToken: string
  value: string
  onChange: (databaseId: string) => void
  disabled?: boolean
}

export function NotionTargetPicker({ workspaceId, integrationToken, value, onChange, disabled }: Props) {
  const { t } = useTranslation()
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
      void discoverNotionDatabases(workspaceId, token)
        .then((res) => {
          if (cancelled) return
          const list = res.items ?? []
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onChange стабилен у родителя
  }, [workspaceId, integrationToken, value])

  if (!integrationToken.trim()) {
    return null
  }

  return (
    <div className="notion-target-picker">
      <label>
        {t('mcp.notionPickDatabase')}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading || items.length === 0}
        >
          <option value="">
            {loading
              ? t('mcp.notionLoadingDatabases')
              : items.length === 0
                ? t('mcp.notionNoDatabases')
                : t('mcp.notionSelectDatabase')}
          </option>
          {items.map((db) => (
            <option key={db.id} value={db.id}>
              {db.title}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="error">{error}</p>}
      {!loading && items.length > 0 && (
        <p className="muted">{t('mcp.notionAutoIfEmpty')}</p>
      )}
    </div>
  )
}
