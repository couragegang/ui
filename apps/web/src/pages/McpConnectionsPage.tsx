import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ApiError,
  checkInstallationHealth,
  deleteInstallation,
  fetchInstallations,
} from '../lib/api'
import type { McpInstallation } from '../lib/types'
import { McpInstallationEditModal } from '../components/mcp/McpInstallationEditModal'

export function McpConnectionsPage() {
  const { t } = useTranslation()
  const { workspaceId } = useAuth()
  const [items, setItems] = useState<McpInstallation[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState<McpInstallation | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!workspaceId) return
    setError('')
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

  async function onDelete(item: McpInstallation) {
    if (!workspaceId) return
    if (!window.confirm(t('connections.deleteConfirm', { name: item.displayLabel ?? item.connectorKey }))) {
      return
    }
    setBusyId(item.id)
    setMessage('')
    setError('')
    try {
      await deleteInstallation(workspaceId, item.id)
      setMessage(t('connections.deleted'))
      await load()
    } catch (e) {
      setError(e instanceof ApiError ? (e.body ?? e.message) : String(e))
    } finally {
      setBusyId(null)
    }
  }

  async function onHealth(item: McpInstallation) {
    if (!workspaceId) return
    setBusyId(item.id)
    setMessage('')
    setError('')
    try {
      const res = await checkInstallationHealth(workspaceId, item.id)
      setMessage(res.ok ? t('connections.healthOk') : t('connections.healthFail', { msg: res.message ?? '' }))
      await load()
    } catch (e) {
      setError(e instanceof ApiError ? (e.body ?? e.message) : String(e))
    } finally {
      setBusyId(null)
    }
  }

  if (!workspaceId) return <p className="muted">{t('context.noWorkspace')}</p>

  return (
    <div className="page">
      <div className="row gap connections-head">
        <h1 className="flex-1">{t('nav.connections')}</h1>
        <Link to="/mcp" className="btn outline">
          {t('connections.addMore')}
        </Link>
        <button type="button" className="btn ghost" onClick={() => void load()}>
          {t('common.refresh')}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      {items.length === 0 && <p className="muted">{t('connections.empty')}</p>}

      <ul className="card-list">
        {items.map((i) => (
          <li key={i.id} className="card">
            <div className="card-title">{i.displayLabel ?? i.connectorKey}</div>
            <div className="muted">{i.connectorKey}</div>
            <span className={`badge status-${i.status ?? 'active'}`}>{i.status ?? 'active'}</span>
            <div className="row gap connections-actions">
              <button
                type="button"
                className="btn outline"
                disabled={busyId === i.id}
                onClick={() => setEditing(i)}
              >
                {t('connections.edit')}
              </button>
              <button
                type="button"
                className="btn ghost"
                disabled={busyId === i.id}
                onClick={() => void onHealth(i)}
              >
                {t('connections.healthCheck')}
              </button>
              <button
                type="button"
                className="btn ghost"
                disabled={busyId === i.id}
                onClick={() => void onDelete(i)}
              >
                {t('connections.delete')}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing && workspaceId && (
        <McpInstallationEditModal
          workspaceId={workspaceId}
          installation={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setMessage(t('connections.saved'))
            void load()
          }}
        />
      )}
    </div>
  )
}
