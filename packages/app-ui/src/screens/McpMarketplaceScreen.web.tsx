import { useCallback, useEffect, useState } from 'react'
import type { BffApi } from '@couragegang/api-client'
import { localizedLabel } from '@couragegang/shared/mcp'
import type { McpCatalogItem } from '@couragegang/shared/types'

import { McpInstallSheet } from '../components/McpInstallSheet'
import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'

export type McpMarketplaceScreenProps = {
  api: BffApi
  onInstalled?: () => void
}

export function McpMarketplaceScreen({ api, onInstalled }: McpMarketplaceScreenProps) {
  const { workspaceId } = useAuth()
  const [catalog, setCatalog] = useState<McpCatalogItem[]>([])
  const [selected, setSelected] = useState<McpCatalogItem | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = (await api.catalog()) as { items?: McpCatalogItem[] }
      setCatalog(res.items ?? [])
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    void load()
  }, [load])

  if (!workspaceId) {
    return <p className="muted">{strings.context.noWorkspace}</p>
  }

  return (
    <div className="page">
      <h1>{strings.nav.marketplace}</h1>
      <p className="muted">{strings.mcp.marketplaceHint}</p>

      {loading && <p className="muted">{strings.common.loading}</p>}
      {error && <p className="error">{error}</p>}

      <ul className="card-list marketplace-grid">
        {catalog.map((item) => (
          <li key={item.connectorKey}>
            <button
              type="button"
              className="card clickable marketplace-card"
              onClick={() => setSelected(item)}
            >
              <div className="card-title">
                {localizedLabel(item.displayName, item.connectorKey)}
              </div>
              <div className="muted">{item.connectorKey}</div>
              {item.description ? <p>{item.description}</p> : null}
              <span className="badge">{strings.mcp.addTool}</span>
            </button>
          </li>
        ))}
      </ul>

      {!loading && catalog.length === 0 && !error && (
        <p className="muted center">{strings.mcp.catalogEmpty}</p>
      )}

      <McpInstallSheet
        api={api}
        item={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
        onInstalled={() => {
          setSelected(null)
          void load()
          onInstalled?.()
        }}
      />
    </div>
  )
}
