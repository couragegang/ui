import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { acceptInvite, ApiError } from '../lib/api'

export function AcceptInvitePage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { me, loading, refresh, switchOrganization } = useAuth()
  const orgId = params.get('orgId') ?? ''
  const token = params.get('token') ?? ''
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const started = useRef(false)

  const returnTo = `/accept-invite?orgId=${encodeURIComponent(orgId)}&token=${encodeURIComponent(token)}`

  useEffect(() => {
    if (loading || !me || !orgId || !token || started.current || done) return
    started.current = true
    void (async () => {
      try {
        await acceptInvite(orgId, token)
        await switchOrganization(orgId)
        await refresh()
        setDone(true)
        setTimeout(() => navigate('/profile', { replace: true }), 1500)
      } catch (e) {
        setError(e instanceof ApiError ? (e.body ?? e.message) : String(e))
      }
    })()
  }, [loading, me, orgId, token, done, refresh, navigate])

  if (!orgId || !token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>{t('profile.acceptInvite')}</h1>
          <p className="error">{t('profile.acceptInviteInvalid')}</p>
          <Link to="/login">{t('auth.login')}</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p className="muted center">{t('common.loading')}</p>
      </div>
    )
  }

  if (!me) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>{t('profile.acceptInvite')}</h1>
          <p className="muted">{t('profile.acceptInviteLogin')}</p>
          <p className="row gap">
            <Link className="btn primary" to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
              {t('auth.login')}
            </Link>
            <Link className="btn outline" to={`/register?returnTo=${encodeURIComponent(returnTo)}`}>
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{t('profile.acceptInvite')}</h1>
        {error && <p className="error">{error}</p>}
        {!error && !done && <p className="muted">{t('profile.acceptInviteProcessing')}</p>}
        {done && <p className="success">{t('profile.acceptInviteDone')}</p>}
      </div>
    </div>
  )
}
