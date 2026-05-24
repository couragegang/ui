import { Redirect, useRouter } from 'expo-router'
import { AuthScreen } from '@couragegang/app-ui/screens'
import { useAuth } from '@couragegang/app-ui'

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://ai-test.valoriel.ru/api'

export default function RegisterRoute() {
  const router = useRouter()
  const auth = useAuth()

  if (!auth.loading && auth.me) {
    return <Redirect href="/(app)/chat" />
  }

  return (
    <AuthScreen
      mode="register"
      apiBaseUrl={API_BASE}
      returnPath="/chat"
      onSuccess={() => router.replace('/(app)/onboarding/tools')}
      onSwitchMode={() => router.replace('/login')}
    />
  )
}
