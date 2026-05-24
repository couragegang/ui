import { Redirect, useRouter } from 'expo-router'
import { AuthPage } from '@couragegang/app-ui/screens'
import { useAuth } from '@couragegang/app-ui'

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://ai-test.valoriel.ru/api'

export default function LoginRoute() {
  const router = useRouter()
  const auth = useAuth()

  if (!auth.loading && auth.me) {
    return <Redirect href="/(app)/chat" />
  }

  return (
    <AuthPage
      mode="login"
      apiBaseUrl={API_BASE}
      returnPath="/chat"
      onSuccess={() => router.replace('/chat')}
      onSwitchMode={() => router.push('/register')}
    />
  )
}
