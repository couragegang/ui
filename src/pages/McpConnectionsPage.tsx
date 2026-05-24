import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { fetchInstallations } from '../lib/api'
import type { McpInstallation } from '../lib/types'

export function McpConnectionsPage() {
  const { t } = useTranslation()
  const { workspaceId } = useAuth()
  const [items, setItems] = useState<McpInstallation[]>([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!workspaceId) return
    try {
      const res = await fetchInstallations(workspaceId)
      setItems(res.items ?? [])
    } catch (e) {
      setError(String(e))
    }
  }, [workspaceId])

  useEffect(() => {
    void load()
  }, [load])

  if (!workspaceId) return <p className="muted">{t('context.noWorkspace')}</p>

  return (
    <div className="page">
      <h1>{t('nav.connections')}</h1>
      <button type="button" className="btn ghost" onClick={() => void load()}>
        {t('common.refresh')}
      </button>
      {error && <p className="error">{error}</p>}
      {items.length === 0 && <p className="muted">{t('connections.empty')}</p>}
      <ul className="card-list">
        {items.map((i) => (
          <li key={i.id} className="card">
            <div className="card-title">{i.displayLabel ?? i.connectorKey}</div>
            <div className="muted">{i.connectorKey}</div>
            <span className="badge">{i.status ?? 'active'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
