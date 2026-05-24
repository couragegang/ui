import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthPage } from '@couragegang/app-ui/screens'

import { RnHost } from '../components/RnHost'

export function RegisterRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/chat'

  const loginTo =
    returnTo && returnTo !== '/chat'
      ? `/login?returnTo=${encodeURIComponent(returnTo)}`
      : '/login'

  return (
    <RnHost>
      <AuthPage
        mode="register"
        returnPath={returnTo.startsWith('/') ? returnTo : '/chat'}
        onSuccess={() => navigate(returnTo.startsWith('/') ? returnTo : '/chat')}
        onSwitchMode={() => navigate(loginTo)}
      />
    </RnHost>
  )
}
