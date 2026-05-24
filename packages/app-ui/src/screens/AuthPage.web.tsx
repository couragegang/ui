import { AuthPageLayout } from '../components/AuthPageLayout'
import { strings } from '../strings'
import { AuthScreen, type AuthScreenProps } from './AuthScreen'

export type AuthPageProps = AuthScreenProps & {
  onSwitchMode?: () => void
}

export function AuthPage({ mode, onSwitchMode, ...authProps }: AuthPageProps) {
  const isLogin = mode === 'login'

  const footer = onSwitchMode ? (
    <p className="auth-switch muted">
      {isLogin ? strings.auth.noAccount : strings.auth.hasAccount}{' '}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          onSwitchMode()
        }}
      >
        {isLogin ? strings.auth.toRegister : strings.auth.toLogin}
      </a>
    </p>
  ) : null

  return (
    <AuthPageLayout
      title={isLogin ? strings.auth.loginTitle : strings.auth.registerTitle}
      subtitle={isLogin ? strings.auth.loginSubtitle : strings.auth.registerSubtitle}
      footer={footer}
    >
      <AuthScreen
        mode={mode}
        theme="light"
        hideTitle
        hideModeSwitch
        embedded
        {...authProps}
      />
    </AuthPageLayout>
  )
}
