import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LoginScreen } from '@couragegang/app-ui/screens'

import { AuthDivider, AuthPageLayout } from '../components/auth/AuthPageLayout'
import { OAuthProviderButtons } from '../components/auth/OAuthProviderButtons'
import { RnHost } from '../components/RnHost'

export function LoginRoute() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/chat'

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
      <RnHost>
        <LoginScreen
          theme="light"
          hideTitle
          onSuccess={() => navigate(returnTo.startsWith('/') ? returnTo : '/chat')}
        />
      </RnHost>
    </AuthPageLayout>
  )
}
