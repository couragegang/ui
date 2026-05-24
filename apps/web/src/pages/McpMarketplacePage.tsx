import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { fetchCatalog } from '../lib/api'
import type { McpCatalogItem } from '../lib/types'
import { McpInstallModal } from '../components/mcp/McpInstallModal'

export function McpMarketplacePage() {
  const { t } = useTranslation()
  const { workspaces, workspaceId, me } = useAuth()
  const [catalog, setCatalog] = useState<McpCatalogItem[]>([])
  const [selected, setSelected] = useState<McpCatalogItem | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  function loadCatalog() {
    setLoading(true)
    void fetchCatalog()
      .then((c) => setCatalog(c.items ?? []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCatalog()
  }, [])

  return (
    <div className="page">
      <h1>{t('nav.mcp')}</h1>
      <p className="muted">{t('mcp.marketplaceHint')}</p>

      {loading && <p className="muted">{t('common.loading')}</p>}
      {error && <p className="error">{error}</p>}

      <ul className="card-list marketplace-grid">
        {catalog.map((c) => (
          <li key={c.connectorKey}>
            <button
              type="button"
              className="card clickable marketplace-card"
              onClick={() => setSelected(c)}
            >
              <div className="card-title">{c.displayName ?? c.connectorKey}</div>
              <div className="muted">{c.connectorKey}</div>
              {c.description && <p>{c.description}</p>}
              <span className="badge">{t('mcp.addTool')}</span>
            </button>
          </li>
        ))}
      </ul>

      {!loading && catalog.length === 0 && !error && (
        <p className="muted center">{t('mcp.catalogEmpty')}</p>
      )}

      {selected && (
        <McpInstallModal
          item={selected}
          workspaces={workspaces}
          initialWorkspaceId={workspaceId}
          permissions={me?.permissions}
          onClose={() => setSelected(null)}
          onInstalled={loadCatalog}
        />
      )}
    </div>
  )
}
