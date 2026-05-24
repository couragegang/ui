import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import { AuthDivider, AuthPageLayout } from '../components/auth/AuthPageLayout'
import { OAuthProviderButtons } from '../components/auth/OAuthProviderButtons'

export function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/chat'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        email,
        password,
        displayName,
        organizationName: organizationName || undefined,
      })
      navigate(returnTo.startsWith('/') ? returnTo : '/chat')
    } catch (err) {
      setError(err instanceof ApiError ? err.body ?? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const loginTo =
    returnTo && returnTo !== '/chat'
      ? `/login?returnTo=${encodeURIComponent(returnTo)}`
      : '/login'

  return (
    <AuthPageLayout
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      footer={
        <p className="auth-switch muted">
          {t('auth.hasAccount')}{' '}
          <Link to={loginTo}>{t('auth.toLogin')}</Link>
        </p>
      }
    >
      <OAuthProviderButtons returnTo={returnTo} mode="register" />
      <AuthDivider />
      <form onSubmit={onSubmit} className="form auth-form">
        <label>
          {t('auth.email')}
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          {t('auth.password')}
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={10}
          />
        </label>
        <label>
          {t('auth.displayName')}
          <input
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </label>
        <label>
          {t('auth.orgName')}
          <input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
          <span className="muted small">{t('auth.orgNameHint')}</span>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn primary auth-submit" disabled={loading}>
          {loading ? t('common.loading') : t('auth.register')}
        </button>
      </form>
    </AuthPageLayout>
  )
}
