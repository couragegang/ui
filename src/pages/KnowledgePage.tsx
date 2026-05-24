import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { knowledgeSearch } from '../lib/api'
import type { KnowledgeHit } from '../lib/types'

export function KnowledgePage() {
  const { t } = useTranslation()
  const { me, workspaceId } = useAuth()
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<KnowledgeHit[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSearch(e: FormEvent) {
    e.preventDefault()
    if (!me?.orgId || !workspaceId || !query.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await knowledgeSearch(me.orgId, workspaceId, query.trim())
      setHits(res.items ?? [])
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  if (!workspaceId) return <p className="muted">{t('context.noWorkspace')}</p>

  return (
    <div className="page">
      <h1>{t('nav.knowledge')}</h1>
      <form className="row gap" onSubmit={onSearch}>
        <input
          className="flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('knowledge.placeholder')}
        />
        <button type="submit" className="btn primary" disabled={loading}>
          {t('knowledge.search')}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul className="card-list">
        {hits.map((h, i) => (
          <li key={i} className="card">
            <div className="card-title">{h.title ?? t('knowledge.untitled')}</div>
            <p>{h.snippet}</p>
            {h.externalUri && (
              <a href={h.externalUri} target="_blank" rel="noreferrer">
                {h.externalUri}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
