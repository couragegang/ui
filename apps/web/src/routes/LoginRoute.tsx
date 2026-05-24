import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthScreen } from '@couragegang/app-ui/screens'

import { AuthPageLayout } from '../components/auth/AuthPageLayout'
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
      <RnHost>
        <AuthScreen
          mode="login"
          theme="light"
          hideTitle
          hideModeSwitch
          returnPath={returnTo.startsWith('/') ? returnTo : '/chat'}
          onSuccess={() => navigate(returnTo.startsWith('/') ? returnTo : '/chat')}
        />
      </RnHost>
    </AuthPageLayout>
  )
}
