import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { ApiError, createGroup } from '../lib/api'
import { hasPermission, IAM } from '../lib/permissions'
import { slugify } from '../lib/slug'

export function CreateGroupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { me, setGroupId, refresh } = useAuth()
  const orgId = me?.orgId

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const canManage = hasPermission(me, IAM.GROUP_MANAGE)

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!orgId || !name.trim() || !slug.trim()) return
    setBusy(true)
    setError('')
    try {
      const g = await createGroup(orgId, { name: name.trim(), slug: slug.trim() })
      await setGroupId(g.id)
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
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="page">
        <h1>{t('group.createTitle')}</h1>
        <p className="muted">{t('group.createNoPermission')}</p>
        <Link to="/chat" className="btn outline">
          {t('workspace.back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="page workspace-create-page">
      <div className="row gap workspace-create-head">
        <h1 className="flex-1">{t('group.createTitle')}</h1>
        <Link to="/chat" className="btn ghost">
          {t('workspace.back')}
        </Link>
      </div>
      <p className="muted">{t('group.createHint')}</p>
      <form className="form workspace-create-form" onSubmit={(e) => void onSubmit(e)}>
        <label>
          {t('group.fieldName')}
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>
        <label>
          {t('group.fieldSlug')}
          <input
            className="input mono"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
            required
            pattern="[a-z0-9-]+"
          />
          <span className="muted small">{t('group.slugReserved')}</span>
        </label>
        {error && <p className="error">{error}</p>}
        <div className="row gap">
          <button type="submit" className="btn primary" disabled={busy || !name.trim()}>
            {busy ? '…' : t('group.createSubmit')}
          </button>
          <Link to="/chat" className="btn outline">
            {t('mcp.cancel')}
          </Link>
        </div>
      </form>
    </div>
  )
}
