import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { ApiError, createOrganization } from '../lib/api'
import { slugify } from '../lib/slug'

export function CreateOrganizationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { switchOrganization } = useAuth()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return
    setBusy(true)
    setError('')
    try {
      const org = await createOrganization({ name: name.trim(), slug: slug.trim() })
      await switchOrganization(org.id)
      navigate('/chat', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? (err.body ?? err.message) : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page workspace-create-page">
      <div className="row gap workspace-create-head">
        <h1 className="flex-1">{t('org.createTitle')}</h1>
        <Link to="/chat" className="btn ghost">
          {t('workspace.back')}
        </Link>
      </div>
      <p className="muted">{t('org.createHint')}</p>
      <form className="form workspace-create-form" onSubmit={(e) => void onSubmit(e)}>
        <label>
          {t('org.fieldName')}
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>
        <label>
          {t('org.fieldSlug')}
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
          <span className="muted small">{t('workspace.slugHint')}</span>
        </label>
        {error && <p className="error">{error}</p>}
        <div className="row gap">
          <button type="submit" className="btn primary" disabled={busy || !name.trim()}>
            {busy ? '…' : t('org.createSubmit')}
          </button>
          <Link to="/chat" className="btn outline">
            {t('mcp.cancel')}
          </Link>
        </div>
      </form>
    </div>
  )
}
