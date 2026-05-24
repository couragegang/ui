import { useState } from 'react'
import type { BffApi } from '@couragegang/api-client'
import { ApiError } from '@couragegang/api-client'
import { useWorkspaceInstallations } from '@couragegang/shared/hooks'
import type { McpInstallation } from '@couragegang/shared/types'

import { McpInstallationEditSheet } from '../components/McpInstallationEditSheet'
import { useAuth } from '../context/AuthProvider'
import { strings } from '../strings'

export type McpConnectionsScreenProps = {
  api: BffApi
  onAddMore?: () => void
}

export function McpConnectionsScreen({ api, onAddMore }: McpConnectionsScreenProps) {
  const { workspaceId } = useAuth()
  const { items, loading, error, reload } = useWorkspaceInstallations(api, workspaceId)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState<McpInstallation | null>(null)

  if (!workspaceId) {
    return <p className="muted">{strings.context.noWorkspace}</p>
  }

  async function onHealth(item: McpInstallation) {
    setBusyId(item.id)
    setMessage('')
    try {
      const res = (await api.healthInstallation(workspaceId!, item.id)) as {
        ok?: boolean
        message?: string
      }
      setMessage(res.ok ? strings.connections.healthOk : strings.connections.healthFail(res.message ?? ''))
      await reload()
    } catch (e) {
      setMessage(String(e))
    } finally {
      setBusyId(null)
    }
  }

  async function onDelete(item: McpInstallation) {
    if (!window.confirm(strings.connections.deleteConfirm)) return
    setBusyId(item.id)
    try {
      await api.deleteInstallation(workspaceId!, item.id)
      setMessage(strings.connections.deleted)
      await reload()
    } catch (e) {
      setMessage(e instanceof ApiError ? (e.body ?? e.message) : String(e))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="page">
      <div className="row gap connections-head">
        <h1 className="flex-1">{strings.connections.title}</h1>
        {onAddMore && (
          <button type="button" className="btn outline" onClick={onAddMore}>
            {strings.connections.addMore}
          </button>
        )}
        <button type="button" className="btn ghost" disabled={loading} onClick={() => void reload()}>
          {strings.common.refresh}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      {items.length === 0 && !loading && <p className="muted">{strings.connections.empty}</p>}

      <ul className="card-list">
        {items.map((item) => (
          <li key={item.id} className="card">
            <div className="card-title">{item.displayLabel ?? item.connectorKey}</div>
            <div className="muted">{item.connectorKey}</div>
            <span className={`badge status-${item.status ?? 'active'}`}>{item.status ?? 'active'}</span>
            <div className="row gap connections-actions">
              <button
                type="button"
                className="btn outline"
                disabled={busyId === item.id}
                onClick={() => setEditing(item)}
              >
                {strings.connections.edit}
              </button>
              <button
                type="button"
                className="btn ghost"
                disabled={busyId === item.id}
                onClick={() => void onHealth(item)}
              >
                {strings.connections.health}
              </button>
              <button
                type="button"
                className="btn ghost"
                disabled={busyId === item.id}
                onClick={() => void onDelete(item)}
              >
                {strings.connections.delete}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <McpInstallationEditSheet
        api={api}
        workspaceId={workspaceId}
        installation={editing}
        visible={!!editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          setMessage(strings.connections.saved)
          void reload()
        }}
      />
    </div>
  )
}
