import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { approvePending, fetchPendingApprovals, rejectPending } from '../lib/api'
import type { PendingApproval } from '../lib/types'

export function HitlPage() {
  const { t } = useTranslation()
  const { me, workspaceId } = useAuth()
  const org = me?.orgId
  const [items, setItems] = useState<PendingApproval[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!org || !workspaceId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetchPendingApprovals(org, workspaceId)
      setItems(res.items ?? [])
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [org, workspaceId])

  useEffect(() => {
    void load()
  }, [load])

  async function decide(id: string, action: 'approve' | 'reject') {
    if (!me?.userId) return
    try {
      if (action === 'approve') await approvePending(id, me.userId)
      else await rejectPending(id, me.userId)
      await load()
    } catch (e) {
      setError(String(e))
    }
  }

  if (!workspaceId) return <p className="muted">{t('context.noWorkspace')}</p>

  return (
    <div className="page">
      <h1>{t('nav.hitl')}</h1>
      <button type="button" className="btn ghost" onClick={() => void load()} disabled={loading}>
        {t('common.refresh')}
      </button>
      {error && <p className="error">{error}</p>}
      {items.length === 0 && !loading && <p className="muted">{t('hitl.empty')}</p>}
      <ul className="card-list">
        {items.map((p) => (
          <li key={p.id} className="card">
            <div className="card-title">{p.toolName ?? p.id}</div>
            <div className="muted">{p.status}</div>
            <div className="row gap">
              <button type="button" className="btn primary" onClick={() => void decide(p.id, 'approve')}>
                {t('hitl.approve')}
              </button>
              <button type="button" className="btn outline" onClick={() => void decide(p.id, 'reject')}>
                {t('hitl.reject')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
