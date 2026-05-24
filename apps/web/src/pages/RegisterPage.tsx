import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthScreen } from '@couragegang/app-ui/screens'

import { AuthPageLayout } from '../components/auth/AuthPageLayout'
import { RnHost } from '../components/RnHost'

/** @deprecated Используйте `routes/RegisterRoute`. */
export function RegisterPage() {
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
      <RnHost>
        <AuthScreen
          mode="register"
          theme="light"
          hideTitle
          hideModeSwitch
          returnPath={returnTo.startsWith('/') ? returnTo : '/chat'}
          onSuccess={() => navigate(returnTo.startsWith('/') ? returnTo : '/chat')}
          onSwitchMode={() => navigate(loginTo)}
        />
      </RnHost>
    </AuthPageLayout>
  )
}
