import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthPage } from '@couragegang/app-ui/screens'

import { RnHost } from '../components/RnHost'

export function LoginRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/chat'

  const registerTo =
    returnTo && returnTo !== '/chat'
      ? `/register?returnTo=${encodeURIComponent(returnTo)}`
      : '/register'

  return (
    <RnHost>
      <AuthPage
        mode="login"
        returnPath={returnTo.startsWith('/') ? returnTo : '/chat'}
        onSuccess={() => navigate(returnTo.startsWith('/') ? returnTo : '/chat')}
        onSwitchMode={() => navigate(registerTo)}
      />
    </RnHost>
  )
}
