import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import {
  ApiError,
  createWorkspace,
  fetchMyGroups,
} from '../lib/api'
import { hasPermission, IAM } from '../lib/permissions'
import { slugify } from '../lib/slug'
import type { OrganizationGroup } from '@couragegang/shared/types'

export function CreateWorkspacePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { me, groupId: activeGroupId, refresh, setWorkspaceId } = useAuth()
  const orgId = me?.orgId

  const [groups, setGroups] = useState<OrganizationGroup[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [formGroupId, setFormGroupId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const canCreate = hasPermission(me, IAM.GROUP_READ)

  useEffect(() => {
    if (!orgId || !canCreate) return
    void fetchMyGroups(orgId)
      .then((res) => {
        const items = res.items ?? []
        setGroups(items)
        const preferred =
          activeGroupId && items.some((g) => g.id === activeGroupId) ? activeGroupId : items[0]?.id
        if (preferred) setFormGroupId(preferred)
      })
      .catch((e) => setError(e instanceof ApiError ? (e.body ?? e.message) : String(e)))
  }, [orgId, canCreate, activeGroupId])

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!orgId || !name.trim() || !slug.trim() || !formGroupId) return
    setBusy(true)
    setError('')
    try {
      const ws = await createWorkspace(orgId, {
        name: name.trim(),
        slug: slug.trim(),
        groupId: formGroupId,
      })
      setWorkspaceId(ws.id)
      await refresh()
      navigate('/chat', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setBusy(false)
    }
  }

  if (!orgId) {
    return (
      <div className="page">
        <p className="muted">{t('profile.noOrg')}</p>
        <Link to="/profile">{t('header.settings')}</Link>
      </div>
    )
  }

  if (!canCreate) {
    return (
      <div className="page">
        <h1>{t('workspace.createTitle')}</h1>
        <p className="muted">{t('workspace.createNoPermission')}</p>
        <Link to="/chat" className="btn outline">
          {t('workspace.back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="page workspace-create-page">
      <div className="row gap workspace-create-head">
        <h1 className="flex-1">{t('workspace.createTitle')}</h1>
        <Link to="/chat" className="btn ghost">
          {t('workspace.back')}
        </Link>
      </div>
      <p className="muted">{t('workspace.createHint')}</p>

      {groups.length === 0 ? (
        <p className="error">{t('workspace.createNoGroups')}</p>
      ) : (
        <form className="form workspace-create-form" onSubmit={(e) => void onSubmit(e)}>
          <label>
            {t('workspace.fieldName')}
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            {t('workspace.fieldSlug')}
            <input
              className="input mono"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              required
              pattern="[a-z0-9-]+"
              title={t('workspace.slugHint')}
            />
            <span className="muted small">{t('workspace.slugHint')}</span>
          </label>
          <label>
            {t('workspace.fieldGroup')}
            <select
              className="select"
              value={formGroupId}
              onChange={(e) => setFormGroupId(e.target.value)}
              required
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                  {g.isDefault ? ` (${t('profile.defaultGroup')})` : ''}
                </option>
              ))}
            </select>
          </label>
          <dl className="kv readonly-meta">
            <dt>{t('workspace.fieldOrg')}</dt>
            <dd className="mono">{orgId}</dd>
          </dl>
          {error && <p className="error">{error}</p>}
          <div className="row gap">
            <button type="submit" className="btn primary" disabled={busy || !name.trim() || !slug.trim()}>
              {busy ? '…' : t('workspace.createSubmit')}
            </button>
            <Link to="/chat" className="btn outline">
              {t('mcp.cancel')}
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
