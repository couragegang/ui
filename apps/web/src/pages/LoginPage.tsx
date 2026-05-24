import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'
import { AuthDivider, AuthPageLayout } from '../components/auth/AuthPageLayout'
import { OAuthProviderButtons } from '../components/auth/OAuthProviderButtons'

export function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/chat'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(returnTo.startsWith('/') ? returnTo : '/chat')
    } catch (err) {
      setError(err instanceof ApiError ? err.body ?? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const registerTo =
    returnTo && returnTo !== '/chat'
      ? `/register?returnTo=${encodeURIComponent(returnTo)}`
      : '/register'

  return (
    <AuthPageLayout
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        <p className="auth-switch muted">
          {t('auth.noAccount')}{' '}
          <Link to={registerTo}>{t('auth.toRegister')}</Link>
        </p>
      }
    >
      <OAuthProviderButtons returnTo={returnTo} />
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn primary auth-submit" disabled={loading}>
          {loading ? t('common.loading') : t('auth.login')}
        </button>
      </form>
    </AuthPageLayout>
  )
}
