import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { fetchCatalog, installConnector, ApiError } from '../lib/api'
import type { McpCatalogItem } from '../lib/types'

export function McpMarketplacePage() {
  const { t } = useTranslation()
  const { workspaceId } = useAuth()
  const [catalog, setCatalog] = useState<McpCatalogItem[]>([])
  const [selected, setSelected] = useState<McpCatalogItem | null>(null)
  const [token, setToken] = useState('')
  const [label, setLabel] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    void fetchCatalog()
      .then((c) => setCatalog(c.items ?? []))
      .catch((e) => setError(String(e)))
  }, [])

  async function onInstall(e: FormEvent) {
    e.preventDefault()
    if (!selected || !workspaceId) return
    setError('')
    setMessage('')
    try {
      await installConnector(workspaceId, {
        connectorKey: selected.connectorKey,
        displayLabel: label || selected.displayName,
        form: { integration_token: token },
      })
      setMessage(t('mcp.installed'))
      setToken('')
    } catch (err) {
      setError(err instanceof ApiError ? err.body ?? err.message : String(err))
    }
  }

  return (
    <div className="page">
      <h1>{t('nav.mcp')}</h1>
      <div className="grid-2">
        <ul className="card-list">
          {catalog.map((c) => (
            <li
              key={c.connectorKey}
              className={`card clickable ${selected?.connectorKey === c.connectorKey ? 'selected' : ''}`}
              onClick={() => setSelected(c)}
            >
              <div className="card-title">{c.displayName}</div>
              <div className="muted">{c.connectorKey}</div>
              <p>{c.description}</p>
            </li>
          ))}
        </ul>
        {selected && (
          <form className="card form" onSubmit={onInstall}>
            <h2>{t('mcp.install', { name: selected.displayName })}</h2>
            <label>
              {t('mcp.label')}
              <input value={label} onChange={(e) => setLabel(e.target.value)} />
            </label>
            <label>
              {t('mcp.token')}
              <input type="password" value={token} onChange={(e) => setToken(e.target.value)} required />
            </label>
            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}
            <button type="submit" className="btn primary" disabled={!workspaceId}>
              {t('mcp.installBtn')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
