import { Redirect, useRouter } from 'expo-router'
import { RegisterScreen } from '@couragegang/app-ui/screens'
import { useAuth } from '@couragegang/app-ui'

export default function RegisterRoute() {
  const router = useRouter()
  const auth = useAuth()

  if (!auth.loading && auth.me) {
    return <Redirect href="/(app)/chat" />
  }

  return (
    <RegisterScreen
      onSuccess={() => router.replace('/(app)/onboarding/tools')}
      onGoLogin={() => router.replace('/login')}
    />
  )
}
