import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RegisterScreen } from '@couragegang/app-ui/screens'

import { AuthDivider, AuthPageLayout } from '../components/auth/AuthPageLayout'
import { OAuthProviderButtons } from '../components/auth/OAuthProviderButtons'
import { RnHost } from '../components/RnHost'

export function RegisterRoute() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/chat'

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
      <RnHost>
        <RegisterScreen
          theme="light"
          hideTitle
          onSuccess={() => navigate(returnTo.startsWith('/') ? returnTo : '/chat')}
          onGoLogin={() => navigate(loginTo)}
        />
      </RnHost>
    </AuthPageLayout>
  )
}
