import { Redirect, useRouter } from 'expo-router'
import { LoginScreen } from '@couragegang/app-ui/screens'
import { useAuth } from '@couragegang/app-ui'

export default function LoginRoute() {
  const router = useRouter()
  const auth = useAuth()

  if (!auth.loading && auth.me) {
    return <Redirect href="/(app)/chat" />
  }

  return (
    <LoginScreen
      onSuccess={() => router.replace('/(app)/onboarding/tools')}
      onGoRegister={() => router.push('/register')}
    />
  )
}
